const db = require("../config/db");

const createFemaleSearchSession = async (conn, session_id, female_id, type) => {
  try {
    console.log("Creating female search session:", {
      session_id,
      female_id,
      type
    });

    const sql = `
      INSERT INTO call_sessions
      (
        session_id,
        caller_id,
        receiver_id,
        status,
        type,
        coin_rate_per_min,
        finalized,
        created_at,
        updated_at
      )
      VALUES (?, ?, NULL, 'SEARCHING', ?, 0, 0, NOW(), NOW())
    `;

    const [result] = await conn.execute(sql, [
      session_id,
      female_id,
      type
    ]);

    console.log("✅ Insert result:", result.affectedRows);

    return result;

  } catch (err) {
    console.error("❌ MYSQL INSERT ERROR:", err);
    throw err;
  }
};


const findSearchingFemaleLocked = async (conn, type) => {
  const [rows] = await conn.execute(
    `
    SELECT cs.*
    FROM call_sessions cs
    JOIN user u ON u.user_id = cs.caller_id
    WHERE cs.status = 'SEARCHING'
      AND cs.type = ?
      AND u.gender = 'Female'
    ORDER BY cs.created_at DESC
    LIMIT 1
    FOR UPDATE
    `,
    [type]
  );

  return rows[0] || null;
};



const findSpecificFemaleLocked = async (conn, female_id, type) => {
  const [rows] = await conn.execute(
    `
    SELECT cs.*
    FROM call_sessions cs
    WHERE cs.caller_id = ?
      AND cs.status = 'SEARCHING'
      AND cs.type = ?
    LIMIT 1
    FOR UPDATE
    `,
    [female_id, type]
  );

  return rows[0] || null;
};


const matchSession = async (conn, session_id, male_id) => {
  const [result] = await conn.execute(
    `
    UPDATE call_sessions
    SET receiver_id = ?,
        status = 'CONNECTED',
        started_at = NOW(),
        updated_at = NOW()
    WHERE session_id = ?
      AND status = 'SEARCHING'
    `,
    [male_id, session_id]
  );

  console.log("✅ matchSession:", {
    session_id,
    male_id,
    affectedRows: result.affectedRows
  });

  return result;
};

const findActiveCallByUser = async (user_id) => {
  
  console.log("Checking active call for user:", user_id); 

  const [rows] = await db.execute(
    `
    SELECT *
    FROM call_sessions
    WHERE status IN ('SEARCHING','CONNECTED')
      AND (caller_id = ? OR receiver_id = ?)
    LIMIT 1
    `,
    [user_id, user_id]
  );
console.log("findActiveCallByUser - rows:", rows);
  return rows[0] || null;
};


const findConnectedCallByUserTx = async (conn, user_id) => {
  const [rows] = await conn.execute(
    `
    SELECT *
    FROM call_sessions
    WHERE status = 'CONNECTED'
      AND (caller_id = ? OR receiver_id = ?)
    LIMIT 1
    `,
    [user_id, user_id]
  );

  return rows[0] || null;
};


const endSession = async (session_id) => {
  const [result] = await db.execute(
    `
    UPDATE call_sessions
    SET status = 'ENDED',
        ended_at = NOW(),
        duration_seconds = TIMESTAMPDIFF(SECOND, started_at, NOW()),
        updated_at = NOW()
    WHERE session_id = ?
      AND status = 'CONNECTED'
    `,
    [session_id]
  );

  console.log("✅ endSession:", {
    session_id,
    affectedRows: result.affectedRows,
    changedRows: result.changedRows
  });

  return result;
};


const getSearchingFemales = async () => {
  const [rows] = await db.execute(
    `
    SELECT
      cs.session_id,
      cs.type,
      u.user_id
    FROM call_sessions cs
    JOIN user u ON u.user_id = cs.caller_id
    WHERE cs.status = 'SEARCHING'
      AND u.gender = 'Female'
       AND u.is_online = 1
    ORDER BY cs.created_at DESC
    `
  );
console.log("getSearchingFemales - rows:", rows); 
  return rows;
};



