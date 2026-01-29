const { getIO } = require("./index");

/* =========================
   EMIT TO USER (ALL DEVICES)
========================= */
const emitToUser = (userId, event, payload) => {
  try {
    const io = getIO();
    io.to(String(userId)).emit(event, payload);
  } catch (err) {
    console.error("Socket emit failed:", err.message);
  }
};

module.exports = {
  emitToUser,
};
