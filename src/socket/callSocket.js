// const audioCallHandler = require("./audioCall");
// const videoCallHandler = require("./videoCall");
// const CallService = require("../services/callServices");

// module.exports = (socket, io) => {

//   const myUserId = String(socket.user.user_id);

//   /* =============================
//      CALL ACCEPT
//   ============================== */

// socket.on("call_accept", async ({ session_id }) => {

//   console.log("✅ call_accept by", myUserId, session_id);

//   try {

//     const session =
//       await CallService.getSessionUsers(session_id);

//     if (!session) return;

//     const full =
//       await CallService.getSessionById(session_id);

//     const { caller_id, receiver_id } = session;

//     if (
//       String(caller_id) !== myUserId &&
//       String(receiver_id) !== myUserId
//     ) {
//       return;
//     }

//     io.to(String(caller_id)).emit("call_accepted", {
//       session_id,
//       call_type: full.type
//     });

//     io.to(String(receiver_id)).emit("call_accepted", {
//       session_id,
//       call_type: full.type
//     });

//   } catch (err) {
//     console.log("call_accept error:", err.message);
//   }
// });

//   /* =============================
//      CALL REJECT
//   ============================== */

//   socket.on("call_reject", async ({ session_id }) => {

//     console.log("❌ call_reject by", myUserId, session_id);

//     try {

//       const session =
//         await CallService.getSessionUsers(session_id);

//       if (!session) return;

//       const { caller_id, receiver_id } = session;

//       // only participants can reject
//       if (
//         String(caller_id) !== myUserId &&
//         String(receiver_id) !== myUserId
//       ) {
//         return;
//       }

//       await CallService.endSession(session_id);

//       io.to(String(caller_id)).emit("call_rejected", {
//         session_id
//       });

//       io.to(String(receiver_id)).emit("call_rejected", {
//         session_id
//       });

//     } catch (err) {
//       console.log("call_reject error:", err.message);
//     }
//   });


//   /* =============================
//      EXISTING HANDLERS
//   ============================== */

//   audioCallHandler(socket, io);
//   videoCallHandler(socket, io);
// };


// callSocket.js

const audioCallHandler = require("./audioCall");
const videoCallHandler = require("./videoCall");
const CallService = require("../services/callServices");

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

      // ✅ very important guard
      // accept only if still ringing
      if (full.status !== "RINGING") {
        return;
      }

      // ❗ DO NOT connect audio/video here
      // ❗ DO NOT update CONNECTED here

      // just notify both users

      io.to(String(caller_id)).emit("call_accepted", {
        session_id,
        call_type: full.type
      });

      io.to(String(receiver_id)).emit("call_accepted", {
        session_id,
        call_type: full.type
      });

    } catch (err) {
      console.log("call_accept error:", err.message);
    }
  });

  /* =============================
     CALL REJECT
  ============================== */

  socket.on("call_reject", async ({ session_id }) => {

    console.log("❌ call_reject by", myUserId, session_id);

    try {

      const session =
        await CallService.getSessionUsers(session_id);

      if (!session) return;

      const { caller_id, receiver_id } = session;

      if (
        String(caller_id) !== myUserId &&
        String(receiver_id) !== myUserId
      ) {
        return;
      }

      await CallService.endSession(session_id);

      io.to(String(caller_id)).emit("call_rejected", { session_id });
      io.to(String(receiver_id)).emit("call_rejected", { session_id });

    } catch (err) {
      console.log("call_reject error:", err.message);
    }
  });

  audioCallHandler(socket, io);
  videoCallHandler(socket, io);
};
