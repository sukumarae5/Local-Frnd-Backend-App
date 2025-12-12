const CallService = require('../services/callServices');
const coinService = require('../services/coinService');
const socketMap = require('./socketMap');

module.exports = (socket, io) => {

  const user = socket.user;
  if (!user?.user_id) return;

  const emitToUser = (uid, event, data) => {
    const sockets = socketMap.getSockets(uid);
    for (const sid of sockets) {
      io.to(sid).emit(event, data);
    }
  };

  // OFFER
  socket.on("audio_offer", ({ session_id, target_id, offer }) => {
    emitToUser(target_id, "audio_offer", { session_id, from: user.user_id, offer });
  });

  // ANSWER
  socket.on("audio_answer", ({ session_id, target_id, answer }) => {
    emitToUser(target_id, "audio_answer", { session_id, from: user.user_id, answer });
  });

  // ICE
  socket.on("audio_ice_candidate", ({ session_id, target_id, candidate }) => {
    emitToUser(target_id, "audio_ice_candidate", { session_id, from: user.user_id, candidate });
  });

  // ACCEPT
  socket.on("audio_call_accept", async ({ session_id }) => {
    try {
      const session = await CallService.getSession(session_id);
      if (!session) return socket.emit("error", { message: "session_not_found" });

      if (session.type !== "AUDIO") return socket.emit("error", { message: "not_audio_call" });

      await CallService.connectSession(session_id);

      await coinService.startSessionBilling({
        session_id,
        caller_id: session.caller_id,
        receiver_id: session.receiver_id,
        type: "AUDIO",
        coin_rate_per_min: coinService.RATES.AUDIO,
      });

      emitToUser(session.caller_id, "audio_call_connected", { session_id });
      emitToUser(session.receiver_id, "audio_call_connected", { session_id });

    } catch (err) {
      console.error("audio_call_accept error", err);
    }
  });

  // REJECT
  socket.on("audio_call_reject", async ({ session_id }) => {
    try {
      await CallService.endSession(session_id);
      const session = await CallService.getSession(session_id);
      emitToUser(session?.caller_id, "audio_call_rejected", { session_id });
    } catch (err) {
      console.error("audio_call_reject error", err);
    }
  });

  // HANGUP
  socket.on("audio_call_hangup", async ({ session_id }) => {
    try {
      const session = await CallService.getSession(session_id);
      if (!session) return;

      await CallService.endSession(session_id);
      const result = await coinService.finalizeOnHangup(session_id);

      emitToUser(session.caller_id, "audio_call_ended", { session_id, reason: "HANGUP", result });
      emitToUser(session.receiver_id, "audio_call_ended", { session_id, reason: "HANGUP", result });

    } catch (err) {
      console.error("audio_call_hangup error", err);
    }
  });
};
