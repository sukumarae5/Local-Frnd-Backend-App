const avatarModel = require("../models/avatarModel");

const addAvatar = async ({  gender, image_url, sort_order }) => {
  console.log(gender, image_url, sort_order);
  if ( !gender || !image_url) {
    throw new Error(" gender and image required");
  }


 if (!["Male", "Female"].includes(gender)) {
    throw new Error("Invalid gender");
  }
    

  return await avatarModel.createAvatar({
    gender,
    image_url,
    sort_order,
  });
};

const getAvatarsForGender = async (gender) => {
  if (!gender) throw new Error("gender required");
  return await avatarModel.getAvatarsByGender(gender);
};

const getAvatarById = async (avatar_id) => {
  const avatar = await avatarModel.findById(avatar_id);
  if (!avatar) throw new Error("Avatar not found");
  return avatar;
};

const updateAvatar = async (avatar_id, data={}) => {
    console.log("Updating avatar with data:", data, avatar_id);

  const avatar = await avatarModel.findById(avatar_id);
  if (!avatar) throw new Error("Avatar not found");

 const updateData = {};

  if (data.sort_order !== undefined) {
    updateData.sort_order = Number(data.sort_order);
  }

  if (data.image_url) {
    updateData.image_url = data.image_url;
  }
  
  if (!Object.keys(updateData).length) {
    throw new Error("Nothing to update");
  }

  await avatarModel.updateById(avatar_id, updateData);
};

const deleteAvatar = async (avatar_id) => {
  const avatar = await avatarModel.findById(avatar_id);
  if (!avatar) throw new Error("Avatar not found");

  await avatarModel.deleteAvatar(avatar_id);
};

module.exports={
    addAvatar,
    getAvatarsForGender,
    getAvatarById,
    updateAvatar,
    deleteAvatar

}