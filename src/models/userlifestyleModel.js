const db = require('../config/db');

const deleteByUser = async (user_id) => {
  await db.query("DELETE FROM user_lifestyles WHERE user_id = ?", [user_id]);
};

const insertMany = async (user_id, lifestyleIds) => {
  const values = lifestyleIds.map(id => [user_id, id]);

  await db.query(
    "INSERT INTO user_lifestyles (user_id, lifestyle_id) VALUES ?",
    [values]
  );
};

const getByUser = async (user_id) => {
  const [rows] = await db.query(`
    SELECT c.name AS category, l.name AS lifestyle
    FROM user_lifestyles ul
    JOIN lifestyles l ON ul.lifestyle_id = l.id
    JOIN lifestyle_categories c ON l.category_id = c.id
    WHERE ul.user_id = ?
  `, [user_id]);

  return rows;
};

module.exports = { deleteByUser, insertMany, getByUser };
