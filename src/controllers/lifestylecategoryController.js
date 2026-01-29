const Service = require('../services/lifestylecategoryServices');

const add = async (req, res) => {
  try {
    const { name } = req.body;
    const id = await Service.addCategory(name);

    res.json({ success: true, message: "Category added", data: { id, name } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    await Service.updateCategory(req.params.id, req.body.name);
    res.json({ success: true, message: "Category updated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await Service.deleteCategory(req.params.id);
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getAll = async (req, res) => {
  const data = await Service.getAllCategories();
  res.json({ success: true, data });
};

module.exports = { add, update, remove, getAll };
