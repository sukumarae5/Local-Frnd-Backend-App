const db = require("../config/db");

/* ================= NORMALIZE USER IDS ================= */
const normalize = (a, b) => ({
  u1: Math.min(a, b),
  u2: Math.max(a, b),
});

const find = async (a, b) => {
  const { u1, u2 } = normalize(a, b);

  const [rows] = await db.execute(
    `SELECT * FROM friends WHERE user_id_1=? AND user_id_2=?`,
    [u1, u2]
  );

  return rows[0];
};


const create = async (from, to) => {
  const { u1, u2 } = normalize(from, to);

  await db.execute(
    `INSERT INTO friends 
     (user_id_1, user_id_2, status, requested_by)
     VALUES (?, ?, 'PENDING', ?)`,
    [u1, u2, from]
  );
};


const accept = async (id, userId) => {

  const conn = await db.getConnection();

  try {

    await conn.beginTransaction();

    const [rows] = await conn.execute(
      `
      SELECT user_id_1, user_id_2, requested_by
      FROM friends
      WHERE id=? AND status='PENDING'
        AND requested_by != ?
      FOR UPDATE
      `,
      [id, userId]
    );

    if (!rows.length) {
      await conn.rollback();
      return null;
    }

    const { user_id_1, user_id_2, requested_by } = rows[0];

    await conn.execute(
      `
      UPDATE friends
      SET status='ACCEPTED', updated_at=NOW()
      WHERE id=?
      `,
      [id]
    );

    // normalize
    const u1 = Math.min(user_id_1, user_id_2);
    const u2 = Math.max(user_id_1, user_id_2);

    // create conversation immediately
    await conn.execute(
      `
      INSERT IGNORE INTO conversations (user1_id, user2_id)
      VALUES (?, ?)
      `,
      [u1, u2]
    );

    await conn.commit();

    return requested_by;

  } catch (e) {

    await conn.rollback();
    throw e;

  } finally {
    conn.release();
  }
};

/* ================= FRIEND LIST ================= */
const list = async (userId) => {
  const [rows] = await db.execute(
    `SELECT u.user_id, u.name, u.avatar_id, u.is_online, f.status
     FROM friends f
     JOIN user u
       ON u.user_id = IF(f.user_id_1=?, f.user_id_2, f.user_id_1)
     WHERE f.status='ACCEPTED'
       AND (f.user_id_1=? OR f.user_id_2=?)`,
    [userId, userId, userId]
  );

  return rows;
};

const pending = async (userId) => {
  const [rows] = await db.execute(
    `
    SELECT 
      f.id AS request_id,
      u.user_id AS sender_id,
      u.name AS sender_name,
      u.avatar_id,
       f.requested_at
    FROM friends f
    JOIN user u ON u.user_id = f.requested_by
    WHERE f.status='PENDING'
      AND (f.user_id_1=? OR f.user_id_2=?)
      AND f.requested_by != ?
    `,
    [userId, userId, userId]
  );

  return rows;
};



const status = async (me, other) => {
  const { u1, u2 } = normalize(me, other);

  const [rows] = await db.execute(
    `SELECT * FROM friends WHERE user_id_1=? AND user_id_2=?`,
    [u1, u2]
  );

  if (!rows.length) return { state: "NONE" };

  const row = rows[0];

  // ✅ FRIEND
  if (row.status === "ACCEPTED") {
    return { state: "FRIEND" };
  }

  // ✅ ONLY treat PENDING as pending
  if (row.status === "PENDING") {
    return row.requested_by === me
      ? { state: "PENDING_SENT" }
      : { state: "PENDING_RECEIVED", request_id: row.id };
  }

  // ✅ Everything else = NONE
  return { state: "NONE" };
};


/* ================= UNFRIEND ================= */
const remove = async (me, other) => {
  const { u1, u2 } = normalize(me, other);

  await db.execute(
    `
    DELETE FROM friends
    WHERE user_id_1=? AND user_id_2=?
      AND status='ACCEPTED'
    `,
    [u1, u2]
  );
};

/* ================= LIST BY STATUS ================= */
const listByStatus = async (userId, status = "ACCEPTED") => {
  let statusCondition = "";
  const params = [userId, userId];

  if (status !== "ALL") {
    statusCondition = "AND f.status = ?";
    params.push(status);
  }

  const [rows] = await db.execute(
    `
    SELECT
      f.id AS friend_id,
      f.status,
      f.requested_by,
      u.user_id,
      u.name,
      u.avatar_id,
      u.is_online
    FROM friends f
    JOIN user u
      ON u.user_id = IF(f.user_id_1=?, f.user_id_2, f.user_id_1)
    WHERE (f.user_id_1=? OR f.user_id_2=?)
    ${statusCondition}
    `,
    params
  );

  return rows;
};


/* ================= ADMIN LIST ================= */
const adminList = async (status = "ALL") => {
  let condition = "";
  const params = [];

  if (status !== "ALL") {
    condition = "WHERE f.status = ?";
    params.push(status);
  }

  const [rows] = await db.execute(
    `
    SELECT
      f.id,
      f.user_id_1,
      f.user_id_2,
      f.status,
      f.requested_by,
      f.created_at
    FROM friends f
    ${condition}
    ORDER BY f.created_at DESC
    `,
    params
  );

  return rows;
};

const isFriend = async (userId, friendId) => {

  const [rows] = await db.execute(
    `
    SELECT id
    FROM friends
    WHERE
      (
        (user_id_1 = ? AND user_id_2 = ?)
        OR
        (user_id_1 = ? AND user_id_2 = ?)
      )
      AND status = 'ACCEPTED'
    LIMIT 1
    `,
    [userId, friendId, friendId, userId]
  );

  return rows.length > 0;
};


const getPendingRequest = async (senderId, receiverId) => {
  const [rows] = await db.execute(
    `
    SELECT id
    FROM friends
    WHERE status='PENDING'
      AND requested_by=?
      AND (user_id_1=? OR user_id_2=?)
    `,
    [senderId, receiverId, receiverId]
  );

  return rows[0];
};

const reject = async (senderId, receiverId) => {
  const { u1, u2 } = normalize(senderId, receiverId);

  await db.execute(
    `
    DELETE FROM friends
    WHERE user_id_1=? AND user_id_2=?
      AND status='PENDING'
    `,
    [u1, u2]
  );
};
/* ================= EXPORTS ================= */
module.exports = {
  find,
  create,
  accept,
  list,
  pending,
  status,
  remove,
  listByStatus,
  adminList,
  isFriend,
  getPendingRequest,
  reject,
};
