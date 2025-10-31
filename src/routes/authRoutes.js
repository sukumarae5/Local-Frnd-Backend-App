const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.registerUser);
router.post("/login", authController.sendLoginOtp);
router.post("/verify-otp", authController.verifyOtp);

module.exports = router;
