const db = require("../config/db");

exports.create = async ({ sender, receiver, type, message }) => {
  await db.execute(
    `INSERT INTO notifications
     (sender_id, receiver_id, type, message)
     VALUES (?, ?, ?, ?)`,
    [sender, receiver, type, message]
  );
};

exports.list = async (userId) => {
  const [rows] = await db.execute(
    `SELECT * FROM notifications
     WHERE receiver_id=?
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};

exports.markRead = async (id, userId) => {
  await db.execute(
    `UPDATE notifications SET is_read=1
     WHERE id=? AND receiver_id=?`,
    [id, userId]
  );
};
