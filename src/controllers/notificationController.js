

const notificationService = require("../services/notificationService");

exports.getNotifications = async (req, res) => {
  const userId = req.user.user_id;

  const data = await notificationService.getNotifications(userId);

  res.json(data);
};

exports.markRead = async (req, res) => {
  const userId = req.user.user_id;

  await notificationService.markNotificationsRead(userId);

  res.json({ success: true });
};

exports.unreadCount = async (req, res) => {
  const userId = req.user.user_id;

  const count = await notificationService.getUnreadCount(userId);

  res.json({ unread: count });
};