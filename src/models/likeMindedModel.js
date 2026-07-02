const db = require("../config/db");

const getLikeMindedUsers = async (userId, limit, offset) => {
  limit = parseInt(limit, 10);
  offset = parseInt(offset, 10);

  const [rows] = await db.query(
   `SELECT
    u.user_id,
    u.name,
    u.is_online,
    a.image_url AS avatar,

    CASE
        WHEN u.profile_image_url IS NOT NULL
             AND u.profile_image_url <> ''
        THEN u.profile_image_url
        ELSE a.image_url
    END AS display_profile_image,

    COUNT(DISTINCT myi.interest_id) AS interest_match_count,
    COUNT(DISTINCT myl.lifestyle_id) AS lifestyle_match_count,

    GROUP_CONCAT(DISTINCT i.name ORDER BY i.name) AS matched_interests,
    GROUP_CONCAT(DISTINCT l.name ORDER BY l.name) AS matched_lifestyles,

    (
        COUNT(DISTINCT myi.interest_id) +
        COUNT(DISTINCT myl.lifestyle_id)
    ) AS total_match

FROM user u

LEFT JOIN avatars a
    ON a.avatar_id = u.avatar_id

/* Candidate user's interests */
LEFT JOIN user_interests ui
    ON ui.user_id = u.user_id

/* Logged-in user's matching interests */
LEFT JOIN user_interests myi
    ON myi.user_id = ?
   AND myi.interest_id = ui.interest_id

LEFT JOIN interests i
    ON i.id = ui.interest_id

/* Candidate user's lifestyles */
LEFT JOIN user_lifestyles ul
    ON ul.user_id = u.user_id

/* Logged-in user's matching lifestyles */
LEFT JOIN user_lifestyles myl
    ON myl.user_id = ?
   AND myl.lifestyle_id = ul.lifestyle_id

LEFT JOIN lifestyles l
    ON l.id = ul.lifestyle_id

WHERE
    u.user_id <> ?
    AND u.is_online = 1
    AND u.status = 'active'

GROUP BY
    u.user_id,
    u.name,
    u.is_online,
    u.profile_image_url,
    a.image_url

ORDER BY
    total_match DESC,
    u.name ASC

LIMIT ? OFFSET ?;`
    ,

    [userId, userId, userId, limit, offset],
  );

  return rows;
};

module.exports = {
  getLikeMindedUsers,
};
