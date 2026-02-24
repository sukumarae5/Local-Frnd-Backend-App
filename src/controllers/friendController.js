const friendService = require("../services/friendServices");
const notificationService = require("../services/notificationService");
const { getIO } = require("../socket");

/* ================= SEND REQUEST ================= */

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
      message: "Request already exists",
    });
  }

  await notificationService.createNotification(
    from,
    to,
    "FRIEND_REQUEST",
    "Sent you a friend request"
  );

  getIO().to(String(to)).emit("new_notification");

  res.json({ success: true });
};

exports.acceptRequest = async (req, res) => {
  console.log("Accepting friend request...", req.body); 
  const me = req.user.user_id;
  const { sender_id } = req.body;

  const request = await friendService.getPendingRequest(sender_id, me);

  if (!request) {
    return res.status(400).json({ error: "No pending request" });
  }

  await friendService.accept(request.id, me);

  // DELETE notification instead of updating
  await notificationService.deleteFriendRequestNotification(
    sender_id,
    me
  );

  getIO().to(String(sender_id)).emit("new_notification");

  res.json({ success: true });
};
/* ================= REJECT REQUEST ================= */

exports.rejectRequest = async (req, res) => {
  const me = req.user.user_id;
  const { sender_id } = req.body;

  if (!sender_id) {
    return res.status(400).json({ error: "sender_id required" });
  }

  // Check if pending request exists
  const request = await friendService.getPendingRequest(sender_id, me);

  if (!request) {
    return res.status(400).json({ error: "No pending request" });
  }

  // Option A: DELETE row (recommended)
  await friendService.reject(sender_id, me);

  // Delete notification
  await notificationService.deleteFriendRequestNotification(
    sender_id,
    me
  );

  res.json({ success: true });
};

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
