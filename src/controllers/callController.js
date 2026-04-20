const callService = require("../services/callServices");
const callModel = require("../models/callModel");
const { getIO } = require("../socket");
const socketMap = require("../socket/socketMap");
const notificationService = require("../services/notificationService");
const db = require("../config/db");

const startSearch = async (req, res) => {
  console.log("Starting search for user:", req.user);

  try {
    if (req.user.gender !== "Female") {
      return res.status(403).json({ error: "Only female can search" });
    }

    const { call_type } = req.body;

    const session_id = await callService.startFemaleSearch(
      req.user.user_id,
      call_type
    );

    res.json({
      success: true,
      session_id,
      status: "SEARCHING"
    });

  } catch (err) {
    console.error("startSearch error:", err.message);
    res.status(400).json({ error: err.message });
  }
};


// const searchingFemales = async (req, res) => {
//   const data = await callModel.getSearchingFemales();
//   console.log("Searching females data:", data); 
//   res.json({ success: true, data });
// };


const searchingFemales = async (req, res) => {
  try {

    const filters = {
      online: req.query.online,
      type: req.query.type,
      language: req.query.language,
      country_id: req.query.country_id,
      state_id: req.query.state_id,
      city_id: req.query.city_id,
      interest_id: req.query.interest_id
    };

    const females = await callModel.getSearchingFemales(filters);

    res.json({
      success: true,
      data: females
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


const randomConnect = async (req, res) => {
  console.log("Random connect request:", req.user, req.body);

  try {
    if (req.user.gender !== "Male") {
      return res.status(403).json({ error: "Only male can call" });
    }

    const { call_type } = req.body;

    const session = await callService.randomMatchMale(
      req.user.user_id,
      call_type
    );

    // if (!session) {
    //   return res.json({
    //     status: "NO_MATCH",
    //     message: "No female users currently searching"
    //   });
    // }

    if (!session) {

  const waitingSessionId = "WAIT_" + Date.now();

  // 🔥 STEP 1: REMOVE OLD WAITING (ADD HERE)
  await db.execute(`
    DELETE FROM call_sessions 
    WHERE caller_id = ? AND status = 'WAITING'
  `, [req.user.user_id]);

  // 🔥 STEP 2: INSERT NEW WAITING
  await db.execute(`
    INSERT INTO call_sessions
    (session_id, caller_id, receiver_id, status, type, created_at, updated_at)
    VALUES (?, ?, NULL, 'WAITING', ?, NOW(), NOW())
  `, [waitingSessionId, req.user.user_id, call_type]);

  return res.json({
    status: "NO_MATCH"
  });
}

    const io = getIO();
io.to(String(session.caller_id)).emit("incoming_call", {
  session_id: session.session_id,
  from: req.user.user_id,
  call_type,
  status: "ACCEPTED",
  call_mode: "RANDOM"
});
    res.json({
      status: "ACCEPTED",
      session_id: session.session_id,
      call_type
    });

  } catch (err) {
    console.error("randomConnect error:", err.message);
    res.status(400).json({ error: err.message });
  }
};



const directConnect = async (req, res) => {
  try {
    if (req.user.gender !== "Male") {
      return res.status(403).json({ error: "Only male can call" });
    }

    const { female_id, call_type } = req.body;

    const session = await callService.directMatchMale(
      req.user.user_id,
      female_id,
      call_type
    );

    if (!session) {
      return res.status(400).json({
        error: "User not searching or call type mismatch"
      });
    }

    const io = getIO();

    io.to(String(session.caller_id)).emit("incoming_call", {
      session_id: session.session_id,
      from: req.user.user_id,
      call_type,
      status: "ACCEPTED",
  call_mode: "DIRECT"
    });

    res.json({
      status: "ACCEPTED",
      session_id: session.session_id,
      call_type
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



const cancelSearch = async (req, res) => {
  try {
    if (req.user.gender !== "Female") {
      return res.status(403).json({ error: "Only female can cancel search" });
    }

    await callService.cancelSearch(req.user.user_id);

    res.json({
      success: true,
      message: "Search cancelled"
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


const getConnectedCallDetails = async (req, res) => {
 console.log("Getting connected call details for user:", req.user); 
  try {

    const row =
      await callService.getConnectedCallDetails(req.user.user_id);
console.log("Connected call details:", row);  
    if (!row) {
      return res.json({
        success: true,
        connected: false
      });
    }

    return res.json({
      success: true,
      connected: true,
      session_id: row.session_id,
      call_type: row.type,

      caller: {
        user_id: row.caller_id,
        name: row.caller_name,
        gender: row.caller_gender,
        bio: row.caller_bio,
        avatar: row.caller_avatar
      },

      connected_user: {
        user_id: row.receiver_id,
        name: row.receiver_name,
        gender: row.receiver_gender,
        bio: row.receiver_bio,
        avatar: row.receiver_avatar
      }
    });

  } catch (err) {
    console.error("getConnectedCallDetails error:", err);
    res.status(400).json({ error: err.message });
  }
};


const friendConnect = async (req, res) => {
  console.log("Friend connect request:", req.user, req.body); 
  try {
    const { friend_id, call_type } = req.body;
    const caller_id = req.user.user_id;

    const io = getIO();

    /* ===============================
       1️⃣ CHECK ONLINE FIRST
    =============================== */
    if (!socketMap.isOnline(String(friend_id))) {

      await notificationService.createNotification(
        caller_id,
        friend_id,
        "MISSED_CALL",
        `Missed ${call_type.toLowerCase()} call`,
        {
          call_type,
          session_id: null
        }
      );

      io.to(String(friend_id)).emit("new_notification");

      return res.json({ status: "USER_OFFLINE" });
    }

    /* ===============================
       2️⃣ CREATE SESSION
    =============================== */
    const session = await callService.friendConnect(
      caller_id,
      friend_id,
      call_type
    );

    /* ===============================
       3️⃣ EMIT INCOMING CALL
    =============================== */
    io.to(String(friend_id)).emit("incoming_call", {
      session_id: session.session_id,
      from: caller_id,
      call_type: session.type,
      status: "RINGING",
      is_friend: true,
      call_mode: "FRIEND"
    });

    /* ===============================
       4️⃣ RING TIMEOUT (30 sec)
    =============================== */
    const timeout = setTimeout(async () => {

      const full = await callService.getSessionById(session.session_id);
      if (!full) return;

      if (full.status === "RINGING") {

        await callService.endSession(session.session_id);

        await notificationService.createNotification(
          caller_id,
          friend_id,
          "MISSED_CALL",
          `Missed ${session.type.toLowerCase()} call`,
          {
            call_type: session.type,
            session_id: session.session_id
          }
        );

        io.to(String(friend_id)).emit("new_notification");

        io.to(String(caller_id)).emit("call_timeout", {
          session_id: session.session_id
        });
      }

    }, 30000);

    return res.json({
      status: "RINGING",
      session_id: session.session_id,
      call_type: session.type,
      is_friend: true
    });

  } catch (err) {

    if (err.message === "USER_BUSY") {
      return res.json({ status: "BUSY" });
    }

    if (err.message === "FRIEND_BUSY") {

      await notificationService.createNotification(
        req.user.user_id,
        friend_id,
        "MISSED_CALL",
        `Missed ${call_type.toLowerCase()} call`,
        {
          call_type,
          session_id: null
        }
      );

      getIO().to(String(friend_id)).emit("new_notification");

      return res.json({ status: "BUSY" });
    }

    if (err.message === "NOT_FRIEND") {
      return res.status(403).json({ error: "Not friends" });
    }

    return res.status(400).json({ error: err.message });
  }
};

const cancelMaleWaiting = async (req, res) => {
  try {

    await callService.cancelMaleWaiting(req.user.user_id);

    res.json({
      success: true,
      message: "Waiting cancelled"
    });

  } catch (err) {
    console.error("cancelMaleWaiting error:", err.message);
    res.status(400).json({ error: err.message });
  }
};
module.exports = {
  startSearch,
  searchingFemales,
  randomConnect,
  directConnect,
  cancelSearch,
  getConnectedCallDetails,
  friendConnect,
  cancelMaleWaiting
};
