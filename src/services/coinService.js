const db = require("../config/db");
const CoinModel = require("../models/coinModel");

/*
  MALE pays:
    AUDIO = 1 rupee / minute
    VIDEO = 2 rupees / minute

  FEMALE earns:
    1 ring for every 5 minutes
*/

const RATES = {
  AUDIO: 1,
  VIDEO: 2,
};

const femaleSeconds = new Map();
const activeIntervals = new Map();
const warnedSessions = new Set();

function startLiveBilling(session_id, io) {

  if (activeIntervals.has(session_id)) return;

  if (!femaleSeconds.has(session_id)) {
    femaleSeconds.set(session_id, 0);
  }

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

      const rate = RATES[session.type];

      // male is receiver
      const male = await CoinModel.getUserBalanceForUpdate(
        session.receiver_id,
        conn
      );

      /* ============================
         LOW BALANCE WARNING
      ============================ */

      if (
        male.coin_balance < rate * 2 &&
        male.coin_balance >= rate &&
        !warnedSessions.has(session_id)
      ) {
        warnedSessions.add(session_id);

        io?.to(`call:${session_id}`).emit("low_balance_warning", {
          remainingCoins: male.coin_balance,
          secondsLeft: 60,
        });

        io?.to(`video_call:${session_id}`).emit("low_balance_warning", {
          remainingCoins: male.coin_balance,
          secondsLeft: 60,
        });
      }

      /* ============================
         NOT ENOUGH BALANCE
      ============================ */

      if (male.coin_balance < rate) {

        await conn.execute(
          `UPDATE call_sessions
           SET status='ENDED', ended_at=NOW()
           WHERE session_id=?`,
          [session_id]
        );

        await conn.commit();

        stopLiveBilling(session_id);
        warnedSessions.delete(session_id);

        io?.to(`call:${session_id}`).emit("call_insufficient_balance");
        io?.to(`video_call:${session_id}`).emit("call_insufficient_balance");

        return;
      }

      /* ============================
         DEDUCT FROM MALE
      ============================ */

      await CoinModel.updateUserBalance(
        session.receiver_id,
        -rate,
        conn
      );

      await CoinModel.insertTransaction(
        session.receiver_id,     // male
        session.caller_id,       // female
        session_id,
        session.type,
        rate,
        "DEBIT",
        "CALL",
        conn
      );

      /* ============================
         LIVE MALE REMAINING MINUTES
      ============================ */

      const remainingCoins = male.coin_balance - rate;
      const remainingMinutes = Math.floor(remainingCoins / rate);

      io?.to(`call:${session_id}`).emit("male_minutes_update", {
        remainingCoins,
        remainingMinutes,
        ratePerMinute: rate
      });

      io?.to(`video_call:${session_id}`).emit("male_minutes_update", {
        remainingCoins,
        remainingMinutes,
        ratePerMinute: rate
      });

      /* ============================
         FEMALE RING LOGIC
         5 min = 1 ring
      ============================ */

      const prevSeconds = femaleSeconds.get(session_id) || 0;
      const newSeconds = prevSeconds + 60;

      femaleSeconds.set(session_id, newSeconds);

      const prevRings = Math.floor(prevSeconds / 300);
      const newRings  = Math.floor(newSeconds / 300);

      const ringsToAdd = newRings - prevRings;

      /* ============================
         LIVE FEMALE RINGS UPDATE
      ============================ */

      io?.to(`call:${session_id}`).emit("female_rings_update", {
        totalRings: newRings,
        secondsTalked: newSeconds
      });

      io?.to(`video_call:${session_id}`).emit("female_rings_update", {
        totalRings: newRings,
        secondsTalked: newSeconds
      });

      if (ringsToAdd > 0) {

        await CoinModel.updateUserBalance(
          session.caller_id,   // female
          ringsToAdd,
          conn
        );

        await CoinModel.insertTransaction(
          session.caller_id,
          session.receiver_id,
          session_id,
          session.type,
          ringsToAdd,
          "CREDIT",
          "RING_EARN",
          conn
        );
      }

      await conn.commit();

    } catch (err) {

      await conn.rollback();
      console.error("❌ Live billing error:", err.message);

    } finally {
      conn.release();
    }

  }, 60_000); // 1 minute

  activeIntervals.set(session_id, interval);
}


/* ============================
   STOP BILLING
============================ */

function stopLiveBilling(session_id) {

  if (activeIntervals.has(session_id)) {
    clearInterval(activeIntervals.get(session_id));
    activeIntervals.delete(session_id);
  }

  warnedSessions.delete(session_id);
  femaleSeconds.delete(session_id);
}


/* ============================
   FINALIZE SESSION
============================ */

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
