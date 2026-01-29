const Service = require('../services/lifestyleServices');

const add = async (req, res) => {
  try {
    const { category_id, name } = req.body;
    const id = await Service.addLifestyle(category_id, name);

    res.json({ success: true, message: "Lifestyle added", data: { id, name } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    await Service.updateLifestyle(req.params.id, req.body.name);
    res.json({ success: true, message: "Lifestyle updated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await Service.deleteLifestyle(req.params.id);
    res.json({ success: true, message: "Lifestyle deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getAll = async (req, res) => {
  const data = await Service.getAllLifestyles();
  res.json({ success: true, data });
};

module.exports = { add, update, remove, getAll };
