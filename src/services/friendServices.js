const Friend = require("../models/friendModel");

/* SEND REQUEST */
const sendRequest = async (from, to) => {
  const existing = await Friend.find(from, to);
  if (existing) return false;

  await Friend.create(from, to);
  return true;
};

/* ACCEPT REQUEST */
const accept = async (requestId, userId) => {
  return await Friend.accept(requestId, userId);
};

/* LIST FRIENDS */
const list = async (userId) => {
  return await Friend.list(userId);
};

/* PENDING REQUESTS */
const pending = async (userId) => {
  return await Friend.pending(userId);
};

/* FRIEND STATUS */
const status = async (me, other) => {
  return await Friend.status(me, other);
};

/* UNFRIEND */
const remove = async (me, other) => {
  return await Friend.remove(me, other);
};

/* LIST FRIENDS WITH STATUS FILTER */
const listByStatus = async (userId, status) => {
  return await Friend.listByStatus(userId, status);
};

/* ADMIN LIST */
const adminList = async (status) => {
  return await Friend.adminList(status);
};


module.exports = {
  sendRequest,
  accept,
  list,
  pending,
  status,
  remove,
  listByStatus,
  adminList,
};
