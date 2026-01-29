const authSocketMiddleware = require("../middlewares/authSocketMiddleware");
const presenceHandler = require("./presence");
const callSocket = require("./callSocket");
const socketMap = require("./socketMap");
const notification = require("./notification");

let ioInstance = null;

function init(io) {
  ioInstance = io;

  io.use(authSocketMiddleware);

  io.on("connection", (socket) => {
    const user = socket.user;
    if (!user?.user_id) {
      socket.disconnect(true);
      return;
    }

    const userId = String(user.user_id);
    console.log("🔗 Socket connected:", userId, socket.id);

    const wasOffline = !socketMap.isOnline(userId);

    socketMap.addSocket(userId, socket.id);
    socket.join(userId); // 🔥 USER ROOM

    if (wasOffline) {
      presenceHandler(io, userId, "online"); // non-blocking
    }

    callSocket(socket, io);
    notification(socket, io);

    socket.on("disconnect", () => {
      console.log("⚠️ Socket disconnected:", userId, socket.id);

      const fullyOffline = socketMap.removeSocket(userId, socket.id);
      if (fullyOffline) {
        presenceHandler(io, userId, "offline");
      }
    });
  });
}

function getIO() {
  if (!ioInstance) throw new Error("Socket.IO not initialized");
  return ioInstance;
}

module.exports = { init, getIO };
