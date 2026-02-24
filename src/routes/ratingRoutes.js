const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");

// POST /api/rating
router.post("/submit", ratingController.submitRating);


module.exports = router;
