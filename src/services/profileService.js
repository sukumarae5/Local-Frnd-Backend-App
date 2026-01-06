
const db=require("../config/db")

exports.getUserProfile = async (userId) => {
  const [rows] = await db.execute(
     `
    SELECT 
      u.*,

      p.photo_id,
      p.photo_url,
      p.is_primary,

      a.avatar_id AS avatar_id,
      a.image_url AS avatar_image_url

    FROM user u
    LEFT JOIN profile_photo p
      ON p.user_id = u.user_id 
      AND p.status = 'active'

    LEFT JOIN avatars a
      ON a.avatar_id = u.avatar_id

    WHERE u.user_id = ?
    `,
    [userId]
  );

  if (!rows.length) return null;

   const user = {
    user_id: rows[0].user_id,
    name: rows[0].name,
    username: rows[0].username,
    mobile_number: rows[0].mobile_number,
    email: rows[0].email,
    language_id: rows[0].language_id,
    age: rows[0].age,
    date_of_birth: rows[0].date_of_birth,
    gender: rows[0].gender,
    bio: rows[0].bio,
    profile_status: rows[0].profile_status,
    status: rows[0].status,
    coin_balance: rows[0].coin_balance,
    location_lat: rows[0].location_lat,
    location_log: rows[0].location_log,
    is_online: rows[0].is_online,
    last_seen: rows[0].last_seen,
    avatar_id: rows[0].avatar_id,
  };


  const photos = rows
    .filter(r => r.photo_id)
    .map(r => ({
      photo_id: r.photo_id,
      photo_url: r.photo_url,
      is_primary: r.is_primary
    }));

  const primary_image = photos.find(p => p.is_primary == 1) || null;
  const gallery_images = photos.filter(p => p.is_primary == 0);

  let profile_image = null;

  if (rows[0].avatar_image_url) {
    // ✅ avatar has highest priority
    profile_image = rows[0].avatar_image_url;
  } else if (primary_image) {
    // fallback to photo
    profile_image = primary_image.photo_url;
  }

  return { user, profile_image, primary_image, gallery_images };
};

