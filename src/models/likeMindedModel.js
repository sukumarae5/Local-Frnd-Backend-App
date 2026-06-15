const db = require("../config/db");

const getLikeMindedUsers = async (userId, limit, offset) => {
  const [rows] = await db.execute(
    `
    SELECT 
      u.user_id,
      u.name,
      u.is_online,
      a.image_url AS avatar,
      GROUP_CONCAT(i.name) AS matched_interests,
      COUNT(*) AS match_count
    FROM user_interests ui1
    JOIN user_interests ui2 
      ON ui1.interest_id = ui2.interest_id
    JOIN user u 
      ON u.user_id = ui2.user_id
    LEFT JOIN avatars a 
      ON a.avatar_id = u.avatar_id
    JOIN interests i 
      ON i.id = ui1.interest_id
    WHERE ui1.user_id = ?
      AND ui2.user_id != ?
      AND u.is_online = 1
      AND u.status = 'active'
    GROUP BY u.user_id
    ORDER BY match_count DESC
    LIMIT ? OFFSET ?
    `,
    [userId, userId, limit, offset]
  );

  return rows;
};

module.exports = {
  getLikeMindedUsers
};