const express = require("express");
const router = express.Router();

const offerController = require("../controllers/offerController");
const uploadOfferImage = require("../middlewares/uploadOfferImage");

//////////////////////////////////////////////////////
// Offer CRUD
//////////////////////////////////////////////////////

router.get(
  "/",
  offerController.getAllOffers
);

router.get(
  "/:id",
  offerController.getOfferById
);

router.post(
  "/",
  uploadOfferImage,
  offerController.createOffer
);

router.put(
  "/:id",
  uploadOfferImage,
  offerController.updateOffer
);

router.put(
  "/status/:id",
  offerController.updateOfferStatus
);

router.delete(
  "/:id",
  offerController.deleteOffer
);

module.exports = router;