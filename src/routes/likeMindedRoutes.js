const express = require("express");
const router = express.Router();

const likeMindedController = require("../controllers/likeMindedController");
const { authenticateUser } = require("../middlewares/authMiddleware");

// ✅ correct route
router.get("/", authenticateUser, likeMindedController.getLikeMindedUsers);

module.exports = router;