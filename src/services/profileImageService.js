const profileImageModel = require("../models/profileImageModel");
const userModel = require("../models/user");

const uploadProfileImage = async (user_id, profile_image_url) => {

  // Check user exists
  const user = await userModel.findById(user_id);

  if (!user) {
    throw new Error("User not found");
  }

  if (!profile_image_url) {
    throw new Error("Profile image is required");
  }

  await profileImageModel.updateProfileImage(
    user_id,
    profile_image_url
  );

  return {
    success: true,
    message: "Profile image updated successfully",
    profile_image_url,
  };
};

const deleteProfileImage = async (user_id) => {

  const user = await userModel.findById(user_id);

  if (!user) {
    throw new Error("User not found");
  }

  await profileImageModel.removeProfileImage(user_id);

  return {
    success: true,
    message: "Profile image removed successfully",
  };
};

module.exports = {
  uploadProfileImage,
  deleteProfileImage,
};