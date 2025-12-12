const audioCallHandler = require('./audioCall');
const videoCallHandler = require('./videoCall');

module.exports = (socket, io) => {
  audioCallHandler(socket, io);
  videoCallHandler(socket, io);
};
