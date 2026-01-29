const CallService = require("../services/callServices");
const coinService = require("../services/coinService");


const joinedUsers = new Map();


const heartbeats = new Map();


const connectedSessions = new Set();

module.exports = (socket, io) => {
  const userId = String(socket.user.user_id);

  /* ================= JOIN ================= */
  socket.on("video_join", async ({ session_id }) => {
    const room = `video_call:${session_id}`;
    socket.join(room);

    if (!joinedUsers.has(session_id)) {
      joinedUsers.set(session_id, new Set());
    }

    // ⛔ Prevent duplicate join
    if (joinedUsers.get(session_id).has(userId)) return;

    joinedUsers.get(session_id).add(userId);

    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;

    console.log("🎥 video_join", { session_id, userId, roomSize });

    // 🔥 Emit ONLY ONCE when 2 users join
    if (roomSize === 2 && !connectedSessions.has(session_id)) {
      connectedSessions.add(session_id);

      try {
        await CallService.connectSession(session_id);
      coinService.startLiveBilling(session_id, io);
      
      } catch (err) {
        console.error("⚠️ connectSession:", err.message);
      }

      io.to(room).emit("video_connected");
    }
  });

  /* ================= HEARTBEAT ================= */
  socket.on("video_ping", ({ session_id }) => {
    heartbeats.set(session_id, Date.now());
  });

  /* ================= SIGNALING ================= */
  socket.on("video_offer", ({ session_id, offer }) => {
    socket
      .to(`video_call:${session_id}`)
      .emit("video_offer", { offer });
  });

  socket.on("video_answer", ({ session_id, answer }) => {
    socket
      .to(`video_call:${session_id}`)
      .emit("video_answer", { answer });
  });

  socket.on("video_ice_candidate", ({ session_id, candidate }) => {
    socket
      .to(`video_call:${session_id}`)
      .emit("video_ice_candidate", { candidate });
  });

  /* ================= HANGUP ================= */
  socket.on("video_call_hangup", async ({ session_id }) => {
    console.log("📴 video_call_hangup", session_id);

    try {
            coinService.stopLiveBilling(session_id);

      await CallService.endSession(session_id);
      await coinService.finalizeOnHangup(session_id);
    } catch (err) {
      console.error("❌ video hangup error:", err.message);
    }

    io.to(`video_call:${session_id}`).emit("video_call_ended");

    joinedUsers.delete(session_id);
    heartbeats.delete(session_id);
    connectedSessions.delete(session_id);
  });
};
