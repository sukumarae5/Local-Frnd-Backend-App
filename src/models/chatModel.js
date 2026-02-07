const db = require("../config/db");

/* ---------------- FRIEND CHECK ---------------- */
const areFriends = async (userA, userB) => {
  const [rows] = await db.query(
    `
    SELECT 1
    FROM friends
    WHERE
      (
        (user_id_1 = ? AND user_id_2 = ?)
        OR
        (user_id_1 = ? AND user_id_2 = ?)
      )
      AND status = 'ACCEPTED'
    LIMIT 1
    `,
    [userA, userB, userB, userA]
  );

  return rows.length > 0;
};

/* ---------------- CONVERSATION ---------------- */

const getConversation = async (userA, userB) => {
  const u1 = Math.min(userA, userB);
  const u2 = Math.max(userA, userB);

  const [rows] = await db.query(
    `SELECT conversation_id
     FROM conversations
     WHERE user1_id = ? AND user2_id = ?`,
    [u1, u2]
  );

  return rows[0];
};

const createConversation = async (userA, userB) => {
  const u1 = Math.min(userA, userB);
  const u2 = Math.max(userA, userB);

  const [res] = await db.query(
    `INSERT INTO conversations (user1_id, user2_id)
     VALUES (?, ?)`,
    [u1, u2]
  );

  return res.insertId;
};

/* ---------------- MESSAGES ---------------- */

const insertMessage = async (
  conversationId,
  senderId,
  content,
  type = "text"
) => {
  const [res] = await db.query(
    `
    INSERT INTO messages
      (conversation_id, sender_id, content, message_type)
    VALUES (?, ?, ?, ?)
    `,
    [conversationId, senderId, content, type]
  );

  return res.insertId;
};

const getMessages = async (conversationId, myId, limit = 30, offset = 0) => {

  const [rows] = await db.query(
    `
    SELECT 
      m.*,

      CASE
        WHEN m.sender_id = ?
         AND EXISTS (
            SELECT 1
            FROM message_reads r
            WHERE r.message_id = m.message_id
              AND r.user_id <> ?
         )
        THEN 1
        ELSE 0
      END AS is_read

    FROM messages m
    WHERE m.conversation_id = ?
      AND m.is_deleted = 0

    ORDER BY m.sent_at DESC
    LIMIT ? OFFSET ?
    `,
    [myId, myId, conversationId, Number(limit), Number(offset)]
  );

  return rows.reverse();
};


const deleteMessage = async (messageId, userId) => {
  const [res] = await db.query(
    `
    UPDATE messages
    SET is_deleted = 1
    WHERE message_id = ?
      AND sender_id = ?
    `,
    [messageId, userId]
  );

  return res.affectedRows;
};

/* ---------------- READ ---------------- */

const markRead = async (messageId, userId) => {
  await db.query(
    `
    INSERT IGNORE INTO message_reads (message_id, user_id)
    VALUES (?, ?)
    `,
    [messageId, userId]
  );
};

const markConversationRead = async (conversationId, userId) => {

  await db.query(
    `
    INSERT IGNORE INTO message_reads (message_id, user_id)
    SELECT m.message_id, ?
    FROM messages m
    WHERE m.conversation_id = ?
      AND m.sender_id <> ?
      AND m.is_deleted = 0
    `,
    [userId, conversationId, userId]
  );
};

module.exports = {
  areFriends,
  getConversation,
  createConversation,
  insertMessage,
  getMessages,
  deleteMessage,
  markRead,
  markConversationRead,
};
