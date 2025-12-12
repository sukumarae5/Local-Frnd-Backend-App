const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middlewares/authMiddleware");
const profileController = require("../controllers/profileController");

router.get("/profile", authenticateUser, profileController.getProfile);

module.exports = router;
