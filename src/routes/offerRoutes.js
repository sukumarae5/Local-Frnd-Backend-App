const express = require("express");
const router = express.Router();

const offerController = require("../controllers/offerController");
const uploadOfferImage = require("../middlewares/uploadOfferImage");

router.get("/", offerController.getAllOffers);

router.get("/:id", offerController.getOfferById);

router.post("/", uploadOfferImage, offerController.addOffer);

router.put("/:id", uploadOfferImage, offerController.updateOffer);

router.delete("/:id", offerController.deleteOffer);

module.exports = router;