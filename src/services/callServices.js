const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const callModel = require("../models/callModel");
const friendModel = require("../models/friendModel");


const startFemaleSearch = async (female_id, type) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    await callModel.cancelFemaleSearchTx(conn, female_id);

    await callModel.forceEndConnectedByUserTx(conn, female_id);



    const session_id = "SEARCH_" + uuidv4();

    await callModel.createFemaleSearchSession(
      conn,
      session_id,
      female_id,
      type
    );

    await conn.commit();
    return session_id;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const randomMatchMale = async (male_id, type) => {
  console.log("Attempting random match for male:", male_id, type);

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const active = await callModel.findActiveCallByUser(male_id);
    if (active) {
      throw new Error("User already in call");
    }

     const [[male]] = await conn.execute(
      `SELECT coin_balance FROM user WHERE user_id = ? FOR UPDATE`,
      [male_id]
    );

    const rate = type === "VIDEO" ? 2 : 1;

    if (!male || male.coin_balance < rate) {
      await conn.rollback();
      throw new Error("INSUFFICIENT_BALANCE");
    }

    const femaleSession =
      await callModel.findSearchingFemaleLocked(conn, type);

    if (!femaleSession) {
      await conn.rollback();
      return null;
    }

    await callModel.matchSession(
      conn,
      femaleSession.session_id,
      male_id
    );

    const [rows] = await conn.execute(
      `SELECT * FROM call_sessions WHERE session_id = ?`,
      [femaleSession.session_id]
    );

    await conn.commit();

    return rows[0];

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const directMatchMale = async (male_id, female_id, type) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const active = await callModel.findActiveCallByUser(male_id);
    if (active) {
      throw new Error("User already in call");
    }

    const [[male]] = await conn.execute(
      `SELECT coin_balance FROM user WHERE user_id = ? FOR UPDATE`,
      [male_id]
    );

    const rate = type === "VIDEO" ? 2 : 1;

    if (!male || male.coin_balance < rate) {
      await conn.rollback();
      throw new Error("INSUFFICIENT_BALANCE");
    }

    const femaleSession =
      await callModel.findSpecificFemaleLocked(conn, female_id, type);

    if (!femaleSession) {
      await conn.rollback();
      return null;
    }

    await callModel.matchSession(
      conn,
      femaleSession.session_id,
      male_id
    );

    const [rows] = await conn.execute(
      `SELECT * FROM call_sessions WHERE session_id = ?`,
      [femaleSession.session_id]
    );

    await conn.commit();

    return rows[0];

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const cancelSearch = async (female_id) => {
  await callModel.cancelFemaleSearch(female_id);
};

const endSession = async (session_id) => {
  return await callModel.endSession(session_id);
};

const getConnectedCallDetails = async (user_id) => {
  return await callModel.getConnectedCallBothUsers(user_id);
};

const friendConnect = async (user_id, friend_id, type) => {
 
 console.log("Friend connect request:", { user_id, friend_id, type });  
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    const isFriend =
      await friendModel.isFriend(user_id, friend_id);
 console.log("Friend check result:", isFriend);
    if (!isFriend) {
      throw new Error("NOT_FRIEND");
    }

    const myActive =
      await callModel.findActiveCallByUser(user_id);
console.log("My active call check result:", myActive);  
   
if (myActive) {
      throw new Error("USER_BUSY");
    }

    const friendActive =
      await callModel.findActiveCallByUser(friend_id);
console.log("Friend active call check result:", friendActive);  

    if (friendActive) {
      throw new Error("FRIEND_BUSY");
    }

    const [[male]] = await conn.execute(
      `SELECT coin_balance FROM user WHERE user_id = ? FOR UPDATE`,
      [user_id]
    );

    const rate = type === "VIDEO" ? 2 : 1;

    if (!male || male.coin_balance < rate) {
      await conn.rollback();
      throw new Error("INSUFFICIENT_BALANCE");
    }
    const session_id = "FRIEND_" + uuidv4();

    await callModel.createFriendSession(
      conn,
      session_id,
      user_id,
      friend_id,
      type
    );

    const [rows] = await conn.execute(
      `SELECT * FROM call_sessions WHERE session_id = ?`,
      [session_id]
    );

    await conn.commit();

    return rows[0];

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const getSessionUsers = async (session_id) => {
  return await callModel.getSessionUsers(session_id);
};

const connectSession = async (session_id) => {
  return await callModel.connectSession(session_id);
};

const getSessionById = async (session_id) => {
  const [rows] = await db.execute(
    `
    SELECT session_id, type, status
    FROM call_sessions
    WHERE session_id = ?
    LIMIT 1
    `,
    [session_id]
  );

  return rows[0] || null;
};


module.exports = {
  startFemaleSearch,
  randomMatchMale,
  directMatchMale,
  cancelSearch,
  endSession,
  getConnectedCallDetails,
  friendConnect,
  getSessionUsers,
  connectSession,
  getSessionById
};
