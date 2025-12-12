const express = require('express')
const router = express.Router()
const userController=require("../controllers/userController")
const {authenticateUser}=require("../middlewares/authMiddleware")
// const adminMiddileware=require("../middlewares/adminMiddleware")

router.put('/profile/:id',authenticateUser, userController.updateProfile);
router.get("/profile/:id", authenticateUser, userController.getProfileById);
router.delete("/profile/:id", authenticateUser,  userController.deleteUserId);


router.get("/random-users", authenticateUser, userController.getRandomUsers);
router.get("/connect/random", authenticateUser, userController.connectRandom);
router.post("/connect/user", authenticateUser, userController.connectUser);


router.put('/admin/profile/:id', userController.updateProfile);
// router.get("/admin/profile/:id", userController.getProfileById)    
router.get("/profile", userController.getAllUsers);
router.delete("/admin/profile/:id", userController.deleteUserId);

module.exports = router;