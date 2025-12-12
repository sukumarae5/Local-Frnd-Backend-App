// models/photoModel.js
const db = require("../config/db");

const getAllPhotos = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM profile_photo ORDER BY upload_timestamp DESC"
  );
  return rows;
};

const getPhotosByUserId = async (user_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM profile_photo 
     WHERE user_id = ? AND status = 'active'
     ORDER BY upload_timestamp DESC`,
    [user_id]
  );
  return rows;
};

const getPhotoById = async (photo_id, user_id) => {
  const [rows] = await db.execute(
    `
    SELECT photo_id, photo_url, is_primary, status, upload_timestamp
    FROM profile_photo
    WHERE photo_id = ? AND user_id = ? AND status = 'active'
    `,
    [photo_id, user_id]
  );

  return rows[0] || null;
};


const getLatestPhoto = async (user_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM profile_photo 
     WHERE user_id = ? AND status = 'active'
     ORDER BY upload_timestamp DESC 
     LIMIT 1`,
    [user_id]
  );
  return rows[0];
};

const getActivePhotoCount = async (user_id) => {
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS total 
     FROM profile_photo 
     WHERE user_id = ? AND status = 'active'`,
    [user_id]
  );
  return rows[0].total;
};

const addPhoto = async (user_id, photo_url, is_primary) => {
  const [result] = await db.execute(
    `INSERT INTO profile_photo (user_id, photo_url, is_primary, upload_timestamp, status) 
     VALUES (?, ?, ?, NOW(), 'active')`,
    [user_id, photo_url, is_primary]
  );

  // mysql2: inserted id is in insertId
  return result.insertId;
};

const updatePhotoUrl = async (photo_id, user_id, photo_url) => {
  const [result] = await db.execute(
    `UPDATE profile_photo 
     SET photo_url = ? 
     WHERE photo_id = ? AND user_id = ?`,
    [photo_url, photo_id, user_id]
  );
  return result;
};

const updateStatus = async (photo_id, user_id, status) => {
  const [result] = await db.execute(
    `UPDATE profile_photo 
     SET status = ? 
     WHERE photo_id = ? AND user_id = ?`,
    [status, photo_id, user_id]
  );
  return result;
};

const clearPrimaryPhoto = async (user_id) => {
  const [result] = await db.execute(
    `UPDATE profile_photo 
     SET is_primary = 0 
     WHERE user_id = ?`,
    [user_id]
  );
  return result;
};

const findPrimaryByUserId = async (user_id) => {
  const [rows] = await db.execute(
    `SELECT * FROM profile_photo 
     WHERE user_id = ? 
       AND is_primary = 1 
       AND status = 'active'
     LIMIT 1`,
    [user_id]
  );
  return rows[0];
};

const setPrimaryPhoto = async (photo_id, user_id) => {
  // already cleared in service (optional, but ok to keep here too)
  await db.execute(`UPDATE profile_photo SET is_primary = 0 WHERE user_id = ?`, [
    user_id,
  ]);
  await db.execute(
    `UPDATE profile_photo 
     SET is_primary = 1 
     WHERE photo_id = ? AND user_id = ?`,
    [photo_id, user_id]
  );
};

const deletePhotoById = async (photo_id, user_id) => {
  const [result] = await db.execute(
    `DELETE FROM profile_photo WHERE photo_id = ? AND user_id = ?`,
    [photo_id, user_id]
  );
  return result;
};

module.exports = {
  getAllPhotos,
  getPhotosByUserId,
  getPhotoById,
  getLatestPhoto,
  getActivePhotoCount,
  addPhoto,
  updatePhotoUrl,
  clearPrimaryPhoto,
  findPrimaryByUserId,
  setPrimaryPhoto,
  deletePhotoById,
  updateStatus,
};
