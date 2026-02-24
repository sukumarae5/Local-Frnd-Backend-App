const Model = require('../models/lifestyleModel');

const addLifestyle = async (category_id, name) => {
  if (!category_id || !name) throw new Error("category_id and name required");
  return await Model.create(category_id, name);
};

const updateLifestyle = async (id, name) => {
  const affected = await Model.update(id, name);
  if (!affected) throw new Error("Lifestyle not found");
};

const deleteLifestyle = async (id) => {
  const affected = await Model.remove(id);
  if (!affected) throw new Error("Lifestyle not found");
};

const getAllLifestyles = async () => {
  return await Model.getAll();
};

module.exports = {
  addLifestyle,
  updateLifestyle,
  deleteLifestyle,
  getAllLifestyles
};
