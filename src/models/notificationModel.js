const db = require("../config/db");

const DEDUP_SECONDS = 30;

const create = async (
  senderId,
  receiverId,
  type,
  message,
  callType = null,
  sessionId = null
) => {
  try {
    // ── Dedup check ──────────────────────────────────────────────
    // ✅ CRITICAL: interpolate DEDUP_SECONDS directly — MySQL/TiDB
    //    does NOT support ? inside INTERVAL syntax
    let dedupSql;
    let dedupParams;

    if (sessionId) {
      // If we have a session_id, dedup by session + type (strictest)
      dedupSql = `
        SELECT id FROM notifications
        WHERE sender_id   = ?
          AND receiver_id = ?
          AND type        = ?
          AND session_id  = ?
          AND created_at  >= NOW() - INTERVAL ${DEDUP_SECONDS} SECOND
        LIMIT 1
      `;
      dedupParams = [senderId, receiverId, type, sessionId];
    } else {
      // No session_id — dedup by sender + receiver + type within window
      dedupSql = `
        SELECT id FROM notifications
        WHERE sender_id   = ?
          AND receiver_id = ?
          AND type        = ?
          AND session_id  IS NULL
          AND created_at  >= NOW() - INTERVAL ${DEDUP_SECONDS} SECOND
        LIMIT 1
      `;
      dedupParams = [senderId, receiverId, type];
    }

    const [[recent]] = await db.execute(dedupSql, dedupParams);

    if (recent) {
      console.log(
        `⚠️ Dedup blocked [${type}] from ${senderId} → ${receiverId} (id: ${recent.id})`
      );
      return recent.id;
    }

    // ── Insert ───────────────────────────────────────────────────
    const [result] = await db.execute(
      `INSERT INTO notifications
         (sender_id, receiver_id, type, message, call_type, session_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [senderId, receiverId, type, message, callType, sessionId]
    );

    console.log(`✅ Notification created [${type}] id: ${result.insertId}`);
    return result.insertId;

  } catch (err) {
    console.error("❌ Notification create error:", err.message);
    throw err;
  }
};

/** Returns the FCM token for a user (or null). */
const getFcmToken = async (userId) => {
  const [[row]] = await db.execute(
    "SELECT fcm_token FROM user WHERE user_id = ?",
    [userId]
  );
  return row?.fcm_token || null;
};

const getByUser = async (userId) => {
  const [rows] = await db.execute(
    `SELECT
       n.*,
       u.name      AS sender_name,
       a.image_url AS avatar_url
     FROM notifications n
     JOIN user u         ON u.user_id   = n.sender_id
     LEFT JOIN avatars a ON a.avatar_id = u.avatar_id
     WHERE n.receiver_id = ?
     ORDER BY n.created_at DESC
     LIMIT 100`,
    [userId]
  );
  return rows;
};

const markRead = async (userId) => {
  await db.execute(
    "UPDATE notifications SET is_read = 1 WHERE receiver_id = ? AND is_read = 0",
    [userId]
  );
};

const unreadCount = async (userId) => {
  const [[row]] = await db.execute(
    `SELECT COUNT(*) AS unread
     FROM notifications
     WHERE receiver_id = ? AND is_read = 0`,
    [userId]
  );
  return row.unread;
};

const updateFriendRequestToAccepted = async (senderId, receiverId) => {
  await db.execute(
    `UPDATE notifications
     SET type    = 'FRIEND_ACCEPT',
         message = 'Accepted your friend request'
     WHERE sender_id   = ?
       AND receiver_id = ?
       AND type        = 'FRIEND_REQUEST'`,
    [senderId, receiverId]
  );
};

const deleteFriendRequestNotification = async (senderId, receiverId) => {
  await db.execute(
    `DELETE FROM notifications
     WHERE sender_id   = ?
       AND receiver_id = ?
       AND type        = 'FRIEND_REQUEST'`,
    [senderId, receiverId]
  );
};

const deleteFriendshipNotifications = async (user1, user2) => {
  await db.execute(
    `DELETE FROM notifications
     WHERE (sender_id = ? AND receiver_id = ?)
        OR (sender_id = ? AND receiver_id = ?)`,
    [user1, user2, user2, user1]
  );
};


const deleteMessageNotification = async (senderId, receiverId) => {
  await db.execute(
    `DELETE FROM notifications
     WHERE sender_id = ?
       AND receiver_id = ?
       AND type = 'MESSAGE'`,
    [senderId, receiverId]
  );
};

module.exports = {
  create,
  getFcmToken,
  getByUser,
  markRead,
  unreadCount,
  updateFriendRequestToAccepted,
  deleteFriendRequestNotification,
  deleteFriendshipNotifications,
  deleteMessageNotification,
};