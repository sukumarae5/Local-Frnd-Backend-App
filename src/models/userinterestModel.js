const db = require('../config/db');

const deleteByUserId = async (userId) => {
  const [result] = await db.query(
    "DELETE FROM user_interests WHERE user_id = ?",
    [userId]
  );
  return result.affectedRows;
};

// ➕ Insert multiple interests for a user
const insertMany = async (userId, interestIds) => {
  const values = interestIds.map((interestId) => [userId, interestId]);

  const [result] = await db.query(
    "INSERT INTO user_interests (user_id, interest_id) VALUES ?",
    [values]
  );

  return result.affectedRows;
};

// 📄 Get all interests selected by a user
const getByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT i.id, i.name
     FROM user_interests ui
     JOIN interests i ON ui.interest_id = i.id
     WHERE ui.user_id = ?`,
    [userId]
  );

  return rows;
};

module.exports = {
  deleteByUserId,
  insertMany,
  getByUserId
};
