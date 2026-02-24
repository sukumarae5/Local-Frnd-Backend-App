const historyService = require("../services/callHistoryService");

/* ===============================
   FULL CALL HISTORY
================================ */
exports.history = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const data = await historyService.fullHistory(userId);
    res.json({ success: true, data });
  } catch (err) {
    console.error("history error", err);
    res.status(500).json({ success: false });
  }
};

/* ===============================
   RECENT USERS
================================ */
exports.recentUsers = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const data = await historyService.recentUsers(userId);
    res.json({ success: true, data });
  } catch (err) {
    console.error("recent users error", err);
    res.status(500).json({ success: false });
  }
};

/* ===============================
   HISTORY WITH ONE USER
================================ */
exports.withUser = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const otherUserId = req.params.userId;
    const data = await historyService.withUser(userId, otherUserId);
    res.json({ success: true, data });
  } catch (err) {
    console.error("with user error", err);
    res.status(500).json({ success: false });
  }
};
