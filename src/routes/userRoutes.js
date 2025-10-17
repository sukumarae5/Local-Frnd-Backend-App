const express = require('express')
const router = express.Router()
const userController=require("../controllers/userController")
// const {verifyToken}=require("../middlewares/authMiddleware")


router.put('/update-profile', userController.updateProfile);

module.exports = router;