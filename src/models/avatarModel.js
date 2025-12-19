const db = require("../config/db");

const createAvatar = async (data) => {
  const { gender, image_url, sort_order } = data;
  const [result] = await db.execute(
    `INSERT INTO avatars (gender, image_url, sort_order)
     VALUES (?, ?, ?)`,
    [gender, image_url, sort_order || 0]
  );
  return result.insertId;
};

const getAvatarsByGender = async (gender) => {
  const [rows] = await db.execute(
    `SELECT avatar_id, image_url
     FROM avatars
     WHERE gender=? AND is_active=1
     ORDER BY sort_order ASC`,
    [gender]
  );
  return rows;
};

const findById= async (avatar_id) => {
    const [rows] = await db.execute(
      `SELECT * FROM avatars WHERE avatar_id=? AND is_active=1`,
      [avatar_id]
    );
    return rows[0];
}

const updateById = async (avatar_id, data) => {
  const fields = [];
  const values = [];

  Object.keys(data).forEach((key) => {
    fields.push(`${key}=?`);
    values.push(data[key]);
  });

  if (!fields.length) return;

  values.push(avatar_id);

  await db.execute(
    `UPDATE avatars SET ${fields.join(", ")} WHERE avatar_id=?`,
    values
  );
};

const deleteAvatar = async (avatar_id) => {
  await db.execute(
 `DELETE FROM avatars WHERE avatar_id=?`,
    [avatar_id]
  );
};


module.exports={
    createAvatar,
    getAvatarsByGender,
    deleteAvatar,
    findById,
    updateById
}