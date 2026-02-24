const db = require('../config/db');

const create = async (name) => {
  const [result] = await db.query(
    "INSERT INTO lifestyle_categories (name) VALUES (?)",
    [name]
  );
  return result.insertId;
};

const update = async (id, name) => {
  const [result] = await db.query(
    "UPDATE lifestyle_categories SET name = ? WHERE id = ?",
    [name, id]
  );
  return result.affectedRows;
};  

const remove = async (id) => {
  const [result] = await db.query(
    "DELETE FROM lifestyle_categories WHERE id = ?",
    [id]
  );
  return result.affectedRows;
};

const getAll = async () => {
  const [rows] = await db.query(
    "SELECT id, name, created_at FROM lifestyle_categories ORDER BY id ASC"
  );
  return rows;
};

module.exports = { create, update, remove, getAll };
