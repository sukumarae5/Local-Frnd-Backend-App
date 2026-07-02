const profileImageService = require("../services/profileImageService");

exports.uploadProfileImage = async (req, res) => {
  try {

    const user_id = req.user.user_id;

    if (!req.body.profile_image_url) {
      return res.status(400).json({
        success: false,
        message: "Image upload failed",
      });
    }

    const result = await profileImageService.uploadProfileImage(
      user_id,
      req.body.profile_image_url
    );

    return res.json(result);

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success:false,
      message:err.message,
    });
  }
};

exports.deleteProfileImage = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const result = await profileImageService.deleteProfileImage(user_id);

    res.status(200).json(result);

  } catch (err) {
    console.error("Delete Profile Image:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};