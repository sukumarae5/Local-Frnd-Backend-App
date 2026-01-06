const userModel = require("../models/user");
const photoModel = require("../models/photoModel");
const avatarModel = require("../models/avatarModel");


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
  const cleaned = text.toLowerCase().replace(/[^a-z]/g, "");
  return bannedWords.some(word => cleaned.includes(word));
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
   
      user.mobile_number &&
      user.date_of_birth &&
      user.gender &&
      user.language_id &&
      user.location_lat &&
      user.location_log
  );
};

const parseDateOfBirth = (dobStr) => {
  if (!dobStr || typeof dobStr !== "string") return null;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dobStr)) {
    const d = new Date(dobStr);
    return isNaN(d.getTime()) ? null : d;
  }

  // DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(dobStr)) {
    const [day, month, year] = dobStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
};


const patchProfile = async (user_id, data) => {
  const user = await userModel.findById(user_id);
  if (!user) throw new Error("User not found")

  if (data.date_of_birth) {
    const dob = parseDateOfBirth(data.date_of_birth);
    if (!dob) {
      return {
        success: false,
        message: "Invalid date_of_birth format. Use YYYY-MM-DD or DD-MM-YYYY"
      };
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      return { success: false, message: "Age must be 18 or above" };
    }

    data.age = age;
    data.date_of_birth = dob.toISOString().split("T")[0];
  }

  // If age is provided directly → validate
  if (data.age !== undefined) {
    const age = Number(data.age);

    if (Number.isNaN(age)) {
      return { success: false, message: "Age must be a number" };
    }

    if (age < 18) {
      return { success: false, message: "Age must be 18 or above" };
    }
  }   

   if (data.gender !== undefined) {
    if (data.gender !== "Male" && data.gender !== "Female") {
      return {
        success: false,
        message: "Enter gender as 'Male' or 'Female'"
      };
    }
  }

  if (data.bio) {
    if (data.bio.length > 500) {
      return { success: false, message: "Bio too long (max 500 chars)" };
    }
    if (containsProfanity(data.bio)) {
      return { success: false, message: "Bio contains inappropriate words" };
    }
  }

  if (data.avatar_id !== undefined) {
    const avatar = await avatarModel.findById(data.avatar_id);
    if (!avatar) return { success: false, message: "Avatar not found" };
    if (avatar.gender !== user.gender) {
      return { success: false, message: "Avatar gender mismatch" };
    }
  }

  data.updates_at = new Date();

  const result = await userModel.updateProfile(user_id, data);

  if (result.affectedRows === 0) {
    return { success: false, message: "Nothing updated" };
  }
   const updatedUser = await userModel.findById(user_id);

  if (updatedUser.profile_status === "verified") {
    return { success: true, message: "Profile updated successfully" };
  }
const isComplete = await isProfileComplete(user_id);
  const hasAvatar = Boolean(updatedUser.avatar_id);

  console.log("isComplete:", isComplete, "hasAvatar:", hasAvatar);

  if (isComplete && !hasAvatar) {
    return {
      success: true,
      message: "Profile updated. Please select an avatar to complete verification.",
      next_step: "select_avatar",
      reward_pending: 50,
    };
  }
   
if (isComplete && hasAvatar) {
  const rewarded = await userModel.rewardProfileVerification(user_id);
console.log("Rewarded:", rewarded);
  if (rewarded) {
    return {
      success: true,
      message: "Profile verified successfully",
      reward: 50
    };
  }

  return {
    success: true,
    message: "Profile already verified"
  };
}


  return {
    success: true,
    message: "Profile updated successfully",
  };
};

const updateProfile = async (user_id, data) => {
  const user = await userModel.findById(user_id);
  if (!user) throw new Error("User not found");

  const required = ["date_of_birth", "gender","language_id", "location_lat", "location_log"];
  const missing = required.filter(
  field => data[field] === undefined || data[field] === null
);

  if (missing.length) {
    return {
      success: false,
      message: `Missing fields: ${missing.join(", ")}`
    };
  }

   if (data.date_of_birth) {
    const dob = parseDateOfBirth(data.date_of_birth);
    if (!dob) {
      return {
        success: false,
        message: "Invalid date_of_birth format. Use YYYY-MM-DD or DD-MM-YYYY"
      };
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      return { success: false, message: "Age must be 18 or above" };
    }

    data.age = age;
    data.date_of_birth = dob.toISOString().split("T")[0];
  }

  if (data.gender !== "Male" && data.gender !== "Female") {
    return {
      success: false,
      message: "Enter gender as 'Male' or 'Female'"
    };
  }

 if (data.avatar_id !== undefined) {
    const avatar = await avatarModel.findById(data.avatar_id);
    if (!avatar) return { success: false, message: "Avatar not found" };
    if (avatar.gender !== user.gender) {
      return { success: false, message: "Avatar gender mismatch" };
    }
  }

  if (data.bio) {
    if (data.bio.length > 500)
      return { success: false, message: "Bio cannot exceed 500 characters" };

    if (containsProfanity(data.bio))
      return { success: false, message: "Bio contains inappropriate words" };
  }

  // Update user
  data.updates_at = new Date();
  await userModel.updateProfile(user_id, data);

  const updatedUser = await userModel.findById(user_id);

  if (updatedUser.profile_status === "verified") {
    return { success: true, message: "Profile updated successfully" };
  }

  const isComplete = await isProfileComplete(user_id);
  const hasAvatar = Boolean(updatedUser.avatar_id);

  if (isComplete && !hasAvatar) {
    return {
      success: true,
      message: "Profile updated. Select an avatar to complete verification.",
      next_step: "select_avatar",
      reward_pending: 50,
    };
  }

 if (isComplete && hasAvatar) {
  const rewarded = await userModel.rewardProfileVerification(user_id);
 console.log("Rewarded:", rewarded);
  if (rewarded) {
    return {
      success: true,
      message: "Profile verified successfully",
      reward: 50
    };
  }

  return {
    success: true,
    message: "Profile already verified"
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

const connectRandomUserOppositeGender = async (currentUserId) => {
  const user = await userModel.getRandomOnlineOppositeGenderUser(currentUserId);  
  if (!user) {
    return { success: false, message: "No online users of opposite gender available" };
  }

  return {
    success: true,
    message: "User found",
    user,
  };
}

const connectNearbyForMale = async (userId) => {
  const [[me]] = await db.execute(
    `SELECT gender FROM user WHERE user_id=?`,
    [userId]
  );

  if (me.gender !== "Male") {
    return { success: false, message: "Only males allowed" };
  }

  const user = await userModel.getNearestOnlineFemale(userId);

  if (!user) {
    return { success: false, message: "No nearby females online" };
  }

  return { success: true, user };
};

const connectMaleToNearestFemale = async (userId) => {
  const user = await userModel.getNearestOnlineFemaleForMale(userId);

  if (!user) {
    return {
      success: false,
      message: "No nearby females online"
    };
  }

  return {
    success: true,
    user: {
      user_id: user.user_id,
      name: user.name,
      distance_km: Number(user.distance.toFixed(2))
    }
  };
};

module.exports = {
  getAllUsers,
  getProfileById,
  patchProfile,
  updateProfile,
  isProfileComplete,
  deleteUserId,
  getRandomUsers,
  connectRandomUser,
  connectToSpecificUser,
  connectRandomUserOppositeGender,
  connectMaleToNearestFemale,
  connectNearbyForMale
};
