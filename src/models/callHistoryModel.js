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
        id,
        session_id,
        type,
        status,
        started_at,
        duration_seconds,
        CASE
          WHEN caller_id = ? THEN receiver_id
          ELSE caller_id
        END AS other_user_id,
        ROW_NUMBER() OVER (
          PARTITION BY
            CASE
              WHEN caller_id = ? THEN receiver_id
              ELSE caller_id
            END
          ORDER BY started_at DESC
        ) rn
      FROM call_sessions
      WHERE caller_id = ? OR receiver_id = ?
    ) t
    WHERE rn = 1
    ORDER BY started_at DESC
    `,
    [userId, userId, userId, userId]
  );
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
