const Service = require('../services/userlifestyleServices');

const save = async (req, res) => {
  try {
    const { user_id, lifestyles } = req.body;
    console.log(req.body)

    await Service.saveUserLifestyles(user_id, lifestyles);

    res.json({ success: true, message: "User lifestyles saved" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getByUser = async (req, res) => {
  const data = await Service.getUserLifestyles(req.params.user_id);
  res.json({ success: true, data });
};

module.exports = { save, getByUser };
