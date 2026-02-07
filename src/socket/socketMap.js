const userSockets = new Map();

/* =========================
   ADD SOCKET
========================= */
function addSocket(userId, socketId) {
  userId = String(userId);

  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }

  userSockets.get(userId).add(socketId);
}

/* =========================
   REMOVE SOCKET
   returns: { userOffline: boolean }
========================= */
function removeSocket(userId, socketId) {
  userId = String(userId);

  if (!userSockets.has(userId)) return false;

  const sockets = userSockets.get(userId);
  sockets.delete(socketId);

  if (sockets.size === 0) {
    userSockets.delete(userId);
    return true; // user fully offline
  }

  return false;
}

/* =========================
   GET SOCKET IDS
========================= */
function getSockets(userId) {
  return userSockets.get(String(userId)) || new Set();
}

function getAnySocket(userId) {
  const sockets = getSockets(userId);
  return sockets.size ? [...sockets][0] : null;
}

/* =========================
   ONLINE STATUS
========================= */
function isOnline(userId) {
  console.log("Checking online status for userId:", userId);  
  return userSockets.has(String(userId));
}

/* =========================
   SAFE SNAPSHOT (READ ONLY)
========================= */
function snapshot() {
  const data = {};
  for (const [uid, sockets] of userSockets.entries()) {
    data[uid] = [...sockets];
  }
  return data;
}

/* =========================
   COUNTS (DEBUG)
========================= */
function count() {
  let socketCount = 0;
  for (const sockets of userSockets.values()) {
    socketCount += sockets.size;
  }

  return {
    users: userSockets.size,
    sockets: socketCount,
  };
}

module.exports = {
  addSocket,
  removeSocket,
  getSockets,
  getAnySocket,
  isOnline,
  snapshot,
  count,
};
