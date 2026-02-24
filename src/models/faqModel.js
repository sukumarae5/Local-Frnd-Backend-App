const db = require("../config/db");

const createFAQ = async (question, answer) => {
  const [result] = await db.query(
    "INSERT INTO faqs (question, answer) VALUES (?, ?)",
    [question, answer]
  );
  return result;
};

const getAllFAQs = async () => {
  const [rows] = await db.query("SELECT * FROM faqs ORDER BY created_at DESC");
  return rows;
};

const getFAQById = async (id) => {
  const [rows] = await db.query("SELECT * FROM faqs WHERE id = ?", [id]);
  return rows[0];
};

const updateFAQ = async (id, question, answer, status) => {
  const [result] = await db.query(
    "UPDATE faqs SET question=?, answer=?, status=? WHERE id=?",
    [question, answer, status, id]
  );
  return result;
};

const deleteFAQ = async (id) => {
  const [result] = await db.query("DELETE FROM faqs WHERE id = ?", [id]);
  return result;
};

module.exports = {
  createFAQ,
  getAllFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
};
