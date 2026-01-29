const CallService = require("../services/callServices");
const coinService = require("../services/coinService");


const joinedUsers = new Map();

const heartbeats = new Map();

const connectedSessions = new Set();

module.exports = (socket, io) => {
  const userId = String(socket.user.user_id);

  socket.on("audio_join", async ({ session_id }) => {
    const room = `call:${session_id}`;
    socket.join(room);

    if (!joinedUsers.has(session_id)) {
      joinedUsers.set(session_id, new Set());
    }

    // ⛔ Prevent duplicate join
    if (joinedUsers.get(session_id).has(userId)) return;

    joinedUsers.get(session_id).add(userId);

    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;

    console.log("📞 audio_join", { session_id, userId, roomSize });

    // 🔥 Emit ONCE
    if (roomSize === 2 && !connectedSessions.has(session_id)) {
      connectedSessions.add(session_id);

      try {
        await CallService.connectSession(session_id);

        coinService.startLiveBilling(session_id, io);
      } catch (err) {
        console.error("⚠️ connectSession:", err.message);
      }

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
    socket.to(`call:${session_id}`).emit("audio_ice_candidate", { candidate });
  });

  /* ================= HANGUP ================= */
  socket.on("audio_call_hangup", async ({ session_id }) => {
    console.log("📴 audio_call_hangup", session_id);

    try {
      coinService.stopLiveBilling(session_id)
      await CallService.endSession(session_id);
      await coinService.finalizeOnHangup(session_id);
    } catch (err) {
      console.error("❌ hangup error:", err.message);
    }

    io.to(`call:${session_id}`).emit("audio_call_ended");

    joinedUsers.delete(session_id);
    heartbeats.delete(session_id);
    connectedSessions.delete(session_id);
  });
};


/**
 * Audio Call Socket (WebRTC Signaling)
 * -----------------------------------
 * Fixes:
 *  - Offer race condition
 *  - Connecting forever issue
 *  - Double caller issue
 *  - Lost offer on first join
 */

// const waitingUsers = [];
// const activeSessions = new Map();
// const joinedUsers = new Map();

// module.exports = (socket, io) => {
//   if (!socket.user || !socket.user.user_id) return;

//   const userId = String(socket.user.user_id);
//   console.log("🔊 Audio call socket connected:", userId);

//   /* ================= REQUEST ================= */
//   socket.on("request_audio", () => {
//     if (waitingUsers.includes(userId)) return;

//     if (waitingUsers.length > 0) {
//       const peerId = waitingUsers.shift();
//       const session_id = `audio_${Date.now()}`;

//       activeSessions.set(session_id, [userId, peerId]);
//       joinedUsers.set(session_id, new Set());

//       socket.emit("call_matched", {
//         session_id,
//         peer_id: peerId,
//         role: "caller",
//       });

//       io.to(peerId).emit("call_matched", {
//         session_id,
//         peer_id: userId,
//         role: "receiver",
//       });

//       console.log("🤝 Matched:", userId, peerId, session_id);
//     } else {
//       waitingUsers.push(userId);
//       console.log("⏳ Added to waiting list:", userId);
//     }
//   });

//   /* ================= JOIN ================= */
//   socket.on("audio_join", ({ session_id }) => {
//     socket.join(`call:${session_id}`);

//     if (!joinedUsers.has(session_id)) {
//       joinedUsers.set(session_id, new Set());
//     }

//     joinedUsers.get(session_id).add(userId);

//     const count = joinedUsers.get(session_id).size;
//     console.log(`👤 audio_join ${userId} ready: ${count} / 2`);

//     if (count === 2) {
//       console.log("🟢 Both users ready:", session_id);

//       // 🔥 THIS IS THE CRITICAL FIX
//       io.to(`call:${session_id}`).emit("audio_ready");
//     }
//   });

//   /* ================= SIGNALING ================= */
//   socket.on("audio_offer", ({ session_id, offer }) => {
//     socket.to(`call:${session_id}`).emit("audio_offer", { offer });
//   });

//   socket.on("audio_answer", ({ session_id, answer }) => {
//     socket.to(`call:${session_id}`).emit("audio_answer", { answer });
//   });

//   socket.on("audio_ice_candidate", ({ session_id, candidate }) => {
//     socket.to(`call:${session_id}`).emit("audio_ice_candidate", { candidate });
//   });

//   /* ================= LEAVE ================= */
//   socket.on("audio_leave", ({ session_id }) => {
//     joinedUsers.delete(session_id);
//     activeSessions.delete(session_id);
//     socket.leave(`call:${session_id}`);

//     socket.to(`call:${session_id}`).emit("audio_call_ended");
//   });

//   socket.on("disconnect", () => {
//     const idx = waitingUsers.indexOf(userId);
//     if (idx !== -1) waitingUsers.splice(idx, 1);
//   });
// };

