const profileService = require("../services/profileService");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id; // from JWT middleware

    const profileData = await profileService.getUserProfile(userId);

    if (!profileData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      ...profileData
    });

  } catch (err) {
    console.log("Profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
