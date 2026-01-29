const db = require("../config/db");
const CoinModel = require("../models/coinModel");


const RATES = {
  AUDIO: 5,
  VIDEO: 10,
};


const activeIntervals = new Map(); 
const warnedSessions = new Set();  


function startLiveBilling(session_id, io) {
  if (activeIntervals.has(session_id)) return;

  const interval = setInterval(async () => {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      
      const [[session]] = await conn.execute(
        `SELECT * FROM call_sessions WHERE session_id=? FOR UPDATE`,
        [session_id]
      );

      if (!session || session.status !== "CONNECTED") {
        await conn.rollback();
        stopLiveBilling(session_id);
        return;
      }

      const rate = session.coin_rate_per_min;

      const caller = await CoinModel.getUserBalanceForUpdate(
        session.caller_id,
        conn
      );

     
      if (
        caller.coin_balance < rate * 2 &&
        caller.coin_balance >= rate &&
        !warnedSessions.has(session_id)
      ) {
        warnedSessions.add(session_id);

        io?.to(`call:${session_id}`).emit("low_balance_warning", {
          remainingCoins: caller.coin_balance,
          secondsLeft: 10,
        });

        setTimeout(async () => {
          const conn2 = await db.getConnection();
          try {
            await conn2.beginTransaction();

            const [[latest]] = await conn2.execute(
              `SELECT coin_balance FROM user WHERE user_id=? FOR UPDATE`,
              [session.caller_id]
            );

            if (latest.coin_balance < rate) {
              await conn2.execute(
                `UPDATE call_sessions 
                 SET status='ENDED', ended_at=NOW() 
                 WHERE session_id=?`,
                [session_id]
              );

              stopLiveBilling(session_id);
              warnedSessions.delete(session_id);

              io?.to(`call:${session_id}`).emit(
                "call_insufficient_balance"
              );
            }

            await conn2.commit();
          } catch (e) {
            await conn2.rollback();
          } finally {
            conn2.release();
          }
        }, 10_000);
      }

    
      if (caller.coin_balance < rate) {
        await conn.rollback();
        stopLiveBilling(session_id);
        warnedSessions.delete(session_id);
        return;
      }

      
      await CoinModel.updateUserBalance(
        session.caller_id,
        -rate,
        conn
      );

      await CoinModel.insertTransaction(
        session.caller_id,        
        session.receiver_id,      
        session_id,
        session.type,
        rate,
        "DEBIT",
        "CALL",
        conn
      );

      
      await CoinModel.updateUserBalance(
        session.receiver_id,
        rate,
        conn
      );

      await CoinModel.insertTransaction(
        session.receiver_id,     
        session.caller_id,        
        session_id,
        session.type,
        rate,
        "CREDIT",
        "CALL",
        conn
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      console.error("❌ Live billing error:", err.message);
    } finally {
      conn.release();
    }
  }, 60_000); 

  activeIntervals.set(session_id, interval);
}


function stopLiveBilling(session_id) {
  if (activeIntervals.has(session_id)) {
    clearInterval(activeIntervals.get(session_id));
    activeIntervals.delete(session_id);
  }
  warnedSessions.delete(session_id);
}


async function finalizeOnHangup(session_id) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [[session]] = await conn.execute(
      `SELECT * FROM call_sessions WHERE session_id=? FOR UPDATE`,
      [session_id]
    );

    if (!session || session.finalized === 1) {
      await conn.rollback();
      return;
    }

    const [[caller]] = await conn.execute(
      `SELECT coin_balance FROM user WHERE user_id=?`,
      [session.caller_id]
    );

    const [[receiver]] = await conn.execute(
      `SELECT coin_balance FROM user WHERE user_id=?`,
      [session.receiver_id]
    );

    await conn.execute(
      `UPDATE call_sessions
       SET caller_remaining_coins=?,
           receiver_remaining_coins=?,
           finalized=1,
           updated_at=NOW()
       WHERE session_id=?`,
      [
        caller.coin_balance,
        receiver.coin_balance,
        session_id,
      ]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  startLiveBilling,
  stopLiveBilling,
  finalizeOnHangup,
  RATES,
};
