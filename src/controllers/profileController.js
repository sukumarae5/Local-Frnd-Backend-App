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


exports.getPublicProfile = async (req, res) => {
  try {
    const targetUserId = req.params.userId;

    const profile = await profileService.getPublicUserProfile(
      null, // viewerId not available
      targetUserId
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      profile
    });
  } catch (err) {
    console.error("Public profile error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
