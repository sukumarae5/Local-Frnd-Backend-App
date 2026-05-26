const CallService = require("../services/callServices");
const coinService = require("../services/coinService");

const joinedUsers = new Map();
const heartbeats = new Map();
const connectedSessions = new Set();

module.exports = (socket, io) => {
  const userId = String(socket.user.user_id);

  // ✅ REPLACE the audio_join handler
socket.on("audio_join", async ({ session_id }) => {
  const room = `call:${session_id}`;
  socket.join(room);
  socket.session_id = session_id;

  const roomUsers = io.sockets.adapter.rooms.get(room);
  const roomSize = roomUsers ? roomUsers.size : 0;

  console.log("📞 audio_join details:", { session_id, roomSize });

  if (roomSize === 2 && !connectedSessions.has(session_id)) {
    connectedSessions.add(session_id);

    // ✅ Force connect session — handles RINGING friend sessions
    // For RANDOM/DIRECT this is already CONNECTED so update is a no-op
    try {
      await CallService.connectSession(session_id);
    } catch (e) {
      console.log("connectSession in audio_join:", e.message);
    }

    coinService.startLiveBilling(session_id, io);
    console.log("🚀 Emitting audio_connected");
    io.to(room).emit("audio_connected");
  }
});

  /* ================= HEARTBEAT ================= */
  socket.on("audio_ping", ({ session_id }) => {
    heartbeats.set(session_id, Date.now());
  });

  /* ================= SIGNALING ================= */
  socket.on("audio_offer", ({ session_id, offer }) => {
    socket.to(`call:${session_id}`).emit("audio_offer", { offer });
  });

  socket.on("audio_answer", ({ session_id, answer }) => {
    socket.to(`call:${session_id}`).emit("audio_answer", { answer });
  });

  socket.on("audio_ice_candidate", ({ session_id, candidate }) => {
    const room = `call:${session_id}`;
    // FIX: Using socket.to ensures the packet relays to the remote peer ONLY without bouncing back to the sender
    socket.to(room).emit("audio_ice_candidate", { candidate });
  });

  /* ================= HANGUP & DISCONNECT CLEANUP ================= */
  const handleAudioHangup = async (session_id) => {
    if (!session_id) return;
    console.log("📴 Executing clean structural hangup cycle on session:", session_id);

    try {
      coinService.stopLiveBilling(session_id);
      await CallService.endSession(session_id);
      await coinService.finalizeOnHangup(session_id);
    } catch (err) {
      console.error("❌ Audio hangup error processing context metrics:", err.message);
    }

    io.to(`call:${session_id}`).emit("audio_call_ended");

    // Free memory frames cleanly
    joinedUsers.delete(session_id);
    heartbeats.delete(session_id);
    connectedSessions.delete(session_id);
  };

  socket.on("audio_call_hangup", async ({ session_id }) => {
    await handleAudioHangup(session_id);
  });

  socket.on("disconnect", async () => {
    console.log("❌ Audio websocket instance state dropped for connection socket:", socket.id);
    const session_id = socket.session_id;
    if (session_id && connectedSessions.has(session_id)) {
      await handleAudioHangup(session_id);
    }
  });
};