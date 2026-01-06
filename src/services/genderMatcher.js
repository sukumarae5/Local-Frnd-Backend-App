const socketMap = require('../socket/socketMap');
const db = require('../config/db');

async function isFriend(u1, u2) {
  const [rows] = await db.query(
    `SELECT 1 FROM friends
     WHERE ((user_id_1=? AND user_id_2=?) OR (user_id_1=? AND user_id_2=?))
     AND status='ACCEPTED'`,
    [u1, u2, u2, u1]
  );
  return rows.length > 0;
}

exports.findRandomMatch = async (caller) => {
  const candidates = [];

  for (let [uid] of socketMap.all()) {
    if (uid === String(caller.user_id)) continue;

    // gender rule
    if (
      (caller.gender === 'MALE' && caller.gender !== 'FEMALE') ||
      (caller.gender === 'FEMALE' && caller.gender !== 'MALE')
    ) continue;

    // block random if already friends
    const friend = await isFriend(caller.user_id, uid);
    if (friend) continue;

    candidates.push(uid);
  }

  if (!candidates.length) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
};
