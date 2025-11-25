const photoModel = require("../models/photoModel");

const getAllPhotos = async () => {
  return await photoModel.getAllPhotos();
};

const getPhotosByUserId = async (user_id) => {
  return await photoModel.getPhotosByUserId(user_id);
};

const addPhoto = async (user_id, photo_url) => {
  const count = await photoModel.getActivePhotoCount(user_id);
  if (count >= 5) {
    throw new Error("Maximum 5 photos allowed");
  }

  const is_primary = count === 0 ? 1 : 0;
  const photo_id = await photoModel.addPhoto(user_id, photo_url, is_primary);
  return { success: true, message: "photo added successfully", photo_id };
};

const updatePhotoUrl = async (user_id, photo_id, { photo_url, is_primary }) => {
  const photo = await photoModel.getPhotoById(photo_id, user_id);
  if (!photo) throw new Error("photo not found");

  if (photo_url) {
    await photoModel.updatePhotoUrl(photo_id, user_id, photo_url);
  }

  if (is_primary ===1) {
    await photoModel.clearPrimaryPhoto(user_id);
    await photoModel.setPrimaryPhoto(photo_id, user_id);
  }

  return { success: true, message: "photo updated successfully" };
};

const deletePhotoById = async (user_id, photo_id) => {
  // Check if photo exists
  const photo = await photoModel.getPhotoById(photo_id, user_id);
  if (!photo) throw new Error("Photo not found");

  // Prevent deleting last photo
  const count = await photoModel.getActivePhotoCount(user_id);
  if (count <= 1) throw new Error("Cannot delete last remaining photo");

  // Delete
  await photoModel.deletePhotoById(photo_id, user_id);

  // If the deleted photo was primary
  if (photo.is_primary === 1) {
    const latest = await photoModel.getLatestPhoto(user_id);
    if (latest) {
      await photoModel.setPrimaryPhoto(latest.photo_id, user_id);
    }
  }

  return { success: true, message: "Photo deleted successfully" };
}

module.exports = {
  getAllPhotos,
  getPhotosByUserId,
  addPhoto, 
 updatePhotoUrl,
 deletePhotoById
}
