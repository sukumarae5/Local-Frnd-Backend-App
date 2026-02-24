const db = require("../config/db");

/* ======================================================
   🪙 INSERT COIN TRANSACTION
====================================================== */
const insertTransaction = async (
  user_id,
  peer_user_id,
  session_id,
  call_type,
  amount,
  direction,
  reason,
  conn
) => {
  const sql = `
    INSERT INTO coin_transactions
    (user_id, peer_user_id, session_id, call_type, amount, direction, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // ✅ Use transaction connection if provided
  if (conn) {
    await conn.execute(sql, [
      user_id,
      peer_user_id,
      session_id,
      call_type,
      amount,
      direction,
      reason,
    ]);
  } else {
    await db.execute(sql, [
      user_id,
      peer_user_id,
      session_id,
      call_type,
      amount,
      direction,
      reason,
    ]);
  }
};

/* ======================================================
   🔒 GET USER BALANCE (LOCKED)
====================================================== */
const getUserBalanceForUpdate = async (user_id, conn) => {
  const sql = `
    SELECT coin_balance
    FROM user
    WHERE user_id = ?
    FOR UPDATE
  `;

  const [[row]] = await conn.execute(sql, [user_id]);
  return row;
};

/* ======================================================
   💰 UPDATE USER BALANCE
====================================================== */
const updateUserBalance = async (user_id, amount, conn) => {
  const sql = `
    UPDATE user
    SET coin_balance = coin_balance + ?,
        updates_at = NOW()
    WHERE user_id = ?
  `;

  await conn.execute(sql, [amount, user_id]);
};

module.exports = {
  insertTransaction,
  getUserBalanceForUpdate,
  updateUserBalance,
};
