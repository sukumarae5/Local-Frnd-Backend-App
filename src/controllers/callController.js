const { v4: uuidv4 } = require("uuid");
const CallService = require("../services/callServices");
const coinService = require("../services/coinService");
const randomQueue = require("../utils/randomQueue");
const { getIO } = require("../socket");
const userModel = require("../models/user");
const socketMap = require("../socket/socketMap");

const getRate = (type) =>
  type === "VIDEO" ? coinService.RATES.VIDEO : coinService.RATES.AUDIO;

/* ======================================================
   🔹 DIRECT CALL (Male → Female)
====================================================== */
exports.initiate = async (req, res) => {
  try {
    const io = getIO();
    const caller_id = req.user.user_id;
    const { target_user_id, type } = req.body;

    if (!target_user_id || !type) {
      return res.status(400).json({ error: "Missing data" });
    }

    const caller = await userModel.findById(caller_id);
    const target = await userModel.findById(target_user_id);

    if (!caller || !target) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔒 Gender rule
    if (caller.gender !== "Male" || target.gender !== "Female") {
      return res.status(403).json({
        error: "Only Male can call Female",
      });
    }

    const session_id = "CALL_" + uuidv4();
    const rate = getRate(type);

    // 1️⃣ Create session → SEARCHING
    await CallService.createSearching({
      session_id,
      caller_id,
      type,
      coin_rate_per_min: rate,
    });

    // 2️⃣ Match receiver → RINGING
    await CallService.matchToReceiver(session_id, target_user_id);

    // 3️⃣ Notify receiver
    io.to(String(target_user_id)).emit("incoming_call", {
      session_id,
      from: caller_id,
      type,
    });

    // ✅ IMPORTANT: return RINGING
    return res.json({
      status: "RINGING",
      session_id,
    });
  } catch (err) {
    console.error("initiate error", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   🔹 RANDOM CALL (Gender Based)
====================================================== */
exports.randomConnect = async (req, res) => {
  const io = getIO();

  const user_id = String(req.user.user_id);
  const gender = req.body.gender;
  const { type = "AUDIO" } = req.body;

  console.log("\n📥 BE ← /random-connect", {
    user_id,
    gender,
    type,
  });

  /* ================= FIND OPPOSITE ================= */
  const peer_id = randomQueue.popOpposite(gender);

  /* ---------- NO PEER ---------- */
  if (!peer_id) {
    randomQueue.add(user_id, gender);

    console.log("🧾 BE QUEUE ADD", {
      user_id,
      gender,
      queue: randomQueue.snapshot(),
    });

    return res.json({ status: "SEARCHING" });
  }

  /* ================= MATCH FOUND ================= */
  const session_id = "CALL_" + uuidv4();

  console.log("✅ BE MATCH FOUND", {
    session_id,
    caller: gender === "Male" ? user_id : peer_id,
    receiver: gender === "Male" ? peer_id : user_id,
  });

  /* ================= CLEAN QUEUE ================= */
  randomQueue.remove(user_id);
  randomQueue.remove(peer_id);

  /* ================= DB ================= */
  await CallService.createSearching({
    session_id,
    caller_id: gender === "Male" ? user_id : peer_id,
    type,
    coin_rate_per_min: getRate(type),
  });

  await CallService.matchToReceiver(
    session_id,
    gender === "Male" ? peer_id : user_id
  );

  /* ================= SOCKET EMIT (CORRECT WAY) ================= */
  io.to(user_id).emit("call_matched", {
    session_id,
    role: gender === "Male" ? "caller" : "receiver",
    peer_id,
  });

  io.to(peer_id).emit("call_matched", {
    session_id,
    role: gender === "Male" ? "receiver" : "caller",
    peer_id: user_id,
  });

  console.log("📞 BE MATCH COMPLETE", {
    session_id,
    user_id,
    peer_id,
  });

  return res.json({
    status: "MATCHED",
    session_id,
  });
};

/* ======================================================
   🔹 CHECK CALL STATUS
====================================================== */
exports.status = async (req, res) => {
  try {
    const { session_id } = req.params;
    const user_id = req.user.user_id;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "session_id required",
      });
    }

    const session = await CallService.getSession(session_id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // 🔐 security check
    if (
      session.caller_id !== user_id &&
      session.receiver_id !== user_id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    return res.json({
      success: true,
      data: {
        session_id: session.session_id,
        status: session.status, // SEARCHING | RINGING | CONNECTED | ENDED
        type: session.type,
        caller_id: session.caller_id,
        receiver_id: session.receiver_id,
        started_at: session.started_at,
        ended_at: session.ended_at,
        coin_rate_per_min: session.coin_rate_per_min,
      },
    });
  } catch (err) {
    console.error("call status error", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ======================================================
   🔹 HANGUP (REST)
====================================================== */
exports.hangup = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: "session_id required" });
    }

    await CallService.endSession(session_id);
    await coinService.finalizeOnHangup(session_id);

    return res.json({ success: true });
  } catch (err) {
    console.error("hangup error", err);
    return res.status(500).json({ error: "Server error" });
  }
};
