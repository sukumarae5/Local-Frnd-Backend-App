const Friend = require("../models/friendModel");

const sendRequest = async (from, to) => {
  const existing = await Friend.find(from, to);
  if (existing) return false;

  await Friend.create(from, to);
  return true;
};

const accept = async (requestId, userId) => {
  return await Friend.accept(requestId, userId);
};

const list = async (userId) => {
  return await Friend.list(userId);
};

const pending = async (userId) => {
  return await Friend.pending(userId);
};

const status = async (me, other) => {
  return await Friend.status(me, other);
};

const remove = async (me, other) => {
  return await Friend.remove(me, other);
};

const listByStatus = async (userId, status) => {
  return await Friend.listByStatus(userId, status);
};

const adminList = async (status) => {
  return await Friend.adminList(status);
};
const getPendingRequest = async (senderId, receiverId) => {
  return await Friend.getPendingRequest(senderId, receiverId);
};

const reject = async (senderId, receiverId) => {
  return await Friend.reject(senderId, receiverId);
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
  getPendingRequest,
  reject,
};
