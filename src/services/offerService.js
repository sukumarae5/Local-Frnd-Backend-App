const offerModel = require("../models/offerModel");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadImage = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "offers" },
      (error, result) => {
        if (error) return reject(error);

        resolve(result.secure_url);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const getAllOffers = async () => {
  return await offerModel.getAllOffers();
};

const getOfferById = async (id) => {
  return await offerModel.getOfferById(id);
};

const addOffer = async (req) => {
  let imageUrl = null;

  if (req.file) {
    imageUrl = await uploadImage(req.file.buffer);
  }
  const data = {
    title: req.body.title,
    description: req.body.description,
    image: imageUrl,
    redirect_url: req.body.redirect_url,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    priority: req.body.priority,
  };
  console.log("Adding offer with data:", data);
  return await offerModel.addOffer(data);
};

const updateOffer = async (id, req) => {
  let imageUrl = req.body.image_url;

  if (req.file) {
    imageUrl = await uploadImage(req.file.buffer);
  }

  const data = {
    title: req.body.title,
    description: req.body.description,
    image: imageUrl,
    redirect_url: req.body.redirect_url,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    priority: req.body.priority,
  };
  console.log("Updating offer with data:", data, id);
  return await offerModel.updateOffer(id, data);
};

const deleteOffer = async (id) => {
  return await offerModel.deleteOffer(id);
};

module.exports = {
  getAllOffers,
  getOfferById,
  addOffer,
  updateOffer,
  deleteOffer,
};
