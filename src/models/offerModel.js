const db = require("../config/db");

const getAllOffers = async (gender) => {
  let query = `
    SELECT * FROM offers 
    WHERE status = 1 
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  `;

  let params = [];

  // ✅ Apply filter only if gender is provided
  if (gender) {
    query += ` AND (target_audience = ? OR target_audience = 'ALL')`;
    params.push(gender);
  }

  query += ` ORDER BY priority DESC`;

  const [rows] = await db.query(query, params);

  return rows;
};

const getOfferById = async (id) => {

  const [rows] = await db.query(
    "SELECT * FROM offers WHERE id = ?",
    [id]
  );

  return rows[0];

};

const addOffer = async (data) => {
  const [result] = await db.query(
    `INSERT INTO offers
    (title, description, image_url, redirect_url, start_date, end_date, priority, target_audience)
    VALUES (?,?,?,?,?,?,?,?)`,
    [
      data.title,
      data.description,
      data.image,
      data.redirect_url,
      data.start_date,
      data.end_date,
      data.priority,
      data.target_audience,
    ]
  );

  return result;
};

const updateOffer = async (id, data) => {
  const [result] = await db.query(
    `UPDATE offers
     SET title=?, description=?, image_url=?, redirect_url=?, start_date=?, end_date=?, priority=?, target_audience=?
     WHERE id=?`,
    [
      data.title,
      data.description,
      data.image,
      data.redirect_url,
      data.start_date,
      data.end_date,
      data.priority,
      data.target_audience,
      id,
    ]
  );

  return result;
};

const deleteOffer = async (id) => {

  const [result] = await db.query(
    "UPDATE offers SET status = 0 WHERE id=?",
    [id]
  );

  return result;

};

module.exports = {
  getAllOffers,
  getOfferById,
  addOffer,
  updateOffer,
  deleteOffer
};