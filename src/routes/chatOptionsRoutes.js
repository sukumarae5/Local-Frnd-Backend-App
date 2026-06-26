// routes/chatOptionsRoutes.js
const express    = require("express");
const router     = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const ctrl       = require("../controllers/chatOptionsController");

// ---------- MUTE ----------
// Toggle mute for a conversation (returns new muted state)
router.post("/mute/:conversationId",   authenticateUser, ctrl.toggleMute);
// Check mute status
router.get("/mute/:conversationId",    authenticateUser, ctrl.getMuteStatus);

// ---------- BLOCK ----------
// Toggle block for a user (returns new blocked state)
router.post("/block/:targetUserId",    authenticateUser, ctrl.toggleBlock);
// Check block status
router.get("/block/:targetUserId",     authenticateUser, ctrl.getBlockStatus);

// ---------- CLEAR CHAT ----------
// Soft-clear all messages for current user in a conversation
router.delete("/clear/:conversationId", authenticateUser, ctrl.clearChat);

// ---------- REPORT ----------
// Submit a report { reason, details? }
router.post("/report/:targetUserId",   authenticateUser, ctrl.reportUser);

module.exports = router;

/*
  Mount in your main app.js / index.js:

    const chatOptionsRoutes = require("./routes/chatOptionsRoutes");
    app.use("/api/chat", chatOptionsRoutes);

  Full URL examples:
    POST   /api/chat/mute/42
    GET    /api/chat/mute/42
    POST   /api/chat/block/99
    GET    /api/chat/block/99
    DELETE /api/chat/clear/42
    POST   /api/chat/report/99   { "reason": "spam", "details": "..." }
*/