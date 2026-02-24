// controllers/userlifestyleController.js

const Service = require('../services/userlifestyleServices');


const save = async (req, res) => {
  console.log("Saving user lifestyles for user:", req.user, req.body);  
  try {
    const user_id = req.user.user_id;   // ✅ from JWT
    const { lifestyles } = req.body;

    await Service.saveUserLifestyles(user_id, lifestyles);

    res.json({ success: true, message: "User lifestyles saved" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


const update = async (req, res) => {
  try {
    const user_id = req.user.user_id;   // ✅ from JWT
    const { lifestyles } = req.body;

    await Service.updateUserLifestyles(user_id, lifestyles);

    res.json({ success: true, message: "User lifestyles updated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


const remove = async (req, res) => {
  try {
    const user_id = req.user.user_id;   // ✅ from JWT

    await Service.deleteUserLifestyles(user_id);

    res.json({ success: true, message: "User lifestyles deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


const getMy = async (req, res) => {
  const user_id = req.user.user_id;

  const data = await Service.getUserLifestyles(user_id);

  res.json({ success: true, data });
};


const getMyOne = async (req, res) => {
  const user_id = req.user.user_id;
  const { lifestyle_id } = req.params;

  const data = await Service.getOneLifestyle(user_id, lifestyle_id);

  res.json({ success: true, data });
};


const getByUser = async (req, res) => {
  const data = await Service.getUserLifestyles(req.params.user_id);
  res.json({ success: true, data });
};


const getAll = async (req, res) => {
  const data = await Service.getAllUserLifestyles();
  res.json({ success: true, data });
};


module.exports = {
  save,
  update,
  remove,
  getMy,
  getMyOne,
  getByUser,
  getAll
};
