const db = require("../config/db");
const payoutHelper = require("../utils/payoutHelper");
const WithdrawModel = require("../models/withdrawModel");

const MIN_WITHDRAW = 10;

const createWithdraw = async (user_id, rings, upi_id) => {
  const conn = await db.getConnection();
console.log("Initiating withdraw for user_id:", user_id, "rings:", rings, "upi_id:", upi_id); // ✅ Debug log 
  try {
    await conn.beginTransaction();

    const [[user]] = await conn.execute(
      "SELECT name, rings_balance FROM user WHERE user_id=? FOR UPDATE",
      [user_id]
    );

    if (!user) throw new Error("User not found");

    if (rings < MIN_WITHDRAW)
      throw new Error(`Minimum ${MIN_WITHDRAW} rings required`);

    if (rings > user.rings_balance)
      throw new Error("Insufficient balance");

    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(upi_id))
      throw new Error("Invalid UPI ID");

    const pending = await WithdrawModel.checkPendingWithdraw(
      user_id,
      conn
    );

    if (pending)
      throw new Error("Pending withdraw already exists");

    const amount = rings * 1.2;

    /* 💸 Deduct */
    await conn.execute(
      `UPDATE user 
       SET rings_balance = rings_balance - ?, updates_at = NOW()
       WHERE user_id=?`,
      [rings, user_id]
    );

    /* 🧾 Create request */
    const requestId =
      await WithdrawModel.createWithdrawRequest(
        user_id,
        rings,
        amount,
        upi_id,
        conn
      );

    /* 🔥 Razorpay */
    const contact = await payoutHelper.createContact(user.name);

    const fund = await payoutHelper.createFundAccount(
      contact.id,
      upi_id
    );

    const payout = await payoutHelper.createPayout(
      fund.id,
      amount,
      requestId
    );

    console.log("Payout created:", payout.id); // ✅ Debug log
    /* ✅ ONLY THIS */
    await WithdrawModel.updateWithdrawStatus(
      requestId,
      "PROCESSING",
      payout.id,
      conn
    );

    await conn.execute(
      `INSERT INTO transactions
      (user_id, type, amount_coins, real_money_amount, platform)
      VALUES (?, 'WITHDRAW', ?, ?, 'Razorpay')`,
      [user_id, rings, amount]
    );

    await conn.commit();

    return {
      message: "Withdraw initiated",
      payout_id: payout.id
    };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const getHistory = async (user_id) => {
  const conn = await db.getConnection();

  try {
    return await WithdrawModel.getWithdrawHistory(user_id, conn);
  } finally {
    conn.release();
  }
};

module.exports = {
  createWithdraw,
  getHistory
};