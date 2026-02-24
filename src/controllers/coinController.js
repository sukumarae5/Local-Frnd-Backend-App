const db = require("../config/db");

exports.wallet = async (req, res) => {
  const user_id = req.user.user_id;

  const [[balance]] = await db.execute(
    `SELECT coin_balance FROM user WHERE user_id=?`,
    [user_id]
  );

  const [history] = await db.execute(
    `SELECT * FROM coin_transactions
     WHERE user_id=?
     ORDER BY created_at DESC
     LIMIT 50`,
    [user_id]
  );

  res.json({
    balance: balance.coin_balance,
    transactions: history,
  });
};