const cancelFemaleSearch = async (female_id) => {
  await db.execute(
    `
    UPDATE call_sessions
    SET status = 'ENDED',
        updated_at = NOW()
    WHERE caller_id = ?
      AND status = 'SEARCHING'
    `,
    [female_id]
  );
};

const cancelFemaleSearchTx = async (conn, female_id) => {
  await conn.execute(
    `
    UPDATE call_sessions
    SET status = 'ENDED',
        updated_at = NOW()
    WHERE caller_id = ?
      AND status = 'SEARCHING'
    `,
    [female_id]
  );
};


const getConnectedCallBothUsers = async (user_id) => {

  const [rows] = await db.execute(
    `
    SELECT
      cs.session_id,
      cs.type,

      -- caller
      cu.user_id     AS caller_id,
      cu.name        AS caller_name,
      cu.gender      AS caller_gender,
      cu.bio         AS caller_bio,
      ca.image_url   AS caller_avatar,

      -- receiver (connected user)
      ru.user_id     AS receiver_id,
      ru.name        AS receiver_name,
      ru.gender      AS receiver_gender,
      ru.bio         AS receiver_bio,
      ra.image_url   AS receiver_avatar

    FROM call_sessions cs

    JOIN user cu
      ON cu.user_id = cs.caller_id

    LEFT JOIN avatars ca
      ON ca.avatar_id = cu.avatar_id

    JOIN user ru
      ON ru.user_id = cs.receiver_id

    LEFT JOIN avatars ra
      ON ra.avatar_id = ru.avatar_id

    WHERE cs.status = 'CONNECTED'
      AND (cs.caller_id = ? OR cs.receiver_id = ?)
    LIMIT 1
    `,
    [user_id, user_id]
  );
console.log("getConnectedCallBothUsers - rows:", rows); 
  return rows[0] || null;
};

const forceEndConnectedByUserTx = async (conn, user_id) => {
  await conn.execute(
    `
    UPDATE call_sessions
    SET status = 'ENDED',
        ended_at = IF(status = 'CONNECTED', NOW(), ended_at),
        updated_at = NOW()
    WHERE status IN ('CONNECTED','SEARCHING')
      AND (caller_id = ? OR receiver_id = ?)
    `,
    [user_id, user_id]
  );
};

const createFriendSession = async (
  conn,
  session_id,
  caller_id,
  receiver_id,
  type
) => {

  const [result] = await conn.execute(
    `
    INSERT INTO call_sessions
    (
      session_id,
      caller_id,
      receiver_id,
      status,
      type,
      coin_rate_per_min,
      finalized,
      created_at,
      updated_at
    )
    VALUES
    (?, ?, ?, 'RINGING', ?, 0, 0, NOW(), NOW())
    `,
    [session_id, caller_id, receiver_id, type]
  );

  return result;
};

const getSessionUsers = async (session_id) => {

  const [rows] = await db.execute(
    `
    SELECT session_id, caller_id, receiver_id
    FROM call_sessions
    WHERE session_id = ?
    LIMIT 1
    `,
    [session_id]
  );

  return rows[0] || null;
};

const connectSession = async (session_id) => {
  const [result] = await db.execute(
    `
    UPDATE call_sessions
    SET status = 'CONNECTED',
        started_at = NOW(),
        updated_at = NOW()
    WHERE session_id = ?
      AND status = 'RINGING'
    `
    ,
    [session_id]
  );

  return result;
};




module.exports = {
  createFemaleSearchSession,
  findSearchingFemaleLocked,
  findSpecificFemaleLocked,
  matchSession,
  findActiveCallByUser,
  endSession,
  getSearchingFemales,
  cancelFemaleSearch,
  findConnectedCallByUserTx,
  cancelFemaleSearchTx,
  getConnectedCallBothUsers,
  forceEndConnectedByUserTx,
  createFriendSession,
  getSessionUsers,
  connectSession
};
