const avatarService = require("../services/avatarServices");

exports.createAvatar = async (req, res) => {
  console.log("Creating avatar with data:", req.body);
  try {
    const avatarId = await avatarService.addAvatar({
      gender: req.body.gender,
      image_url: req.body.image_url,
      sort_order: req.body.sort_order,
    });

    res.json({ success: true, avatar_id: avatarId });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAvatars = async (req, res) => {
  try {
    const avatars = await avatarService.getAvatarsForGender(req.query.gender);
    res.json({ success: true, avatars });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAvatarById = async (req, res) => {
  try {
    const avatar = await avatarService.getAvatarById(req.params.id);
    res.json({ success: true, avatar });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};


exports.updateAvatar = async (req, res) => {
  console.log("Updating avatar with data:", req.body,req.params.id);
  try {
const updateData = {
      sort_order: req.body?.sort_order,
      image_url: req.body?.image_url,
    };

    await avatarService.updateAvatar(req.params.id, updateData);
    res.json({ success: true, message: "Avatar updated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


exports.deleteAvatar = async (req, res) => {
  try {
    await avatarService.deleteAvatar(req.params.id);
    res.json({ success: true, message: "Avatar removed" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
