const offerService = require("../services/offerService");

//////////////////////////////////////////////////////
// Get All Offers
//////////////////////////////////////////////////////

const getAllOffers = async (req, res) => {
  try {
    let gender = req.query.gender || req.user?.gender || null;

    if (gender) {
      gender = gender.toUpperCase();
    }

    if (!["MALE", "FEMALE"].includes(gender)) {
      gender = null;
    }

    const data = await offerService.getAllOffers(gender);

    res.status(200).json({
      success: true,
      message: "Offers fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//////////////////////////////////////////////////////
// Get Offer By Id
//////////////////////////////////////////////////////

const getOfferById = async (req, res) => {
  try {
    const data = await offerService.getOfferById(req.params.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//////////////////////////////////////////////////////
// Create Offer
//////////////////////////////////////////////////////

const createOffer = async (req, res) => {
  try {
    const data = await offerService.createOffer(req);

    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//////////////////////////////////////////////////////
// Update Offer
//////////////////////////////////////////////////////

const updateOffer = async (req, res) => {
  try {
    const data = await offerService.updateOffer(req.params.id, req);

    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//////////////////////////////////////////////////////
// Update Offer Status
//////////////////////////////////////////////////////

const updateOfferStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const data = await offerService.updateOfferStatus(
      req.params.id,
      status
    );

    res.status(200).json({
      success: true,
      message: "Offer status updated",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//////////////////////////////////////////////////////
// Delete Offer
//////////////////////////////////////////////////////

const deleteOffer = async (req, res) => {
  try {
    const data = await offerService.deleteOffer(req.params.id);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  updateOfferStatus,
  deleteOffer,
};