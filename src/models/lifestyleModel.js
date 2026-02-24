const db = require("../config/db");

const create = async (category_id, name) => {
  const [result] = await db.query(
    "INSERT INTO lifestyles (category_id, name) VALUES (?, ?)",
    [category_id, name]
  );
  return result.insertId;
};

const update = async (id, name) => {
  const [result] = await db.query(
    "UPDATE lifestyles SET name = ? WHERE id = ?",
    [name, id]
  );
  return result.affectedRows;
};

const remove = async (id) => {
  const [result] = await db.query(
    "DELETE FROM lifestyles WHERE id = ?",
    [id]
  );
  return result.affectedRows;
};

const getAll = async () => {
  const [rows] = await db.query(`
    SELECT 
      l.id AS lifestyle_id,
      l.name AS lifestyle_name,
      c.id AS category_id,
      c.name AS category_name
    FROM lifestyles l
    JOIN lifestyle_categories c ON l.category_id = c.id
    ORDER BY c.id, l.id
  `);
  return rows;
};


module.exports = { create, update, remove, getAll };
