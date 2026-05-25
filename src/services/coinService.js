const db = require("../config/db");
const CoinModel = require("../models/coinModel");

const RATES = {
  AUDIO: 10,  // 10 coins per minute deducted from Male
  VIDEO: 60,  // 60 coins per minute deducted from Male
};

const FEMALE_EARN_RATE = 10; // Female always gets 10 rings/coins per minute

const activeIntervals = new Map();
const warnedSessions = new Set();
const sessionTimers = new Map();

async function startLiveBilling(session_id, io) {
  if (activeIntervals.has(session_id)) return;

  const [[session]] = await db.execute(
    `SELECT started_at FROM call_sessions WHERE session_id=?`,
    [session_id]
  );

  if (!session) return;

  sessionTimers.set(session_id, {
    startTime: new Date(session.started_at).getTime(),
    firstCharged: false,
    lastChargedAt: 0
  });

  console.log(`🔥 Real-time billing started for session: ${session_id}`);

  const interval = setInterval(async () => {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      // Fetch the call session AND dynamically resolve who is Male and who is Female
      const [[callDetails]] = await conn.execute(
        `SELECT cs.*, 
                u1.gender AS caller_gender, 
                u2.gender AS receiver_gender
         FROM call_sessions cs
         LEFT JOIN user u1 ON cs.caller_id = u1.user_id
         LEFT JOIN user u2 ON cs.receiver_id = u2.user_id
         WHERE cs.session_id = ? FOR UPDATE`,
        [session_id]
      );

      // Verify the call is still connected
      if (!callDetails || callDetails.status !== 'CONNECTED') {
        await conn.rollback();
        stopLiveBilling(session_id);
        return;
      }

      const timer = sessionTimers.get(session_id);
      if (!timer) {
        await conn.rollback();
        return;
      }

      const elapsedSeconds = Math.floor((Date.now() - timer.startTime) / 1000);

      // ❌ Rule: No deductions before the 3rd second
      if (elapsedSeconds < 3) {
        await conn.rollback();
        return;
      }

      /* ==========================================
         INTERVAL/MINUTE CONTROL
      ========================================== */
      if (!timer.firstCharged) {
        // First deduction happens exactly at the 3rd second mark
        timer.firstCharged = true;
        timer.lastChargedAt = elapsedSeconds;
        console.log("💰 First deduction executing at 3rd second threshold...");
      } else {
        // Subsequent charges happen every 60 seconds thereafter
        if (elapsedSeconds - timer.lastChargedAt < 60) {
          await conn.rollback();
          return;
        }
        timer.lastChargedAt = elapsedSeconds;
        console.log("💰 Next minute milestone deduction executing...");
      }

      /* ==========================================
         DYNAMIC GENDER IDENTIFICATION
      ========================================== */
      let maleId = null;
      let femaleId = null;

      if (callDetails.caller_gender === 'Male') {
        maleId = callDetails.caller_id;
        femaleId = callDetails.receiver_id;
      } else if (callDetails.receiver_gender === 'Male') {
        maleId = callDetails.receiver_id;
        femaleId = callDetails.caller_id;
      }

      // Safeguard: Cancel billing loop if gender matching breaks
      if (!maleId || !femaleId) {
        console.error("❌ Critical: Could not distinguish Male/Female entities on session.");
        await conn.rollback();
        stopLiveBilling(session_id);
        return;
      }

      const maleRate = RATES[callDetails.type]; // AUDIO = 10, VIDEO = 60

      // Lock male profile data to fetch real time balance securely
      const male = await CoinModel.getUserBalanceForUpdate(maleId, conn);

      /* ==========================================
         LOW BALANCE & EXHAUSTION HANDLING
      ========================================== */
      if (male.coin_balance < maleRate * 2 && male.coin_balance >= maleRate && !warnedSessions.has(session_id)) {
        warnedSessions.add(session_id);
        const warningPayload = { remainingCoins: male.coin_balance, secondsLeft: 60 };
        io?.to(`call:${session_id}`).emit("low_balance_warning", warningPayload);
        io?.to(`video_call:${session_id}`).emit("low_balance_warning", warningPayload);
      }

      // If Male doesn't have enough coins, force-end the call instantly
      if (male.coin_balance < maleRate) {
        await conn.execute(
          `UPDATE call_sessions SET status='ENDED', ended_at=NOW() WHERE session_id=?`,
          [session_id]
        );
        await conn.commit();

        stopLiveBilling(session_id);
        io?.to(`call:${session_id}`).emit("call_insufficient_balance");
        io?.to(`video_call:${session_id}`).emit("call_insufficient_balance");
        return;
      }

      /* ==========================================
         FINANCIAL BALANCES BALANCING & TRACKING
      ========================================== */
      // 1. Deduct Male balance (10 or 60 coins)
      await CoinModel.updateUserBalance(maleId, -maleRate, conn);
      await CoinModel.insertTransaction(maleId, femaleId, session_id, callDetails.type, maleRate, "DEBIT", "CALL", conn);

      // 2. Increment Female balance (Always gets 10 coins/rings)
      await CoinModel.updateUserRingsBalance(femaleId, FEMALE_EARN_RATE, conn);
      await CoinModel.insertTransaction(femaleId, maleId, session_id, callDetails.type, FEMALE_EARN_RATE, "CREDIT", "RING_EARN", conn);

      /* ==========================================
         REAL-TIME SOCKET BROADCASTS
      ========================================== */
      const remainingCoins = male.coin_balance - maleRate;
      const remainingMinutes = Math.floor(remainingCoins / maleRate);

      io?.to(`call:${session_id}`).emit("male_minutes_update", { remainingCoins, remainingMinutes, ratePerMinute: maleRate });
      io?.to(`video_call:${session_id}`).emit("male_minutes_update", { remainingCoins, remainingMinutes, ratePerMinute: maleRate });

      io?.to(`call:${session_id}`).emit("female_rings_update", { addedRings: FEMALE_EARN_RATE });
      io?.to(`video_call:${session_id}`).emit("female_rings_update", { addedRings: FEMALE_EARN_RATE });

      await conn.commit();
      console.log(`✅ Deduction successfully balanced for session: ${session_id}`);

    } catch (err) {
      await conn.rollback();
      console.error("❌ Critical exception executed inside billing cycle loop:", err);
    } finally {
      conn.release();
    }
  }, 1000); // Changed interval accuracy scanner window up to 1 second resolution

  activeIntervals.set(session_id, interval);
}

