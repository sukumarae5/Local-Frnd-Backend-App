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

exports.fetchAllCallHistory = async () => {
  const calls = await historyModel.getAllCallHistory();

  return {
    success: true,
    total: calls.length,
    data: calls
  };
};

exports.fetchUserCallHistory = async (userId) => {

  const calls = await historyModel.getUserCallHistory(userId);

  return {
    success: true,
    totalCalls: calls.length,
    data: calls
  };

};
