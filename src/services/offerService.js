const offerModel = require("../models/offerModel");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

///////////////////////////////////////////////////////
// Upload Image
///////////////////////////////////////////////////////

const uploadImage = (buffer, folder = "offers") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
      },
      (error, result) => {
        if (error) return reject(error);

        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

///////////////////////////////////////////////////////
// Build Complete Offer
///////////////////////////////////////////////////////

const buildOfferResponse = async (offer) => {
  const contents = await offerModel.getContents(offer.id);

  const features = await offerModel.getFeatures(offer.id);

  const button = await offerModel.getButton(offer.id);

  return {
    ...offer,
    contents,
    features,
    button,
  };
};

///////////////////////////////////////////////////////
// Get All Offers
///////////////////////////////////////////////////////

const getAllOffers = async (gender) => {
  const offers = await offerModel.getAllOffers(gender);
console.log("Offers:", offers);
  const response = [];

  for (const offer of offers) {
    response.push(await buildOfferResponse(offer));
  }

  return response;
};

///////////////////////////////////////////////////////
// Get Offer By Id
///////////////////////////////////////////////////////

const getOfferById = async (id) => {
  const offer = await offerModel.getOfferById(id);

  if (!offer) {
    throw new Error("Offer not found");
  }

  return await buildOfferResponse(offer);
};


///////////////////////////////////////////////////////
// Create Offer
///////////////////////////////////////////////////////

const createOffer = async (req) => {

  let backgroundImage = null;
  let rightImage = null;

  /////////////////////////////////////////////////
  // Upload Background Image
  /////////////////////////////////////////////////

  if (req.files?.background_image?.length) {
    backgroundImage = await uploadImage(
      req.files.background_image[0].buffer,
      "offers/background"
    );
  }

  /////////////////////////////////////////////////
  // Upload Right Image
  /////////////////////////////////////////////////

  if (req.files?.right_image?.length) {
    rightImage = await uploadImage(
      req.files.right_image[0].buffer,
      "offers/right"
    );
  }

  /////////////////////////////////////////////////
  // Create Main Offer
  /////////////////////////////////////////////////

  const offerId = await offerModel.createOffer({
    banner_type: req.body.banner_type,
    background_image: backgroundImage,
    right_image: rightImage,
    redirect_url: req.body.redirect_url,
    priority: req.body.priority || 0,
    start_date: req.body.start_date || null,
    end_date: req.body.end_date || null,
    status: req.body.status || 1,
    target_audience: req.body.target_audience || "ALL",
  });

  /////////////////////////////////////////////////
  // Save Contents
  /////////////////////////////////////////////////

  if (req.body.contents) {

    const contents =
      typeof req.body.contents === "string"
        ? JSON.parse(req.body.contents)
        : req.body.contents;

    for (const item of contents) {

      await offerModel.addContent({
        offer_id: offerId,
        content_key: item.content_key,
        content_value: item.content_value,
        sort_order: item.sort_order || 0,
      });

    }

  }

  /////////////////////////////////////////////////
  // Save Features
  /////////////////////////////////////////////////

  if (req.body.features) {

    const features =
      typeof req.body.features === "string"
        ? JSON.parse(req.body.features)
        : req.body.features;

    for (const feature of features) {

      await offerModel.addFeature({
        offer_id: offerId,
        icon: feature.icon,
        title: feature.title,
        description: feature.description,
        sort_order: feature.sort_order || 0,
      });

    }

  }

  /////////////////////////////////////////////////
  // Save Button
  /////////////////////////////////////////////////

  if (req.body.button) {

    const button =
      typeof req.body.button === "string"
        ? JSON.parse(req.body.button)
        : req.body.button;

    await offerModel.addButton({
      offer_id: offerId,
      button_text: button.button_text,
      button_color: button.button_color,
      text_color: button.text_color,
      redirect_url: button.redirect_url,
    });

  }

  /////////////////////////////////////////////////
  // Return Complete Offer
  /////////////////////////////////////////////////

  return await getOfferById(offerId);

};

///////////////////////////////////////////////////////
// Update Offer
///////////////////////////////////////////////////////

const updateOffer = async (id, req) => {

  const oldOffer = await offerModel.getOfferById(id);

  if (!oldOffer) {
    throw new Error("Offer not found");
  }

  let backgroundImage = oldOffer.background_image;
  let rightImage = oldOffer.right_image;

  /////////////////////////////////////////////////
  // Upload New Background
  /////////////////////////////////////////////////

  if (req.files?.background_image?.length) {

    backgroundImage = await uploadImage(
      req.files.background_image[0].buffer,
      "offers/background"
    );

  }

  /////////////////////////////////////////////////
  // Upload New Right Image
  /////////////////////////////////////////////////

  if (req.files?.right_image?.length) {

    rightImage = await uploadImage(
      req.files.right_image[0].buffer,
      "offers/right"
    );

  }

  /////////////////////////////////////////////////
  // Update Offer
  /////////////////////////////////////////////////

  await offerModel.updateOffer(id, {

    banner_type: req.body.banner_type,

    background_image: backgroundImage,

    right_image: rightImage,

    redirect_url: req.body.redirect_url,

    priority: req.body.priority,

    start_date: req.body.start_date,

    end_date: req.body.end_date,

    status: req.body.status,

    target_audience: req.body.target_audience,

  });

  /////////////////////////////////////////////////
  // Delete Old Child Records
  /////////////////////////////////////////////////

  await offerModel.deleteContentsByOfferId(id);

  await offerModel.deleteFeaturesByOfferId(id);

  await offerModel.deleteButtonByOfferId(id);

  /////////////////////////////////////////////////
  // Insert Contents
  /////////////////////////////////////////////////

  if (req.body.contents) {

    const contents =
      typeof req.body.contents === "string"
        ? JSON.parse(req.body.contents)
        : req.body.contents;

    for (const item of contents) {

      await offerModel.addContent({

        offer_id: id,

        content_key: item.content_key,

        content_value: item.content_value,

        sort_order: item.sort_order || 0,

      });

    }

  }

  /////////////////////////////////////////////////
  // Insert Features
  /////////////////////////////////////////////////

  if (req.body.features) {

    const features =
      typeof req.body.features === "string"
        ? JSON.parse(req.body.features)
        : req.body.features;

    for (const item of features) {

      await offerModel.addFeature({

        offer_id: id,

        icon: item.icon,

        title: item.title,

        description: item.description,

        sort_order: item.sort_order || 0,

      });

    }

  }

  /////////////////////////////////////////////////
  // Insert Button
  /////////////////////////////////////////////////

  if (req.body.button) {

    const button =
      typeof req.body.button === "string"
        ? JSON.parse(req.body.button)
        : req.body.button;

    await offerModel.addButton({

      offer_id: id,

      button_text: button.button_text,

      button_color: button.button_color,

      text_color: button.text_color,

      redirect_url: button.redirect_url,

    });

  }

  return await getOfferById(id);

};


///////////////////////////////////////////////////////
// Update Status
///////////////////////////////////////////////////////

const updateOfferStatus = async (id, status) => {

  await offerModel.updateOfferStatus(id, status);

  return await getOfferById(id);

};

///////////////////////////////////////////////////////
// Delete Offer
///////////////////////////////////////////////////////

const deleteOffer = async (id) => {

  const offer = await offerModel.getOfferById(id);

  if (!offer) {
    throw new Error("Offer not found");
  }

  await offerModel.deleteOffer(id);

  return {
    success: true,
    message: "Offer deleted successfully",
  };

};
module.exports = {
  uploadImage,
  buildOfferResponse,
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  updateOfferStatus,
  deleteOffer
};