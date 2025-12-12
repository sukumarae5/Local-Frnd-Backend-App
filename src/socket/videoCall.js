// src/socket/call/videoCall.js
const CallService = require('../services/callServices');
const coinService = require('../services/coinService');
const socketMap = require('./socketMap');

module.exports = (socket, io) => {
  const user = socket.user;
  if (!user?.user_id) return;

  // Sends event to ALL sockets of a user
  const emitToUser = (uid, event, data) => {
    const sockets = socketMap.getSockets(uid);  // returns Set()
    for (const sid of sockets) {
      io.to(sid).emit(event, data);
    }
  };

  // -----------------------------------
  // VIDEO OFFER
  // -----------------------------------
  socket.on("video_offer", ({ session_id, target_id, offer }) => {
    emitToUser(target_id, "video_offer", {
      session_id,
      from: user.user_id,
      offer
    });
  });

  // -----------------------------------
  // VIDEO ANSWER
  // -----------------------------------
  socket.on("video_answer", ({ session_id, target_id, answer }) => {
    emitToUser(target_id, "video_answer", {
      session_id,
      from: user.user_id,
      answer
    });
  });

  // -----------------------------------
  // VIDEO ICE CANDIDATE
  // -----------------------------------
  socket.on("video_ice_candidate", ({ session_id, target_id, candidate }) => {
    emitToUser(target_id, "video_ice_candidate", {
      session_id,
      from: user.user_id,
      candidate
    });
  });

  // -----------------------------------
  // ACCEPT VIDEO CALL
  // -----------------------------------
  socket.on("video_call_accept", async ({ session_id }) => {
    try {
      const session = await CallService.getSession(session_id);
      if (!session)
        return socket.emit("error", { message: "session_not_found" });

      if (session.type !== "VIDEO")
        return socket.emit("error", { message: "not_video_call" });

      // Mark call as CONNECTED
      await CallService.connectSession(session_id);

      // Start billing
      await coinService.startSessionBilling({
        session_id,
        caller_id: session.caller_id,
        receiver_id: session.receiver_id,
        type: "VIDEO",
        coin_rate_per_min: coinService.RATES.VIDEO,
      });

      // Notify both users (all their devices)
      emitToUser(session.caller_id, "video_call_connected", { session_id });
      emitToUser(session.receiver_id, "video_call_connected", { session_id });

    } catch (err) {
      console.error("video_call_accept error", err);
    }
  });

  // -----------------------------------
  // REJECT VIDEO CALL
  // -----------------------------------
  socket.on("video_call_reject", async ({ session_id }) => {
    try {
      await CallService.endSession(session_id);

      const session = await CallService.getSession(session_id);

      emitToUser(session?.caller_id, "video_call_rejected", {
        session_id
      });
    } catch (err) {
      console.error("video_call_reject error", err);
    }
  });

  // -----------------------------------
  // HANGUP VIDEO CALL
  // -----------------------------------
  socket.on("video_call_hangup", async ({ session_id }) => {
    try {
      const session = await CallService.getSession(session_id);
      if (!session) return;

      // End call session
      await CallService.endSession(session_id);

      // Final billing reconciliation
      const result = await coinService.finalizeOnHangup(session_id);

      // Notify BOTH sides, ALL devices
      emitToUser(session.caller_id, "video_call_ended", {
        session_id,
        reason: "HANGUP",
        result
      });

      emitToUser(session.receiver_id, "video_call_ended", {
        session_id,
        reason: "HANGUP",
        result
      });

    } catch (err) {
      console.error("video_call_hangup error", err);
    }
  });
};
