const db = require("../config/db");


exports.getUserHistory = async (userId) => {
  const [rows] = await db.execute(
    `
    SELECT
      id,
      session_id,
      type,
      status,
      started_at,
      ended_at,
      duration_seconds,
      coin_rate_per_min,
      CASE
        WHEN caller_id = ? THEN receiver_id
        ELSE caller_id
      END AS other_user_id
    FROM call_sessions
    WHERE caller_id = ? OR receiver_id = ?
    ORDER BY started_at DESC
    `,
    [userId, userId, userId]
  );
  return rows;
};

/* ===============================
   LAST CALL WITH EACH USER
================================ */
exports.getRecentUsers = async (userId) => {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM (
      SELECT
        cs.id,
        cs.session_id,
        cs.type,
        cs.status,
        cs.started_at,
        cs.duration_seconds,
        cs.caller_id,
        cs.receiver_id,

        CASE
          WHEN cs.caller_id = ? THEN cs.receiver_id
          ELSE cs.caller_id
        END AS other_user_id,

        u.user_id,
        u.name,
        u.avatar_id,
        u.is_online,
        u.last_seen,

        a.image_url AS avatar,

        ROW_NUMBER() OVER (
          PARTITION BY
            CASE
              WHEN cs.caller_id = ? THEN cs.receiver_id
              ELSE cs.caller_id
            END
          ORDER BY cs.started_at DESC
        ) rn

      FROM call_sessions cs

      LEFT JOIN user u
        ON u.user_id = 
          CASE
            WHEN cs.caller_id = ? THEN cs.receiver_id
            ELSE cs.caller_id
          END

      LEFT JOIN avatars a
        ON a.avatar_id = u.avatar_id

      WHERE cs.caller_id = ? OR cs.receiver_id = ?
    ) t
    WHERE rn = 1
    ORDER BY started_at DESC
    `,
    [userId, userId, userId, userId, userId]
  );

  console.log("Recent Users:", rows);
  return rows;
};

/* ===============================
   HISTORY WITH ONE USER
================================ */
exports.getHistoryWithUser = async (userId, otherUserId) => {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM call_sessions
    WHERE
      (caller_id = ? AND receiver_id = ?)
      OR
      (caller_id = ? AND receiver_id = ?)
    ORDER BY started_at DESC
    `,
    [userId, otherUserId, otherUserId, userId]
  );
  return rows;
};
