const withdrawService = require("../services/withdrawService");
const WithdrawModel = require("../models/withdrawModel");

/* =============================
   CREATE WITHDRAW
============================= */
const createWithdraw = async (req, res) => {
  console.log("Create Withdraw Request:", req.body); // ✅ Debug log  

  try {
    const { rings, upi_id } = req.body;
    const user_id = req.user.user_id;

    const data = await withdrawService.createWithdraw(
      user_id,
      rings,
      upi_id
    );

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/* =============================
   HISTORY
============================= */
const getHistory = async (req, res) => {
  console.log("Get Withdraw History for user:", req.user.user_id); // ✅ Debug log
  try {
    const user_id = req.user.user_id;

    const data = await withdrawService.getHistory(user_id);

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


const handleWebhook = async (req, res) => {
  const event = req.body.event;
  const payload = req.body.payload;

  try {
    const payout = payload?.payout?.entity;

    if (!payout) return res.json({ success: true });

    const payoutId = payout.id;

    if (event === "payout.processed") {
      await WithdrawModel.updateStatusByReference(
        payoutId,
        "SUCCESS"
      );
    }

    if (event === "payout.failed") {
      // ❌ IMPORTANT: refund user
      const conn = await db.getConnection();

      try {
        await conn.beginTransaction();

        const [[withdraw]] = await conn.execute(
          `SELECT user_id, rings FROM withdraw_requests
           WHERE reference_id=?`,
          [payoutId]
        );

        if (withdraw) {
          await conn.execute(
            `UPDATE user 
             SET rings_balance = rings_balance + ?
             WHERE user_id=?`,
            [withdraw.rings, withdraw.user_id]
          );

          await WithdrawModel.updateStatusByReference(
            payoutId,
            "FAILED"
          );
        }

        await conn.commit();

      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createWithdraw,
  getHistory,
  handleWebhook   // ✅ export it
};
