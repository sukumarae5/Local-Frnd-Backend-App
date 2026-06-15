const payoutClient = require("./razorpayPayout");

/* CREATE CONTACT */

console.log("FULL CLIENT:", payoutClient);
console.log("contacts:", payoutClient?.contacts);
console.log("fundAccounts:", payoutClient?.fundAccounts);
console.log("payouts:", payoutClient?.payouts);
const createContact = async (name) => {
  return await payoutClient.contacts.create({
    name,
    type: "customer",
    reference_id: "user_" + Date.now()
  });
};

/* CREATE FUND ACCOUNT */
const createFundAccount = async (contact_id, upi_id) => {
  return await payoutClient.fundAccounts.create({
    contact_id,
    account_type: "vpa",
    vpa: {
      address: upi_id
    }
  });
};

/* CREATE PAYOUT */
const createPayout = async (fund_account_id, amount, requestId) => {
  return await payoutClient.payouts.create({
    account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
    fund_account_id,
    amount: amount * 100,
    currency: "INR",
    mode: "UPI",
    purpose: "payout",
    queue_if_low_balance: true,
    reference_id: "withdraw_" + requestId, // ✅ idempotent
    narration: "Rings Withdraw"
  });
};

module.exports = {
  createContact,
  createFundAccount,
  createPayout
};