const db = require('../config/db');

// ➕ Create Interest
const create = async (name) => {
  const [result] = await db.query(
    "INSERT INTO interests (name) VALUES (?)",
    [name]
  );
  return result.insertId;
};

// ✏️ Update Interest
const update = async (id, name) => {
  const [result] = await db.query(
    "UPDATE interests SET name = ? WHERE id = ?",
    [name, id]
  );
  return result.affectedRows;
};


const getAll = async () => {
  const [rows] = await db.query(
    "SELECT id, name, created_at FROM interests ORDER BY name ASC"
  );
  return rows;
};

// 🔍 Get Interest By ID
const getById = async (id) => {
  const [rows] = await db.query(
    "SELECT id, name FROM interests WHERE id = ?",
    [id]
  );
  return rows[0];
};

// ❌ Delete Interest
const remove = async (id) => {
  const [result] = await db.query(
    "DELETE FROM interests WHERE id = ?",
    [id]
  );
  return result.affectedRows;
};

module.exports = {
  create,
  update,
  remove,
  getAll,
  getById
};
