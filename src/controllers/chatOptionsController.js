// controllers/chatOptionsController.js

const db               = require("../config/db");
const chatOptionsModel = require("../models/chatOptionsModel");

/* ── MUTE ── */
const toggleMute = async (req, res) => {
  try {
    const userId         = req.user.user_id;
    const { conversationId } = req.params;
    const currently = await chatOptionsModel.isMuted(userId, conversationId);
    currently
      ? await chatOptionsModel.unmuteConversation(userId, conversationId)
      : await chatOptionsModel.muteConversation(userId, conversationId);
    return res.json({ muted: !currently });
  } catch (err) {
    console.error("toggleMute error:", err);
    return res.status(500).json({ message: err.message });
  }
};

const getMuteStatus = async (req, res) => {
  try {
    const muted = await chatOptionsModel.isMuted(
      req.user.user_id,
      req.params.conversationId
    );
    return res.json({ muted });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ── BLOCK ── */
const toggleBlock = async (req, res) => {
  try {
    const blockerId        = req.user.user_id;
    const { targetUserId } = req.params;
    if (Number(blockerId) === Number(targetUserId))
      return res.status(400).json({ message: "Cannot block yourself" });

    const currently = await chatOptionsModel.hasBlocked(blockerId, targetUserId);
    currently
      ? await chatOptionsModel.unblockUser(blockerId, targetUserId)
      : await chatOptionsModel.blockUser(blockerId, targetUserId);
    return res.json({ blocked: !currently });
  } catch (err) {
    console.error("toggleBlock error:", err);
    return res.status(500).json({ message: err.message });
  }
};

const getBlockStatus = async (req, res) => {
  try {
    const blocked = await chatOptionsModel.hasBlocked(
      req.user.user_id,
      req.params.targetUserId
    );
    return res.json({ blocked });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ── CLEAR CHAT ── */
const clearChat = async (req, res) => {
  try {
    const userId             = req.user.user_id;
    const { conversationId } = req.params;

    const [[row]] = await db.query(
      `SELECT conversation_id FROM conversations
       WHERE conversation_id = ? AND (user1_id = ? OR user2_id = ?) LIMIT 1`,
      [conversationId, userId, userId]
    );
    if (!row) return res.status(403).json({ message: "Conversation not found" });

    await chatOptionsModel.clearChat(userId, conversationId);
    return res.json({ success: true, cleared_at: new Date().toISOString() });
  } catch (err) {
    console.error("clearChat error:", err);
    return res.status(500).json({ message: err.message });
  }
};

/* ── REPORT ────────────────────────────────────────────────────────────────
   FIX: use `report_type` (not `reason`) and `description` (not `details`)
   to match your actual DB schema:
     report(reporter_id, reported_user_id, report_type, description, status)
   ──────────────────────────────────────────────────────────────────────── */

const VALID_TYPES = ["abuse", "spam", "fake_profile"];

const reportUser = async (req, res) => {
  try {
    const reporterId       = req.user.user_id;
    const { targetUserId } = req.params;

    // Frontend sends `reason` — map it to `report_type`
    const { reason, details } = req.body;
    const reportType = reason;   // same value, just aliased for clarity

    if (Number(reporterId) === Number(targetUserId))
      return res.status(400).json({ message: "Cannot report yourself" });

    if (!VALID_TYPES.includes(reportType))
      return res.status(400).json({
        message: `report_type must be one of: ${VALID_TYPES.join(", ")}`,
      });

    // Duplicate guard
    const already = await chatOptionsModel.hasReported(reporterId, targetUserId, reportType);
    if (already) {
      // Return 409 — saga treats this as success (intent already fulfilled)
      return res.status(409).json({
        message: "You have already reported this user for this reason",
        already: true,
      });
    }

    const reportId = await chatOptionsModel.reportUser(
      reporterId,
      targetUserId,
      reportType,
      details || null      // maps to `description` column inside the model
    );

    return res.status(201).json({ success: true, report_id: reportId });
  } catch (err) {
    console.error("reportUser error:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  toggleMute,
  getMuteStatus,
  toggleBlock,
  getBlockStatus,
  clearChat,
  reportUser,
};