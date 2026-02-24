const UserInterestModel = require("../models/userinterestModel");

const saveUserInterests = async (userId, interestIds) => {
  if (!userId) throw new Error("User id is required");
  if (!Array.isArray(interestIds)) throw new Error("Interests must be an array");

  await UserInterestModel.deleteByUserId(userId);

  if (interestIds.length > 0) {
    await UserInterestModel.insertMany(userId, interestIds);
  }

  return true;
};

const getUserInterests = async (userId) => {
  if (!userId) throw new Error("User id is required");

  return await UserInterestModel.getByUserId(userId);
};



const updateUserInterests = async (userId, interestIds) => {
  if (!userId) throw new Error("User id is required");
  if (!Array.isArray(interestIds)) throw new Error("Interests must be an array");

  await UserInterestModel.deleteByUserId(userId);

  if (interestIds.length > 0) {
    await UserInterestModel.insertMany(userId, interestIds);
  }

  return true;
};


const deleteUserInterests = async (userId) => {
  if (!userId) throw new Error("User id is required");

  return await UserInterestModel.deleteByUserId(userId);
};



module.exports = {
  saveUserInterests,
  getUserInterests,
  updateUserInterests,
  deleteUserInterests
};
