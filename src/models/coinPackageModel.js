const db = require("../config/db");

const getAllCoinPackages = async () => {
  const [rows] = await db.query(
    "SELECT * FROM coin_packages WHERE status = 1"
  );
  return rows;
};

const getCoinPackageById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM coin_packages WHERE id = ?",
    [id]
  );
  return rows[0];
};

const addCoinPackage = async (data) => {

  let {
    coins,
    original_price,
    discount_percent,
    price_after_discount,
    minutes
  } = data;

  // Case 1 → If discount % provided
  if (discount_percent && !price_after_discount) {

    price_after_discount =
      original_price - (original_price * discount_percent / 100);

  }

  // Case 2 → If price_after_discount provided
  if (price_after_discount && !discount_percent) {

    discount_percent =
      ((original_price - price_after_discount) / original_price) * 100;

  }

  const [result] = await db.query(
    `INSERT INTO coin_packages
    (coins, original_price, discount_percent, price_after_discount, minutes)
    VALUES (?, ?, ?, ?, ?)`,
    [coins, original_price, discount_percent, price_after_discount, minutes]
  );

  return result;
};

const updateCoinPackage = async (id, data) => {

  let {
    coins,
    original_price,
    discount_percent,
    price_after_discount,
    minutes
  } = data;

  if (discount_percent && !price_after_discount) {

    price_after_discount =
      original_price - (original_price * discount_percent / 100);

  }

  if (price_after_discount && !discount_percent) {

    discount_percent =
      ((original_price - price_after_discount) / original_price) * 100;

  }

  const [result] = await db.query(
    `UPDATE coin_packages
     SET coins=?, original_price=?, discount_percent=?, price_after_discount=?, minutes=?
     WHERE id=?`,
    [coins, original_price, discount_percent, price_after_discount, minutes, id]
  );

  return result;
};

const deleteCoinPackage = async (id) => {

  const [result] = await db.query(
    "UPDATE coin_packages SET status = 0 WHERE id=?",
    [id]
  );

  return result;
};

// const deleteCoinPackage = async (id) => {

//   const [result] = await db.query(
//     "DELETE FROM coin_packages WHERE id = ?",
//     [id]
//   );

//   return result;
// };

module.exports = {
  getAllCoinPackages,
  getCoinPackageById,
  addCoinPackage,
  updateCoinPackage,
  deleteCoinPackage
};