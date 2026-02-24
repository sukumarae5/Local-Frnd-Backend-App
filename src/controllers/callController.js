const callService = require("../services/callServices");
const callModel = require("../models/callModel");
const { getIO } = require("../socket");
const socketMap = require("../socket/socketMap");


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


const searchingFemales = async (req, res) => {
  const data = await callModel.getSearchingFemales();
  console.log("Searching females data:", data); 
  res.json({ success: true, data });
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

    if (!session) {
      return res.json({
        status: "NO_MATCH",
        message: "No female users currently searching"
      });
    }

    const io = getIO();
io.to(String(session.caller_id)).emit("incoming_call", {
  session_id: session.session_id,
  from: req.user.user_id,
  call_type,
  status: "RINGING"
});
    res.json({
      status: "RINGING",
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
      
    });

    res.json({
      status: "RINGING",
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

// const friendConnect = async (req, res) => {
// console.log("Friend connect request:",  req.body);
//   try {

//     const { friend_id, call_type } = req.body;
// console.log("Friend connect request:", req.user, friend_id, call_type); 
//     const session = await callService.friendConnect(
//       req.user.user_id,
//       friend_id,
//       call_type
//     );
// console.log("Friend connect session:", session);
//     console.log("fghjkl", socketMap)
//     if (!socketMap.isOnline(String(friend_id))) {
//       return res.json({ status: "USER_OFFLINE" });
//     }

//     const io = getIO();

//     io.to(String(friend_id)).emit("incoming_call", {
//       session_id: session.session_id,
//       from: req.user.user_id,
//       call_type,
//       status: "RINGING",
//       is_friend: true
//     });

//     return res.json({
//       status: "RINGING",
//       session_id: session.session_id
//     });

//   } catch (err) {

//     if (err.message === "USER_BUSY") {
//       return res.json({ status: "BUSY" });
//     }

//     if (err.message === "FRIEND_BUSY") {
//       return res.json({ status: "BUSY" });
//     }

//     if (err.message === "NOT_FRIEND") {
//       return res.status(403).json({ error: "Not friends" });
//     }

//     return res.status(400).json({ error: err.message });
//   }
// };

const friendConnect = async (req, res) => {

  try {

    const { friend_id, call_type } = req.body;

    const session = await callService.friendConnect(
      req.user.user_id,
      friend_id,
      call_type
    );

    if (!socketMap.isOnline(String(friend_id))) {
      return res.json({ status: "USER_OFFLINE" });
    }

    const io = getIO();

    io.to(String(friend_id)).emit("incoming_call", {
      session_id: session.session_id,
      from: req.user.user_id,
      call_type: session.type,   // safer
      status: "RINGING",
      is_friend: true
    });

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
      return res.json({ status: "BUSY" });
    }

    if (err.message === "NOT_FRIEND") {
      return res.status(403).json({ error: "Not friends" });
    }

    return res.status(400).json({ error: err.message });
  }
};



module.exports = {
  startSearch,
  searchingFemales,
  randomConnect,
  directConnect,
  cancelSearch,
  getConnectedCallDetails,
  friendConnect
};
