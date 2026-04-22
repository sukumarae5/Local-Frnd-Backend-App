const db = require("../config/db");
const razorpay = require("../utils/razorpay");
const crypto = require("crypto");

const PurchaseModel = require("../models/purchaseModel");
const CoinModel = require("../models/coinModel");

/* =============================
   CREATE ORDER
============================= */
const createOrder = async (package_id, user_id) => {
  const conn = await db.getConnection();

  try {
    const pkg = await PurchaseModel.getPackageById(package_id, conn);

    if (!pkg) throw new Error("Package not found");

    const order = await razorpay.orders.create({
      amount: pkg.price_after_discount * 100,
      currency: "INR",
      receipt: `user_${user_id}_${Date.now()}`
    });

    return {
      order_id: order.id,
      amount: order.amount,
      coins: pkg.coins
    };

  } finally {
    conn.release();
  }
};

/* =============================
   VERIFY PAYMENT + ADD COINS
============================= */
const verifyPayment = async (payload, user_id) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    package_id
  } = payload;

  /* 🔐 SIGNATURE VERIFY */
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    throw new Error("Invalid payment signature");
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    /* ❌ DUPLICATE CHECK */
    const duplicate = await PurchaseModel.checkDuplicatePayment(
      razorpay_payment_id,
      conn
    );

    if (duplicate) {
      throw new Error("Payment already processed");
    }

    const pkg = await PurchaseModel.getPackageById(package_id, conn);
    if (!pkg) throw new Error("Invalid package");

    /* 🔒 LOCK USER */
    await CoinModel.getUserBalanceForUpdate(user_id, conn);

    /* 💰 ADD COINS */
    await CoinModel.updateUserBalance(user_id, pkg.coins, conn);

    /* 🪙 TRANSACTION ENTRY */
    await CoinModel.insertTransaction(
      user_id,
      null,
      null,
      null,
      pkg.coins,
      "CREDIT",
      "BONUS",
      conn
    );

    /* 💳 SAVE PURCHASE */
    await PurchaseModel.insertPurchase(
      user_id,
      pkg.coins,
      pkg.price_after_discount,
      razorpay_payment_id,
      conn
    );

    await conn.commit();

    return {
      message: "Coins added successfully",
      coins_added: pkg.coins
    };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = {
  createOrder,
  verifyPayment
};