const db = require("../config/db");

const updateProfileImage = async (user_id, profile_image_url) => {
  const [result] = await db.execute(
    `
    UPDATE user
    SET profile_image_url = ?
    WHERE user_id = ?
    `,
    [profile_image_url, user_id]
  );

  return result;
};

const removeProfileImage = async (user_id) => {
  const [result] = await db.execute(
    `
    UPDATE user
    SET profile_image_url = NULL
    WHERE user_id = ?
    `,
    [user_id]
  );

  return result;
};

const getProfileImage = async (user_id) => {
  const [rows] = await db.execute(
    `
    SELECT profile_image_url
    FROM user
    WHERE user_id = ?
    `,
    [user_id]
  );

  return rows[0];
};

module.exports = {
  updateProfileImage,
  removeProfileImage,
  getProfileImage,
};