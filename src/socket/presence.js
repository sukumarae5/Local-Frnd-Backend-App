const db = require('../config/db');
const socketMap = require('./socketMap');

module.exports = (io, socket) => {
  const user = socket.user;
  if (!user || !user.user_id) return;

  const userId = user.user_id;

  // ---- USER CONNECTED ----
  socketMap.addSocket(userId, socket.id);

  (async () => {
    // If this is the FIRST socket → user comes online
    if (socketMap.getSockets(userId).size === 1) {
      await db.query(
        'UPDATE user SET is_online = 1, last_seen = NOW() WHERE user_id = ?',
        [userId]
      );
      console.log(`User ${userId} is ONLINE`);

      // Notify other users
      socket.broadcast.emit('user_online', { user_id: userId });
    }
  })();

  // ---- USER DISCONNECTED ----
  socket.on("disconnect", async () => {
    const isFullyOffline = socketMap.removeSocket(userId, socket.id);

    if (isFullyOffline) {
      await db.query(
        'UPDATE user SET is_online = 0, last_seen = NOW() WHERE user_id = ?',
        [userId]
      );

      console.log(`User ${userId} is OFFLINE`);

      socket.broadcast.emit('user_offline', { user_id: userId });
    }
  });


  socket.on('presence_ping', async () => {
    try {
      await db.query('UPDATE `user` SET last_seen = NOW() WHERE user_id = ?', [
        userId,
      ]);
      console.log(`Updated last_seen for user ${userId}`);

    } catch (err) {
      console.error('presence_ping error', err);
    }
  });
};
