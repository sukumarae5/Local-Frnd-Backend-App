const service = require("../services/notificationService");

exports.list = async (req, res) => {
  const data = await service.list(req.user.user_id);
  res.json(data);
};

exports.read = async (req, res) => {
  await service.read(req.body.id, req.user.user_id);
  res.json({ success: true });
};
