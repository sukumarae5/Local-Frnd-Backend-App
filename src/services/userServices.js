const userModel = require("../models/user");
const photoModel = require("../models/photoModel");

const bannedWords = [
  "badword1",
  "badword2",
  "hate",
  "kill",
  "racist",
  "terror",
  "abuse",
];

const containsProfanity = (text) => {
  const lower = text.toLowerCase();
  return bannedWords.some((word) => lower.includes(word));
};

const getAllUsers = async () => {
  const users = await userModel.getAllUsers();
  return { success: true, users };
};

const getProfileById = async (id) => {
  const user = await userModel.findById(id);
  if (!user) return { success: false, message: "User not found" };
  return { success: true, user };
};

const isProfileComplete = async (user_id) => {
  const user = await userModel.findById(user_id);

  return Boolean(
    user.name &&
      user.mobile_number &&
      user.age &&
      user.gender &&
      user.location_lat &&
      user.location_log
  );
};

const updateProfile = async (user_id, data) => {
  const user = await userModel.findById(user_id);
  if (!user) throw new Error("User not found");

  // Validate required fields
  const required = ["name", "age", "gender", "location_lat", "location_log"];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length) {
    return {
      success: false,
      message: `Missing fields: ${missing.join(", ")}`
    };
  }

  // Gender validation
  if (!["Male", "Female"].includes(data.gender)) {
    return { success: false, message: "Invalid gender" };
  }

  // Bio validation
  if (data.bio) {
    if (data.bio.length > 500)
      return { success: false, message: "Bio cannot exceed 500 characters" };

    if (containsProfanity(data.bio))
      return { success: false, message: "Bio contains inappropriate words" };
  }

  // Update user
  data.updates_at = new Date();
  await userModel.updateProfile(user_id, data);

  // Check completeness
  const completed = await isProfileComplete(user_id);
  const primaryPhoto = await photoModel.findPrimaryByUserId(user_id);

  // Case: complete but no photo
  if (completed && !primaryPhoto) {
    return {
      success: true,
      message: "Profile updated. Add a photo to complete verification.",
      next_step: "upload_photo",
      reward_pending: 50
    };
  }

  // Case: complete + photo exists → reward
  if (completed && primaryPhoto && user.profile_status !== "verified") {
    await userModel.updateCoinBalance(user_id, 50);
    await userModel.updateProfile(user_id, {
      profile_status: "verified",
      status: "active"
    });

    return {
      success: true,
      message: "Profile verified — 50 LC rewarded!",
      reward: 50
    };
  }

  return { success: true, message: "Profile updated successfully" };
};

     
const deleteUserId = async (user_id) => {  
  const user = await userModel.findById(user_id);
  if (!user) throw new Error("user not found");  

  const result = await userModel.deleteUserId(user_id);
  if (result.affectedRows === 0) throw new Error("user not deleted");
  return { success: true, message: "user deleted successfully" };
};

const getRandomUsers = async (currentUserId) => {
  console.log(currentUserId);
  
  if (!currentUserId) {
    throw new Error("Current user ID is required");
  }

  const users = await userModel.getRandomUsers(currentUserId);

  return {
    success: true,
    total: users.length,
    users,
  };
};

const connectRandomUser = async (currentUserId) => {
  const user = await userModel.getRandomOnlineUser(currentUserId);

  if (!user) {
    return { success: false, message: "No online users available" };
  }

  return {
    success: true,
    message: "User found",
    user,
  };
};

const connectToSpecificUser = async (currentUserId, targetUserId) => {
  const isOnline = await userModel.isUserOnline(targetUserId);

  if (!isOnline) {
    return { success: false, message: "User is offline" };
  }

  return {
    success: true,
    message: "User is online, you can connect",
    targetUserId,
  };
};



module.exports = {
  getAllUsers,
  getProfileById,
  updateProfile,
  isProfileComplete,
  deleteUserId,
  getRandomUsers,
  connectRandomUser,
  connectToSpecificUser
};
