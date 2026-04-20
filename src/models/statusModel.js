const db = require("../config/db");

exports.createStatus = async (data) => {

  const sql = `
  INSERT INTO user_status
  (user_id,type,text_content,media_url,expires_at)
  VALUES ?
  `;

  return db.query(sql, [data]);
};

exports.getMyStatus = async (userId) => {

  const sql = `
  SELECT *
  FROM user_status
  WHERE user_id=?
  AND expires_at > NOW()
  AND is_deleted=0
  ORDER BY created_at DESC
  `;

  return db.query(sql, [userId]);
};

exports.deleteStatus = async (statusId, userId) => {

  const sql = `
  UPDATE user_status
  SET is_deleted=1
  WHERE status_id=? AND user_id=?
  `;

  return db.query(sql, [statusId, userId]);
};

exports.getFriendsStatus = async (userId) => {

  const sql = `
  SELECT
  s.status_id,
  s.user_id,
  s.type,
  s.text_content,
  s.media_url,
  s.created_at,
  u.name,
  u.username,
  u.avatar_id
  FROM user_status s
  JOIN user u ON u.user_id=s.user_id
  JOIN friends f
  ON (
  (f.user_id_1=? AND f.user_id_2=s.user_id)
  OR
  (f.user_id_2=? AND f.user_id_1=s.user_id)
  )
  WHERE f.status='ACCEPTED'
  AND s.expires_at>NOW()
  AND s.is_deleted=0
  ORDER BY s.created_at DESC
  `;

  return db.query(sql, [userId, userId]);
};

exports.addView = async (statusId, viewerId) => {

  const sql = `
  INSERT IGNORE INTO status_views
  (status_id,viewer_id)
  VALUES (?,?) 
  `;

  return db.query(sql, [statusId, viewerId]);
};

exports.getViewers = async (statusId) => {

  const sql = `
  SELECT
  u.user_id,
  u.name,
  u.username,
  sv.viewed_at
  FROM status_views sv
  JOIN user u ON u.user_id=sv.viewer_id
  WHERE sv.status_id=?
  `;

  return db.query(sql, [statusId]);
};