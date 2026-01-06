module.exports = (socket, io) => {
  const userId = socket.user.user_id;

  socket.on("video_join", ({ session_id }) => {
    socket.join(`call:${session_id}`);
  });

  socket.on("video_offer", ({ session_id, offer }) => {
    socket.to(`call:${session_id}`).emit("video_offer", { offer });
  });

  socket.on("video_answer", ({ session_id, answer }) => {
    socket.to(`call:${session_id}`).emit("video_answer", { answer });
  });

  socket.on("video_ice_candidate", ({ session_id, candidate }) => {
    socket.to(`call:${session_id}`).emit("video_ice_candidate", { candidate });
  });
};
