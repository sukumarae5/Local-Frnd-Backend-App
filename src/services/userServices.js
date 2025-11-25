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


const updateProfile = async (user_id, userData) => {
  const user = await userModel.findById(user_id);
  if (!user) throw new Error("User not found");

  const requiredFields = [
    "name",
    "age",
    "gender",
    "location_lat",
    "location_log",
  ];
  const missingFields = requiredFields.filter(
    (field) => !userData[field] || userData[field].toString().trim() === ""
  );
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  const allowedGenders = ["Male", "Female"];
  if (!allowedGenders.includes(userData.gender)) {
    throw new Error(
      `Invalid gender value. Allowed: ${allowedGenders.join(", ")}`
    );
  }

  if (userData.bio) {
    if (userData.bio.length > 500) {
      throw new Error("Bio cannot exceed 500 characters");
    }

    if (containsProfanity(userData.bio)) {
      throw new Error("Bio contains inappropriate language");
    }
  }

  if (isNaN(userData.age)) {
    throw new Error("Age must be a number");
  }

  if (parseInt(userData.age) < 18) {
    throw new Error("Age must be greater than or equal to 18");
  }

  userData.updates_at = new Date();
  await userModel.updateProfile(user_id, userData);

  const completed = await isProfileComplete(user_id);

  const userPhoto = await photoModel.findPrimaryByUserId(user_id);
  console.log("isProfileComplete:", completed);
console.log("userPhoto:", userPhoto);
console.log("user.profile_status:", user.profile_status);

  if (completed && !userPhoto) {
    return {
      success: true,
      message:
        "Profile details updated. Please upload a profile photo to complete your profile and earn 50 LC.",
      next_step: "upload_photo",
      reward_pending: 50,
    };
  }

  if (completed && userPhoto && user.profile_status !== "verified") {
    await userModel.updateCoinBalance(user_id, 50);
    await userModel.updateProfile(user_id, {
      profile_status: "verified",
      status: "active",
    });
    return {
      success: true,
      message: "Profile completed & verified — 50 LC rewarded!",
      reward: 50,
      status: "active",
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

module.exports = {
  getAllUsers,
  getProfileById,
  updateProfile,
  isProfileComplete,
  deleteUserId,
};
