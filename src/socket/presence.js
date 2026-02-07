// socket/presence.js
const userModel = require("../models/user");

module.exports = async function presenceHandler(io, userId, status) {
  console.log(`Presence handler invoked for userId: ${userId} with status: ${status}`); 
  if (status === "online") {
    await userModel.markOnline(userId);
  } else {
    await userModel.markOffline(userId);
  }

  io.emit("presence_update", {
    user_id: userId,
    status,
  });

  console.log(
    status === "online"
      ? "🟢 User online:"
      : "🔴 User offline:",
    userId
  );
};
