// services/photoServices.js
const photoModel = require("../models/photoModel");
const userModel = require("../models/user");
const { isProfileComplete } = require("./userServices")

const getAllPhotos = async () => {
  return await photoModel.getAllPhotos();
};

const getPhotosByUserId = async (user_id) => {
  return await photoModel.getPhotosByUserId(user_id);
};


const addPhoto = async (user_id, photo_url) => {
  console.log("Adding photo for user_id:", user_id);

  const count = await photoModel.getActivePhotoCount(user_id);

  if (count >= 5) {
    throw new Error("Maximum 5 photos allowed");
  }

  const is_primary = count === 0 ? 1 : 0;

  // Insert photo
  const photo_id = await photoModel.addPhoto(user_id, photo_url, is_primary);

  const isFirstPhoto = count === 0;
  const profileCompleted = await isProfileComplete(user_id);

  console.log("isFirstPhoto:", isFirstPhoto);
  console.log("profileCompleted:", profileCompleted);

  // Reward only for FIRST photo + completed profile
  if (isFirstPhoto && profileCompleted) {
    console.log("Rewarding 50 coins to user:", user_id);

    await userModel.updateCoinBalance(user_id, 50);
    await userModel.updateProfile(user_id, {
      profile_status: "verified",
      status: "active",
    });

    return {
      success: true,
      message: "Photo uploaded & profile verified — 50 LC rewarded!",
      reward: 50,
      photo_id,
      status: "active",
    };
  }

  return {
    success: true,
    message: "Photo uploaded successfully",
    photo_id,
  };
};

const updatePhotoUrl = async (user_id, photo_id, { photo_url, is_primary, status }) => {
  const photo = await photoModel.getPhotoById(photo_id, user_id);
  if (!photo) throw new Error("photo not found");

  // Update photo URL if sent
  if (photo_url) {
    await photoModel.updatePhotoUrl(photo_id, user_id, photo_url);
  }

  // Update status if sent
  if (status) {
    if (!["active", "deleted"].includes(status)) {
      throw new Error("Invalid status value");
    }

    await photoModel.updateStatus(photo_id, user_id, status);

    // If you mark primary photo as deleted, move primary to latest active
    if (status === "deleted" && photo.is_primary === 1) {
      const latest = await photoModel.getLatestPhoto(user_id);
      if (latest) {
        await photoModel.setPrimaryPhoto(latest.photo_id, user_id);
      }
    }
  }

  // Update primary flag if sent
  if (is_primary !== null && typeof is_primary !== "undefined") {
    if (is_primary === 1) {
      // Make this photo primary
      await photoModel.clearPrimaryPhoto(user_id);
      await photoModel.setPrimaryPhoto(photo_id, user_id);
    } else if (is_primary === 0 && photo.is_primary === 1) {
      // If you explicitly set primary to 0 for the current primary photo,
      // choose another latest active as primary (optional logic).
      const latest = await photoModel.getLatestPhoto(user_id);
      if (latest && latest.photo_id !== Number(photo_id)) {
        await photoModel.setPrimaryPhoto(latest.photo_id, user_id);
      } else {
        // Or leave user with no primary if you want
        await photoModel.clearPrimaryPhoto(user_id);
      }
    }
  }

  return { success: true, message: "photo updated successfully" };
};

const deletePhotoById = async (user_id, photo_id) => {
  const photo = await photoModel.getPhotoById(photo_id, user_id);
  if (!photo) throw new Error("Photo not found");

  const count = await photoModel.getActivePhotoCount(user_id);
  console.log(count);
  
  if (count <= 1) throw new Error("Cannot delete last remaining photo");

  await photoModel.deletePhotoById(photo_id, user_id);

  if (photo.is_primary === 1) {
    const latest = await photoModel.getLatestPhoto(user_id);
    if (latest) {
      await photoModel.setPrimaryPhoto(latest.photo_id, user_id);
    }
  }

  return { success: true, message: "Photo deleted successfully" };
};

module.exports = {
  getAllPhotos,
  getPhotosByUserId,
  addPhoto,
  updatePhotoUrl,
  deletePhotoById,
};
