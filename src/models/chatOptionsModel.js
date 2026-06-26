// models/chatOptionsModel.js

const db = require("../config/db");

/* ================================================================
   MUTE
   ================================================================ */

const muteConversation = async (userId, conversationId) => {
  await db.query(
    `INSERT INTO chat_mutes (user_id, conversation_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE muted_at = CURRENT_TIMESTAMP`,
    [userId, conversationId]
  );
};

const unmuteConversation = async (userId, conversationId) => {
  await db.query(
    `DELETE FROM chat_mutes WHERE user_id = ? AND conversation_id = ?`,
    [userId, conversationId]
  );
};

const isMuted = async (userId, conversationId) => {
  const [rows] = await db.query(
    `SELECT 1 FROM chat_mutes WHERE user_id = ? AND conversation_id = ? LIMIT 1`,
    [userId, conversationId]
  );
  return rows.length > 0;
};

/* ================================================================
   BLOCK
   ================================================================ */

const blockUser = async (blockerId, blockedId) => {
  await db.query(
    `INSERT IGNORE INTO user_blocks (blocker_id, blocked_id) VALUES (?, ?)`,
    [blockerId, blockedId]
  );
};

const unblockUser = async (blockerId, blockedId) => {
  await db.query(
    `DELETE FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?`,
    [blockerId, blockedId]
  );
};

/**
 * Bidirectional: returns true if EITHER user blocked the other.
 * Used only in the socket send guard so that if A blocked B,
 * B's messages are also silently dropped (no error sent to B).
 */
const isBlocked = async (userA, userB) => {
  const [rows] = await db.query(
    `SELECT 1 FROM user_blocks
     WHERE (blocker_id = ? AND blocked_id = ?)
        OR (blocker_id = ? AND blocked_id = ?)
     LIMIT 1`,
    [userA, userB, userB, userA]
  );
  return rows.length > 0;
};

/**
 * One-directional: has blockerId explicitly blocked blockedId?
 * Used for REST status checks and UI rendering.
 */
const hasBlocked = async (blockerId, blockedId) => {
  const [rows] = await db.query(
    `SELECT 1 FROM user_blocks
     WHERE blocker_id = ? AND blocked_id = ? LIMIT 1`,
    [blockerId, blockedId]
  );
  return rows.length > 0;
};

/* ================================================================
   CLEAR CHAT
   ================================================================ */

const clearChat = async (userId, conversationId) => {
  await db.query(
    `INSERT INTO chat_clears (user_id, conversation_id, cleared_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE cleared_at = CURRENT_TIMESTAMP`,
    [userId, conversationId]
  );
};

const getClearTimestamp = async (userId, conversationId) => {
  const [rows] = await db.query(
    `SELECT cleared_at FROM chat_clears
     WHERE user_id = ? AND conversation_id = ? LIMIT 1`,
    [userId, conversationId]
  );
  return rows[0]?.cleared_at ?? null;
};

/* ================================================================
   REPORT
   FIX: Table is `report`, columns are:
        reported_user_id  (not reported_id)
        report_type       (not reason)
        description       (not details)
   ================================================================ */

/**
 * Insert into your actual `report` table.
 * report_type maps to our reason values: 'abuse' | 'spam' | 'fake_profile'
 */
const reportUser = async (reporterId, reportedId, reportType, description = null) => {
  const [res] = await db.query(
    `INSERT INTO report (reporter_id, reported_user_id, report_type, description)
     VALUES (?, ?, ?, ?)`,
    [reporterId, reportedId, reportType, description]
  );
  return res.insertId;
};

/**
 * Duplicate check using the correct column names.
 */
const hasReported = async (reporterId, reportedId, reportType) => {
  const [rows] = await db.query(
    `SELECT 1 FROM report
     WHERE reporter_id = ? AND reported_user_id = ? AND report_type = ?
     LIMIT 1`,
    [reporterId, reportedId, reportType]
  );
  return rows.length > 0;
};

module.exports = {
  muteConversation,
  unmuteConversation,
  isMuted,
  blockUser,
  unblockUser,
  isBlocked,
  hasBlocked,
  clearChat,
  getClearTimestamp,
  reportUser,
  hasReported,
};