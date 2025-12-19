// src/routes/avatarRoutes.js
const express = require("express");
const router = express.Router();
const avatarController = require("../controllers/avatarController");
const { uploadMiddleware, processImage } = require("../middlewares/uploadMiddleware");

router.post(
  "/add",
  uploadMiddleware,
  processImage,
  avatarController.createAvatar
);
router.get("/", avatarController.getAvatars);
router.get("/:id", avatarController.getAvatarById);
router.put("/:id", uploadMiddleware, processImage, avatarController.updateAvatar);
router.delete("/:id", avatarController.deleteAvatar);

module.exports = router;
