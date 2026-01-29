const CategoryModel = require("../models/lifestylecategoryModel");

const addCategory = async (name) => {
  if (!name) throw new Error("Category name is required");
  return await CategoryModel.create(name);
};

const updateCategory = async (id, name) => {
  const affected = await CategoryModel.update(id, name);
  if (!affected) throw new Error("Category not found");
};

const deleteCategory = async (id) => {
  const affected = await CategoryModel.remove(id);
  if (!affected) throw new Error("Category not found");
};

const getAllCategories = async () => {
  return await CategoryModel.getAll();
};

module.exports = {
  addCategory,
  updateCategory,
  deleteCategory,
  getAllCategories
};
