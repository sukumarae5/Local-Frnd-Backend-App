const CallService = require("../services/callServices");
const coinService = require("../services/coinService");

const joinedUsers = new Map();
const heartbeats = new Map();
const connectedSessions = new Set();

module.exports = (socket, io) => {
  const userId = String(socket.user.user_id);

  // ✅ REPLACE the video_join handler
socket.on("video_join", async ({ session_id }) => {
  const room = `video_call:${session_id}`;
  socket.join(room);
  socket.session_id = session_id;

  const roomUsers = io.sockets.adapter.rooms.get(room);
  const roomSize = roomUsers ? roomUsers.size : 0;

  console.log("🎥 video_join details:", { session_id, roomSize });

  if (roomSize === 2 && !connectedSessions.has(session_id)) {
    connectedSessions.add(session_id);

    // ✅ Force connect — handles RINGING friend sessions
    try {
      await CallService.connectSession(session_id);
    } catch (e) {
      console.log("connectSession in video_join:", e.message);
    }

    coinService.startLiveBilling(session_id, io);
    console.log("🚀 Emitting video_connected");
    io.to(room).emit("video_connected");
  }
});

  /* ================= HEARTBEAT ================= */
  socket.on("video_ping", ({ session_id }) => {
    heartbeats.set(session_id, Date.now());
  });

  /* ================= SIGNALING ================= */
  socket.on("video_offer", ({ session_id, offer }) => {
    socket.to(`video_call:${session_id}`).emit("video_offer", { offer });
  });

  socket.on("video_answer", ({ session_id, answer }) => {
    socket.to(`video_call:${session_id}`).emit("video_answer", { answer });
  });

  socket.on("video_ice_candidate", ({ session_id, candidate }) => {
    const room = `video_call:${session_id}`;
    // FIX: Excludes data packet routing echo back loops to emitting local hardware instance
    socket.to(room).emit("video_ice_candidate", { candidate });
  });

  /* ================= HANGUP & DISCONNECT CLEANUP ================= */
  const handleVideoHangup = async (session_id) => {
    if (!session_id) return;
    console.log("📴 Executing clean structural hangup cycle on video session:", session_id);

    try {
      coinService.stopLiveBilling(session_id);
      await CallService.endSession(session_id);
      await coinService.finalizeOnHangup(session_id);
    } catch (err) {
      console.error("❌ Video hangup error processing context metrics:", err.message);
    }

    io.to(`video_call:${session_id}`).emit("video_call_ended");

    // Free heap memory allocation vectors
    joinedUsers.delete(session_id);
    heartbeats.delete(session_id);
    connectedSessions.delete(session_id);
  };

  socket.on("video_call_hangup", async ({ session_id }) => {
    await handleVideoHangup(session_id);
  });

  socket.on("disconnect", async () => {
    console.log("❌ Video websocket instance state dropped for connection socket:", socket.id);
    const session_id = socket.session_id;
    if (session_id && connectedSessions.has(session_id)) {
      await handleVideoHangup(session_id);
    }
  });
};