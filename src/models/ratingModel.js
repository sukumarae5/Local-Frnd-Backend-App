const db = require("../config/db");

// 1️⃣ Check duplicate rating
exports.checkDuplicateRating = async (session_id, rater_id) => {
  const [rows] = await db.query(
    `
    SELECT id FROM call_ratings
    WHERE session_id = ? AND rater_id = ?
    `,
    [session_id, rater_id]
  );

  return rows.length > 0;
};

// 2️⃣ Insert rating
exports.insertRating = async ({
  session_id,
  rater_id,
  rated_user_id,
  rating
}) => {
  await db.query(
    `
    INSERT INTO call_ratings 
    (session_id, rater_id, rated_user_id, rating)
    VALUES (?, ?, ?, ?)
    `,
    [session_id, rater_id, rated_user_id, rating]
  );
};

// 3️⃣ Update user average rating
exports.updateUserAverage = async (user_id) => {

  // Calculate new average
  const [rows] = await db.query(
    `
    SELECT 
      AVG(rating) as avg_rating,
      COUNT(*) as total
    FROM call_ratings
    WHERE rated_user_id = ?
    `,
    [user_id]
  );

  const avg_rating = rows[0].avg_rating || 0;
  const total = rows[0].total || 0;

  // Update users table
  await db.query(
    `
    UPDATE user
    SET avg_rating = ?, total_ratings = ?
    WHERE user_id = ?
    `,
    [avg_rating, total, user_id]
  );

  return {
    user_id,
    avg_rating: Number(avg_rating).toFixed(2),
    total_ratings: total
  };
};
