const db = require("../config/db");
const CallService = require("./callServices");

const RATES = {
  AUDIO: 5,
  VIDEO: 10
};

async function startSessionBilling(session) {
  // Nothing here – billing handled on hangup
}

async function finalizeOnHangup(session_id) {
  const session = await CallService.getSession(session_id);
  if (!session || !session.started_at) return;

  const started = new Date(session.started_at).getTime();
  const ended = new Date(session.ended_at).getTime();
  const minutes = Math.ceil((ended - started) / 60000);

  const cost = minutes * session.coin_rate_per_min;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 🔻 MALE PAYS
    await conn.execute(
      `UPDATE user SET coin_balance = coin_balance - ? WHERE user_id=?`,
      [cost, session.caller_id]
    );

    // 🔺 FEMALE EARNS
    await conn.execute(
      `UPDATE user SET coin_balance = coin_balance + ? WHERE user_id=?`,
      [cost, session.receiver_id]
    );

    await conn.commit();
    return { minutes, cost };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

module.exports = {
  startSessionBilling,
  finalizeOnHangup,
  RATES
};
