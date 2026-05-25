const profileService = require("../services/profileService");

// 👤 My profile (from token)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const profileData = await profileService.getUserProfile(userId);

    if (!profileData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      ...profileData
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 👥 Any user (by id)
exports.getProfileById = async (req, res) => {
  try {
    const userId = req.params.userId;

    const profileData = await profileService.getUserProfile(userId);

    if (!profileData) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      ...profileData
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


