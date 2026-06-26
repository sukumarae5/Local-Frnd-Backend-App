// services/notificationService.js
const Notification = require("../models/notificationModel");
const admin = require("../config/firebase"); // your existing firebase config

// ── FCM push helper ─────────────────────────────────────────────────────────
const NOTIF_ICONS = {
  FRIEND_REQUEST: "ic_friend",
  FRIEND_ACCEPT: "ic_friend",
  MESSAGE: "ic_message",
  CALL: "ic_call",
  MISSED_CALL: "ic_missed_call",
};
 
const sendPush = async (receiverId, type, message, meta = {}) => {
  try {
    const token = await Notification.getFcmToken(receiverId);
    if (!token) return; // user hasn't registered an FCM token yet

    const payload = {
      token,
      notification: {
        title: titleFor(type),
        body: message,
      },
      data: {
        type,
        call_type: meta.call_type || "",
        session_id: meta.session_id || "",
      },
      android: {
        notification: {
          icon: NOTIF_ICONS[type] || "ic_notification",
          channelId: "default",
          priority: "high",
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
        },
      },
      apns: {
        payload: {
          aps: { sound: "default", badge: 1 },
        },
      },
    };

    await admin.messaging().send(payload);
  } catch (err) {
    // Never let a push failure crash the main flow
    console.error("FCM push error:", err.message);
  }
};

const titleFor = (type) => {
  const map = {
    FRIEND_REQUEST: "New Friend Request",
    FRIEND_ACCEPT: "Friend Request Accepted",
    MESSAGE: "New Message",
    CALL: "Incoming Call",
    MISSED_CALL: "Missed Call",
  };
  return map[type] || "Notification";
};

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Creates a DB notification AND fires an FCM push.
 * Deduplication is handled inside Notification.create().
 */
const createNotification = async (
  sender,
  receiver,
  type,
  message,
  meta = {},
) => {
  const id = await Notification.create(
    sender,
    receiver,
    type,
    message,
    meta.call_type || null,
    meta.session_id || null,
  );

  // Fire push in parallel — don't await so the caller isn't slowed down
  sendPush(receiver, type, message, meta).catch(() => {});

  return id;
};

const getNotifications = (userId) => Notification.getByUser(userId);
const markNotificationsRead = (userId) => Notification.markRead(userId);
const getUnreadCount = (userId) => Notification.unreadCount(userId);
const deleteFriendRequestNotification = (s, r) =>
  Notification.deleteFriendRequestNotification(s, r);
const deleteMessageNotification = (senderId, receiverId) =>
  Notification.deleteMessageNotification(senderId, receiverId);

module.exports = {
  createNotification,
  getNotifications,
  markNotificationsRead,
  getUnreadCount,
  deleteFriendRequestNotification,
  deleteMessageNotification,
};
