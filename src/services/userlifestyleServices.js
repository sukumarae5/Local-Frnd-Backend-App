const Model = require('../models/userlifestyleModel');

const saveUserLifestyles = async (user_id, lifestyleIds) => {
  await Model.deleteByUser(user_id);

  if (lifestyleIds.length > 0) {
    await Model.insertMany(user_id, lifestyleIds);
  }
};

const getUserLifestyles = async (user_id) => {
  return await Model.getByUser(user_id);
};

module.exports = { saveUserLifestyles, getUserLifestyles };
