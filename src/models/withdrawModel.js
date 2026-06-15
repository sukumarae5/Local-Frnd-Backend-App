const db = require("../config/db");

/* =============================
   CREATE WITHDRAW REQUEST
============================= */
const createWithdrawRequest = async (
  user_id,
  rings,
  amount,
  upi_id,
  conn
) => {
  const [result] = await conn.execute(
    `INSERT INTO withdraw_requests
     (user_id, rings, amount, upi_id, status)
     VALUES (?, ?, ?, ?, 'PENDING')`,
    [user_id, rings, amount, upi_id]
  );

  return result.insertId;
};

const updateWithdrawStatus = async (
  id,
  status,
  reference_id,
  conn
) => {
  await conn.execute(
    `UPDATE withdraw_requests
     SET status=?, reference_id=?, updated_at=NOW()
     WHERE id=?`,
    [status, reference_id, id]
  );
};


/* =============================
   CHECK PENDING
============================= */
const checkPendingWithdraw = async (user_id, conn) => {
  const [[row]] = await conn.execute(
    `SELECT id FROM withdraw_requests 
     WHERE user_id=? AND status='PENDING'`,
    [user_id]
  );

  return row;
};

/* =============================
   GET HISTORY
============================= */
const getWithdrawHistory = async (user_id, conn) => {
  const [rows] = await conn.execute(
    `SELECT * FROM withdraw_requests
     WHERE user_id=? ORDER BY created_at DESC`,
    [user_id]
  );

  return rows;
};
const updateStatusByReference = async (reference_id, status) => {
  const conn = await db.getConnection();

  try {
    await conn.execute(
      `UPDATE withdraw_requests
       SET status=?, processed_at=NOW()
       WHERE reference_id=?`,
      [status, reference_id]
    );
  } finally {
    conn.release();
  }
};

module.exports = {
  createWithdrawRequest,
  updateWithdrawStatus,
  checkPendingWithdraw,
  getWithdrawHistory,
  updateStatusByReference
};