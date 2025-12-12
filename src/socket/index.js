const authSocketMiddleware = require('../middlewares/authSocketMiddleware');
const presenceHandler = require('./presence');
const callSocket = require('./callSocket');
const socketMap = require('./socketMap');

let ioInstance = null;

function init(io) {
  ioInstance = io;

  io.use(authSocketMiddleware);

  io.on("connection", (socket) => {
    const user = socket.user;
    if (!user?.user_id) return socket.disconnect(true);

    console.log("Socket connected:", user.user_id, socket.id);
    presenceHandler(io, socket);
    callSocket(socket, io);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", user.user_id, socket.id);
      
    });
  });

  return io;
}

function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized yet!");
  }
  return ioInstance;
}



module.exports = { init, getIO };
