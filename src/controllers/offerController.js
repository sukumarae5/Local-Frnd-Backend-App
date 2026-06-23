const offerService = require("../services/offerService");

const getAllOffers = async (req, res) => {
  try {
    let gender = req.query.gender || req.user?.gender || null;

    const allowed = ["MALE", "FEMALE"];

    // ✅ normalize
    if (gender) {
      gender = gender.toUpperCase();
    }

    // ❌ if invalid → remove filter
    if (!allowed.includes(gender)) {
      gender = null;
    }

    const data = await offerService.getAllOffers(gender);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOfferById = async (req, res) => {

  try {

    const data = await offerService.getOfferById(req.params.id);

    res.json(data);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

const addOffer = async (req, res) => {
console.log("Received request to add offer with data:", req.body);  
  try {

    const data = await offerService.addOffer(req);
console.log(data)
    res.json({
      message: "Offer created",
      data
    });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

const updateOffer = async (req, res) => {

  try {

    const data = await offerService.updateOffer(
      req.params.id,
      req
    );

    res.json({
      message: "Offer updated",
      data
    });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

const deleteOffer = async (req, res) => {

  try {

    const data = await offerService.deleteOffer(req.params.id);

    res.json({
      message: "Offer deleted",
      data
    });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

module.exports = {
  getAllOffers,
  getOfferById,
  addOffer,
  updateOffer,
  deleteOffer
};