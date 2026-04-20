const coinPackageModel = require("../models/coinPackageModel");

const getAllCoinPackages = async () => {
  return await coinPackageModel.getAllCoinPackages();
};

const getCoinPackageById = async (id) => {
  return await coinPackageModel.getCoinPackageById(id);
};

const addCoinPackage = async (data) => {
  return await coinPackageModel.addCoinPackage(data);
};

const updateCoinPackage = async (id, data) => {
  return await coinPackageModel.updateCoinPackage(id, data);
};

const deleteCoinPackage = async (id) => {
  return await coinPackageModel.deleteCoinPackage(id);
};

// const deleteCoinPackage = async (id) => {
//   return await coinPackageModel.deleteCoinPackage(id);
// };

module.exports = {
  getAllCoinPackages,
  getCoinPackageById,
  addCoinPackage,
  updateCoinPackage,
  deleteCoinPackage
};