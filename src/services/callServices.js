const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const callModel = require("../models/callModel");

/* ===============================
   FEMALE START SEARCH
=============================== */
const startFemaleSearch = async (female_id, type) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // await callModel.cancelFemaleSearch(female_id);
    // const active = await callModel.findActiveCallByUser(female_id);
    // if (active && active.status === "CONNECTED") {
    //   throw new Error("You are already in a call");
    // }
    await callModel.cancelFemaleSearchTx(conn, female_id);

    await callModel.forceEndConnectedByUserTx(conn, female_id);

    // // ✅ block only if really connected
    // const connected =
    //   await callModel.findConnectedCallByUserTx(conn, female_id);

    // if (connected) {
    //   throw new Error("You are already in a call");
    // }

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

module.exports = {
  startFemaleSearch,
  randomMatchMale,
  directMatchMale,
  cancelSearch,
  endSession,
  getConnectedCallDetails
};
