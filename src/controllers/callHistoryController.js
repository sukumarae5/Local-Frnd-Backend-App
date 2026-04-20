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


exports.getCallHistory = async (req, res) => {
  try {

    const result = await historyService.fetchAllCallHistory();

    return res.status(200).json(result);

  } catch (error) {

    console.error("Call History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  }
};


exports.getUserCallHistory = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await historyService.fetchUserCallHistory(id);

    res.status(200).json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  }

};