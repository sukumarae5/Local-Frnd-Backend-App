const friendService = require("../services/friendServices");
const { getIO } = require("../socket");

exports.sendRequest = async (req, res) => {
  const from = req.user.user_id;
  const { to } = req.body;

  if (!to || from === to) {
    return res.status(400).json({ error: "Invalid user" });
  }

  const created = await friendService.sendRequest(from, to);

  if (!created) {
    return res.json({
      success: false,
      message: "Friend request already exists",
    });
  }

  getIO().to(String(to)).emit("friend_request", {
    from,
    type: "FRIEND_REQUEST",
    time: Date.now(),
  });

  res.json({ success: true });
};


exports.acceptRequest = async (req, res) => {
  const { request_id } = req.body;
  const me = req.user.user_id;

  const senderId = await friendService.accept(request_id, me);

  if (!senderId) {
    return res.status(400).json({ error: "Invalid request" });
  }

  // notify sender
  getIO().to(String(senderId)).emit("friend_accept", {
    by: me,
    type: "FRIEND_ACCEPT",
    time: Date.now(),
  });

  // notify receiver (self)
  getIO().to(String(me)).emit("friend_accept", {
    by: me,
    type: "FRIEND_ACCEPT",
    time: Date.now(),
  });

  res.json({ success: true });
};


/* ================= FRIEND LIST ================= */
exports.myFriends = async (req, res) => {
  const data = await friendService.list(req.user.user_id);
  res.json(data);
};

/* ================= PENDING REQUESTS ================= */
exports.pendingRequests = async (req, res) => {
  const data = await friendService.pending(req.user.user_id);
  res.json(data);
};

/* ================= FRIEND STATUS ================= */
exports.friendStatus = async (req, res) => {
  const me = req.user.user_id;
  const { other } = req.params;

  const status = await friendService.status(me, other);
  res.json(status);
};

/* ================= UNFRIEND ================= */
exports.unfriend = async (req, res) => {
  const me = req.user.user_id;
  const { other } = req.body;

  await friendService.remove(me, other);

  getIO().to(String(other)).emit("friend_removed", { by: me });

  res.json({ success: true });
};

/* ================= ALIASES (CRASH PROTECTION) ================= */
exports.pending = exports.pendingRequests;
exports.status = exports.friendStatus;

/* ================= FRIENDS (FILTER BY STATUS) ================= */
exports.getFriends = async (req, res) => {
  const userId = req.user.user_id;
  const { status = "ACCEPTED" } = req.query;

  const data = await friendService.listByStatus(userId, status);
  res.json(data);
};

/* ================= ADMIN FRIEND LIST ================= */
exports.adminFriends = async (req, res) => {
  const { status = "ALL" } = req.query;
  const data = await friendService.adminList(status);
  res.json(data);
};
