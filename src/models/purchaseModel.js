const db = require("../config/db");

const getPackageById = async (id, conn) => {
  const [[row]] = await conn.execute(
    "SELECT * FROM coin_packages WHERE id=? AND status=1",
    [id]
  );
  return row;
};

const insertPurchase = async (
  user_id,
  coins,
  amount,
  payment_id,
  conn
) => {
  await conn.execute(
    `INSERT INTO transactions
    (user_id, type, amount_coins, real_money_amount, platform_transaction_id, platform)
    VALUES (?, 'PURCHASE', ?, ?, ?, 'Razorpay')`,
    [user_id, coins, amount, payment_id]
  );
};

const checkDuplicatePayment = async (payment_id, conn) => {
  const [[row]] = await conn.execute(
    "SELECT transaction_id FROM transactions WHERE platform_transaction_id=?",
    [payment_id]
  );
  return row;
};

module.exports = {
  getPackageById,
  insertPurchase,
  checkDuplicatePayment
};