

const Notification = require("../models/notificationModel");

const createNotification = async (sender, receiver, type, message) => {
  return await Notification.create(sender, receiver, type, message);
};

const getNotifications = async (userId) => {
  return await Notification.getByUser(userId);
};

const markNotificationsRead = async (userId) => {
  return await Notification.markRead(userId);
};

const getUnreadCount = async (userId) => {
  return await Notification.unreadCount(userId);
};

const deleteFriendRequestNotification = async (senderId, receiverId) => {
  return await Notification.deleteFriendRequestNotification(
    senderId,
    receiverId
  );
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationsRead,
  getUnreadCount,
  deleteFriendRequestNotification,
  
};