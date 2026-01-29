module.exports = (socket, io) => {
  const userId = socket.user.user_id;

  console.log("🔔 Notification handler ready for user:", userId);

  // (No client emits needed here for friend system)
};
