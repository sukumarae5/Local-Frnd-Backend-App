
const db = require("../config/db");

const create = async (senderId, receiverId, type, message) => {
  const [result] = await db.execute(
    `
    INSERT INTO notifications (sender_id, receiver_id, type, message)
    VALUES (?, ?, ?, ?)
    `,
    [senderId, receiverId, type, message]
  );

  return result.insertId;
};

const getByUser = async (userId) => {
  const [rows] = await db.execute(
    `
    SELECT n.*, u.name AS sender_name, u.avatar_id
    FROM notifications n
    JOIN user u ON u.user_id = n.sender_id
    WHERE n.receiver_id = ?
    ORDER BY n.created_at DESC
    `,
    [userId]
  );

  return rows;
};

const markRead = async (userId) => {
  await db.execute(
    `
    UPDATE notifications
    SET is_read = 1
    WHERE receiver_id = ?
    `,
    [userId]
  );
};

const unreadCount = async (userId) => {
  const [[row]] = await db.execute(
    `
    SELECT COUNT(*) AS unread
    FROM notifications
    WHERE receiver_id = ?
    AND is_read = 0
    `,
    [userId]
  );

  return row.unread;
};
const updateFriendRequestToAccepted = async (senderId, receiverId) => {
  await db.execute(
    `
    UPDATE notifications
    SET type='FRIEND_ACCEPT',
        message='Accepted your friend request'
    WHERE sender_id=? 
      AND receiver_id=? 
      AND type='FRIEND_REQUEST'
    `,
    [senderId, receiverId]
  );
};

const deleteFriendRequestNotification = async (senderId, receiverId) => {
  await db.execute(
    `
    DELETE FROM notifications
    WHERE sender_id=? 
      AND receiver_id=? 
      AND type='FRIEND_REQUEST'
    `,
    [senderId, receiverId]
  );
};
const deleteFriendshipNotifications = async (user1, user2) => {
  await db.execute(
    `
    DELETE FROM notifications
    WHERE (sender_id=? AND receiver_id=?)
       OR (sender_id=? AND receiver_id=?)
    `,
    [user1, user2, user2, user1]
  );
};
module.exports = {
  create,
  getByUser,
  markRead,
  unreadCount,
  updateFriendRequestToAccepted,
  deleteFriendRequestNotification,
  deleteFriendshipNotifications,
};