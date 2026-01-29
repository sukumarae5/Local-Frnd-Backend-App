const UserInterestModel = require("../models/userinterestModel");

const saveUserInterests = async (userId, interestIds) => {
  if (!userId) throw new Error("User id is required");
  if (!Array.isArray(interestIds)) throw new Error("Interests must be an array");

  // remove previous interests
  await UserInterestModel.deleteByUserId(userId);

  // insert new selected interests
  if (interestIds.length > 0) {
    await UserInterestModel.insertMany(userId, interestIds);
  }

  return true;
};

const getUserInterests = async (userId) => {
  if (!userId) throw new Error("User id is required");

  return await UserInterestModel.getByUserId(userId);
};

module.exports = {
  saveUserInterests,
  getUserInterests
};
