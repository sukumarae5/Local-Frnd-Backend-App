const Model = require('../models/userlifestyleModel');

const saveUserLifestyles = async (user_id, lifestyleIds) => {

  if (!user_id) throw new Error("User id is required");
  if (!Array.isArray(lifestyleIds))
    throw new Error("lifestyles must be an array");

  await Model.deleteByUser(user_id);

  if (lifestyleIds.length > 0) {
    await Model.insertMany(user_id, lifestyleIds);
  }
};


const updateUserLifestyles = async (user_id, lifestyleIds) => {

  if (!user_id) throw new Error("User id is required");
  if (!Array.isArray(lifestyleIds))
    throw new Error("lifestyles must be an array");

  await Model.deleteByUser(user_id);

  if (lifestyleIds.length > 0) {
    await Model.insertMany(user_id, lifestyleIds);
  }
};


const deleteUserLifestyles = async (user_id) => {
  if (!user_id) throw new Error("User id is required");

  return await Model.deleteByUser(user_id);
};


const getUserLifestyles = async (user_id) => {
  if (!user_id) throw new Error("User id is required");

  return await Model.getByUser(user_id);
};


const getOneLifestyle = async (user_id, lifestyle_id) => {
  if (!user_id || !lifestyle_id)
    throw new Error("User id and lifestyle id required");

  return await Model.getOne(user_id, lifestyle_id);
};


const getAllUserLifestyles = async () => {
  return await Model.getAll();
};


module.exports = {
  saveUserLifestyles,
  updateUserLifestyles,
  deleteUserLifestyles,
  getUserLifestyles,
  getOneLifestyle,
  getAllUserLifestyles
};
