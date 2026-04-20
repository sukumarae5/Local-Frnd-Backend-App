

const audioCallHandler = require("./audioCall");
const videoCallHandler = require("./videoCall");
const CallService = require("../services/callServices");
const notificationService = require("../services/notificationService");

module.exports = (socket, io) => {

  const myUserId = String(socket.user.user_id);

  /* =============================
     CALL ACCEPT (FRIEND + RANDOM)
  ============================== */

  socket.on("call_accept", async ({ session_id }) => {

    console.log("✅ call_accept by", myUserId, session_id);

    try {

      const session = await CallService.getSessionUsers(session_id);
      if (!session) return;

      const full = await CallService.getSessionById(session_id);
      if (!full) return;

      const { caller_id, receiver_id } = session;

      // only participants
      if (
        String(caller_id) !== myUserId &&
        String(receiver_id) !== myUserId
      ) {
        return;
      }


      if (full.status !== "RINGING") {
        return;
      }
       await CallService.connectSession(session_id);
      // io.to(String(caller_id)).emit("call_accepted", {
      //   session_id,
      //   call_type: full.type,
      //   is_friend: session_id.startsWith("FRIEND")
      // });

      // io.to(String(receiver_id)).emit("call_accepted", {
      //   session_id,
      //   call_type: full.type,
      //    is_friend: session_id.startsWith("FRIEND")
      // });


      io.to(String(caller_id)).emit("call_accepted", {
  session_id,
  call_type: full.type,
  is_friend: session_id.startsWith("FRIEND"),
  caller_id
});

io.to(String(receiver_id)).emit("call_accepted", {
  session_id,
  call_type: full.type,
  is_friend: session_id.startsWith("FRIEND"),
  caller_id
});

    } catch (err) {
      console.log("call_accept error:", err.message);
    }
  });

  /* =============================
     CALL REJECT1
  ============================== */

  // socket.on("call_reject", async ({ session_id }) => {

  //   console.log("❌ call_reject by", myUserId, session_id);

  //   try {

  //     const session =
  //       await CallService.getSessionUsers(session_id);

  //     if (!session) return;

  //     const { caller_id, receiver_id } = session;

  //     if (
  //       String(caller_id) !== myUserId &&
  //       String(receiver_id) !== myUserId
  //     ) {
  //       return;
  //     }

  //     await CallService.endSession(session_id);

  //     io.to(String(caller_id)).emit("call_rejected", { session_id });
  //     io.to(String(receiver_id)).emit("call_rejected", { session_id });

  //   } catch (err) {
  //     console.log("call_reject error:", err.message);
  //   }
  // });

socket.on("call_reject", async ({ session_id }) => {
  try {
    const session = await CallService.getSessionUsers(session_id);
    if (!session) return;

    const full = await CallService.getSessionById(session_id);
    if (!full) return;

    const { caller_id, receiver_id } = session;

    // Only participants allowed
    if (
      String(caller_id) !== myUserId &&
      String(receiver_id) !== myUserId
    ) {
      return;
    }

    // Only reject if still ringing
    if (full.status !== "RINGING") return;

    await CallService.endSession(session_id);

    // 🔥 If receiver rejected → caller gets missed call
    if (String(receiver_id) === myUserId) {
      await notificationService.createNotification(
        receiver_id, // sender (rejector)
        caller_id,   // receiver (original caller)
        "MISSED_CALL",
        `Missed ${full.type.toLowerCase()} call`,
        {
          call_type: full.type,
          session_id
        }
      );

      io.to(String(caller_id)).emit("new_notification");
    }

    io.to(String(caller_id)).emit("call_rejected", { session_id });
    io.to(String(receiver_id)).emit("call_rejected", { session_id });

  } catch (err) {
    console.log("call_reject error:", err.message);
  }
});

  audioCallHandler(socket, io);
  videoCallHandler(socket, io);
};
