const db = require('../config/db');
const CallService = require('./callServices');

const logger = console;

// Per-minute rates
const RATES = {
  AUDIO: parseInt(process.env.RATE_AUDIO || "5", 10),
  VIDEO: parseInt(process.env.RATE_VIDEO || "10", 10),
};

const COIN_TICK_MS = 60 * 1000; // 1 minute
const LOW_COIN_THRESHOLD = 1;

// -----------------------------------------------
// LAZY LOAD SOCKET.IO SAFELY (avoids crash on startup)
// -----------------------------------------------
let io = null;
function getIOSafe() {
  if (!io) {
    try {
      io = require('../socket').getIO();
    } catch (err) {
      return null; // Socket not ready yet
    }
  }
  return io;
}

// ACTIVE SESSIONS MAP
const activeSessions = new Map();

// -----------------------------------------------
// START BILLING WHEN CALL CONNECTS
// -----------------------------------------------
async function startSessionBilling(session) {
  const [cRows] = await db.query(
    "SELECT coin_balance FROM user WHERE user_id = ? LIMIT 1",
    [session.caller_id]
  );
  const [rRows] = await db.query(
    "SELECT coin_balance FROM user WHERE user_id = ? LIMIT 1",
    [session.receiver_id]
  );

  const caller_balance = cRows[0] ? parseInt(cRows[0].coin_balance || 0, 10) : 0;
  const receiver_balance = rRows[0] ? parseInt(rRows[0].coin_balance || 0, 10) : 0;

  // Save initial snapshot
  await CallService.setInitialBalances(
    session.session_id,
    caller_balance,
    receiver_balance
  );

  activeSessions.set(session.session_id, {
    caller_id: session.caller_id,
    receiver_id: session.receiver_id,
    coin_rate_per_min:
      session.coin_rate_per_min || (session.type ? RATES[session.type] : 1),
  });

  logger.log("Billing started for", session.session_id);
}

function stopSessionBilling(session_id) {
  activeSessions.delete(session_id);
}

// -----------------------------------------------
// ATOMIC DATABASE DEDUCTION
// -----------------------------------------------
async function atomicDeduct(userId, amount) {
  return await CallService.deductCoins(userId, amount);
}

// -----------------------------------------------
// BILLING TICK — RUNS EVERY MINUTE
// -----------------------------------------------
setInterval(async () => {
  if (activeSessions.size === 0) return;

  for (const [session_id, meta] of activeSessions.entries()) {
    try {
      const session = await CallService.getSession(session_id);
      if (!session || session.status !== "CONNECTED") {
        stopSessionBilling(session_id);
        continue;
      }

      const rate = meta.coin_rate_per_min;

      // --------------------------------
      // Deduct caller coins
      // --------------------------------
      const callerRes = await atomicDeduct(meta.caller_id, rate);
      const io = getIOSafe();

      if (!callerRes.ok) {
        await endCallNoCoins(session_id);
        continue;
      }

      await CallService.updateCallerRemaining(session_id, callerRes.newBalance);

      if (callerRes.newBalance === LOW_COIN_THRESHOLD && io) {
        io.to(String(meta.caller_id)).emit("low_coin_warning", {
          session_id,
          remaining_coins: callerRes.newBalance,
        });
      }

      // --------------------------------
      // Deduct receiver coins
      // --------------------------------
      const receiverRes = await atomicDeduct(meta.receiver_id, rate);

      if (!receiverRes.ok) {
        await endCallNoCoins(session_id);
        continue;
      }

      await CallService.updateReceiverRemaining(
        session_id,
        receiverRes.newBalance
      );

      if (receiverRes.newBalance === LOW_COIN_THRESHOLD && io) {
        io.to(String(meta.receiver_id)).emit("low_coin_warning", {
          session_id,
          remaining_coins: receiverRes.newBalance,
        });
      }

      // END IF COINS DROPPED TO ZERO
      if (
        callerRes.newBalance <= 0 ||
        receiverRes.newBalance <= 0
      ) {
        await endCallNoCoins(session_id);
      }
    } catch (err) {
      logger.error("Billing tick error:", session_id, err);
    }
  }
}, COIN_TICK_MS);

// -----------------------------------------------
// FORCE END CALL WHEN COINS RUN OUT
// -----------------------------------------------
async function endCallNoCoins(session_id) {
  try {
    const session = await CallService.getSession(session_id);
    if (!session) return;

    await CallService.endSession(session_id);
    const io = getIOSafe();

   if (io) {
      const callerSocketId = getSocketIdForUser(session.caller_id);
      const receiverSocketId = getSocketIdForUser(session.receiver_id);

      if (callerSocketId) io.to(callerSocketId).emit('call_ended', { session_id, reason: 'NO_COINS' });
      if (receiverSocketId) io.to(receiverSocketId).emit('call_ended', { session_id, reason: 'NO_COINS' });
    }

    stopSessionBilling(session_id);
  } catch (err) {
    logger.error("endCallNoCoins error:", err);
  }
}

// -----------------------------------------------
// FINAL RECONCILIATION AFTER HANGUP
// -----------------------------------------------
async function finalizeOnHangup(session_id) {
  const session = await CallService.getSession(session_id);
  if (!session) return { ok: false, reason: "no_session" };
  if (!session.started_at) return { ok: false, reason: "not_started" };

  const started = new Date(session.started_at).getTime();
  const ended = session.ended_at
    ? new Date(session.ended_at).getTime()
    : Date.now();

  const durationSec = Math.floor((ended - started) / 1000);
  const minutes = Math.ceil(durationSec / 60);
  const rate = session.coin_rate_per_min;
  const totalCost = minutes * rate;

  // Read snapshots
  const callerInitial = parseInt(session.caller_remaining_coins || 0, 10);
  const receiverInitial = parseInt(session.receiver_remaining_coins || 0, 10);

  // Read current balances
  const [[callerRow]] = await db.query(
    "SELECT coin_balance FROM user WHERE user_id=? LIMIT 1",
    [session.caller_id]
  );
  const [[receiverRow]] = await db.query(
    "SELECT coin_balance FROM user WHERE user_id=? LIMIT 1",
    [session.receiver_id]
  );

  const callerCurrent = parseInt(callerRow?.coin_balance || 0, 10);
  const receiverCurrent = parseInt(receiverRow?.coin_balance || 0, 10);

  // Compute already deducted
  const callerAlreadyDeducted = callerInitial - callerCurrent;
  const receiverAlreadyDeducted = receiverInitial - receiverCurrent;

  // Split cost 50-50
  const half = Math.ceil(totalCost / 2);
  const callerRemaining = Math.max(0, half - callerAlreadyDeducted);
  const receiverRemaining = Math.max(0, half - receiverAlreadyDeducted);

  const callerRes =
    callerRemaining > 0
      ? await atomicDeduct(session.caller_id, callerRemaining)
      : { deducted: 0, newBalance: callerCurrent };

  const receiverRes =
    receiverRemaining > 0
      ? await atomicDeduct(session.receiver_id, receiverRemaining)
      : { deducted: 0, newBalance: receiverCurrent };

  stopSessionBilling(session_id);

  return {
    ok: true,
    durationSec,
    minutes,
    totalCost,
    caller: callerRes,
    receiver: receiverRes,
  };
}

module.exports = {
  startSessionBilling,
  stopSessionBilling,
  finalizeOnHangup,
  RATES,
};