/* ============================
   STOP BILLING
============================ */

function stopLiveBilling(session_id) {
  sessionTimers.delete(session_id);

  if (activeIntervals.has(session_id)) {
    clearInterval(activeIntervals.get(session_id));
    activeIntervals.delete(session_id);
  }

  warnedSessions.delete(session_id);
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

    let receiverBalance = 0;
    if (session.receiver_id) {
      const [[receiver]] = await conn.execute(
        `SELECT coin_balance FROM user WHERE user_id=?`,
        [session.receiver_id]
      );
      if (receiver) receiverBalance = receiver.coin_balance;
    }

    await conn.execute(
      `UPDATE call_sessions
       SET caller_remaining_coins=?,
           receiver_remaining_coins=?,
           finalized=1,
           updated_at=NOW()
       WHERE session_id=?`,
      [
        caller ? caller.coin_balance : 0,
        receiverBalance,
        session_id
      ]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error("Error finalizing call metadata on hangup sequence closure:", err);
  } finally {
    conn.release(); // Essential database pool optimization guard
  }
}

/* ============================
   FINAL BILLING ON HANGUP
============================ */

async function runBillingCycle(session_id) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [[session]] = await conn.execute(
      `SELECT * FROM call_sessions WHERE session_id=? FOR UPDATE`,
      [session_id]
    );

    if (!session || session.status !== "CONNECTED") {
      await conn.rollback();
      return;
    }

    let maleId, femaleId;

    if (session.caller_gender === "Male") {
      maleId = session.caller_id;
      femaleId = session.receiver_id;
    } else {
      maleId = session.receiver_id;
      femaleId = session.caller_id;
    }

    const rate = RATES[session.type];

    const male = await CoinModel.getUserBalanceForUpdate(
      maleId,
      conn
    );

    if (male.coin_balance < rate) {
      await conn.rollback();
      return;
    }

    await CoinModel.updateUserBalance(maleId, -rate, conn);

    await CoinModel.insertTransaction(
      maleId,
      femaleId,
      session_id,
      session.type,
      rate,
      "DEBIT",
      "CALL",
      conn
    );

    await CoinModel.updateUserRingsBalance(femaleId, 10, conn);

    await CoinModel.insertTransaction(
      femaleId,
      maleId,
      session_id,
      session.type,
      10,
      "CREDIT",
      "RING_EARN",
      conn
    );

    await conn.commit();

    console.log("💰 FINAL DEDUCTION DONE");

  } catch (err) {
    await conn.rollback();
    console.error("❌ Final billing error:", err);
  } finally {
    conn.release();
  }
}

module.exports = {
  startLiveBilling,
  stopLiveBilling,
  finalizeOnHangup,
  runBillingCycle,
  RATES
};