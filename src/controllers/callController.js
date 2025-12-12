const { v4: uuidv4 } = require('uuid');
const CallService = require('../services/callServices');
const coinService = require('../services/coinService');
const { getIO } = require('../socket');   

const getRateForType = (type) => {
  if (type === 'AUDIO') return coinService.RATES.AUDIO;
  if (type === 'VIDEO') return coinService.RATES.VIDEO;
  return 1;
};

exports.initiate = async (req, res) => {
  try {
    const io = getIO();                    

    const caller_id = req.user.user_id;
    const { type, target_user_id, mode } = req.body;
    // mode: 'random' or 'direct' (if you want both). We'll support direct if target_user_id present.
    if (!type || !['AUDIO', 'VIDEO'].includes(type)) return res.status(400).json({ error: 'type required: AUDIO|VIDEO' });

    const session_id = 'CALL_' + uuidv4();
    const rate = getRateForType(type);

    // create searching session
    await CallService.createSearching({ session_id, caller_id, type, coin_rate_per_min: rate });

    if (target_user_id) {
      // direct: immediately set matched
      await CallService.matchToReceiver(session_id, target_user_id);
      // notify via socket if online
      io.to(String(target_user_id)).emit('incoming_call', { session_id, from: caller_id, type });
      return res.json({ session_id, status: 'RINGING' });
    } else {
      // For brevity: return SEARCHING. You must integrate a matching mechanism (redis/queue) for random matching.
      return res.json({ session_id, status: 'SEARCHING' });
    }
  } catch (err) {
    console.error('initiate error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

exports.status = async (req, res) => {
  try {
    const { session_id } = req.params;
    const session = await CallService.getSession(session_id);
    if (!session) return res.status(404).json({ error: 'not_found' });
    return res.json({
      session_id: session.session_id,
      status: session.status,
      type: session.type,
      started_at: session.started_at,
      ended_at: session.ended_at,
      caller_remaining_coins: session.caller_remaining_coins,
      receiver_remaining_coins: session.receiver_remaining_coins,
      coin_rate_per_min: session.coin_rate_per_min,
      caller_id: session.caller_id,
      receiver_id: session.receiver_id
    });
  } catch (err) {
    console.error('status error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};

exports.hangup = async (req, res) => {
  try {
    const io = getIO();                     // <-- FIXED

    const user_id = req.user.user_id;
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id required' });

    const session = await CallService.getSession(session_id);
    if (!session) return res.status(404).json({ error: 'session_not_found' });

    // ensure user is part of call
    if (session.caller_id !== user_id && session.receiver_id !== user_id) {
      return res.status(403).json({ error: 'not_allowed' });
    }

    // mark ended with ended_at
    await CallService.endSession(session_id);

    // make sure we run finalize to deduct remaining coins correctly
    const result = await coinService.finalizeOnHangup(session_id);

    // notify peers
    if (session.caller_id) io.to(String(session.caller_id)).emit('call_ended', { session_id, reason: 'USER_HANGUP' });
    if (session.receiver_id) io.to(String(session.receiver_id)).emit('call_ended', { session_id, reason: 'USER_HANGUP' });

    return res.json({ ok: true, reconciliation: result });
  } catch (err) {
    console.error('hangup error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};


exports.randomConnect = async (req, res) => {
  try {
    const io = getIO();
    const user_id = req.user.user_id;
    const { type = "AUDIO" } = req.body;

    if (!['AUDIO', 'VIDEO'].includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const rate = type === 'AUDIO' ? coinService.RATES.AUDIO : coinService.RATES.VIDEO;

    // STEP 1: Remove if user already waiting
    randomQueue.remove(user_id);

    // STEP 2: Try to get someone waiting
    const waitingUser = randomQueue.pop();

    if (!waitingUser) {
      // nobody waiting → this user becomes WAITING
      randomQueue.add(user_id);
      return res.json({ status: "WAITING" });
    }

    // STEP 3: MATCH made!
    const caller_id = waitingUser;
    const receiver_id = user_id;

    const session_id = "CALL_" + uuidv4();

    // create searching session for caller
    await CallService.createSearching({
      session_id,
      caller_id,
      type,
      coin_rate_per_min: rate
    });

    // set receiver
    await CallService.matchToReceiver(session_id, receiver_id);

    // notify both users via socket
    io.to(String(caller_id)).emit("match_found", {
      session_id,
      peer_id: receiver_id,
      type,
      mode: "RANDOM"
    });

    io.to(String(receiver_id)).emit("incoming_call", {
      session_id,
      from: caller_id,
      type,
      mode: "RANDOM"
    });

    // API response for this user (receiver)
    return res.json({
      status: "MATCHED",
      session_id,
      peer_id: caller_id,
      type
    });

  } catch (err) {
    console.error("randomConnect error", err);
    return res.status(500).json({ error: "server_error" });
  }
};

