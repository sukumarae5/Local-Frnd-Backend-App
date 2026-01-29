const historyModel = require("../models/callHistoryModel");

exports.fullHistory = async (userId) => {
  return await historyModel.getUserHistory(userId);
};

exports.recentUsers = async (userId) => {
  return await historyModel.getRecentUsers(userId);
};

exports.withUser = async (userId, otherUserId) => {
  return await historyModel.getHistoryWithUser(userId, otherUserId);
};
