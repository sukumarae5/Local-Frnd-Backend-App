// userSocketMap.js
const userSockets = new Map(); 
// Structure:
// userSockets: {
//   "userId": Set(["socket1", "socket2"])
// }

function addSocket(userId, socketId) {
  userId = String(userId);

  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }

  userSockets.get(userId).add(socketId);
}

function removeSocket(userId, socketId) {
  userId = String(userId);
  if (!userSockets.has(userId)) return false;

  const sockets = userSockets.get(userId);
  sockets.delete(socketId);

  // If no sockets left → user fully offline
  if (sockets.size === 0) {
    userSockets.delete(userId);
    return true; // means user is now offline
  }

  return false; 
}

function getSockets(userId) {
  userId = String(userId);
  return userSockets.get(userId) || new Set();
}

function isOnline(userId) {
  return userSockets.has(String(userId));
}

function all() {
  return userSockets;
}

module.exports = {
  addSocket,
  removeSocket,
  getSockets,
  isOnline,
  all
};
