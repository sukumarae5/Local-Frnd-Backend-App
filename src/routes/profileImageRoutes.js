const express = require("express");
const router = express.Router();

const profileImageController = require("../controllers/profileImageController");

const { authenticateUser } = require("../middlewares/authMiddleware");

const {
  uploadSingleMiddleware,
  processSingleImage,
} = require("../middlewares/uploadMiddleware");

// Upload Profile Picture
router.post(
  "/",
  authenticateUser,
  uploadSingleMiddleware,
  processSingleImage,
  profileImageController.uploadProfileImage
);

// Remove Profile Picture
router.delete(
  "/",
  authenticateUser,
  profileImageController.deleteProfileImage
);

module.exports = router;