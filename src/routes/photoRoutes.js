const express=require('express')
const router= express.Router()
const photoController= require("../controllers/photoController")
const {authenticateUser}=require("../middlewares/authMiddleware")
const {uploadMiddleware, processImage }=require("../middlewares/uploadMiddleware") 

router.post("/:user_id", authenticateUser,uploadMiddleware,processImage, photoController.addPhoto)
router.put("/:user_id/:photo_id",authenticateUser,uploadMiddleware,processImage, photoController.updatePhotoUrl)
router.delete("/:user_id/:photo_id",authenticateUser, photoController.deletePhotoById)

// router.post("/:user_id", authenticateUser, photoController.addPhoto)
// router.put("/:user_id/:photo_id",authenticateUser, photoController.updatePhotoUrl)
// router.delete("/:user_id/:photo_id",authenticateUser, photoController.deletePhotoById)

router.get('/all', photoController.getAllPhotos);         
router.get("/:user_id", photoController.getPhotosByUserId)
router.post("/admin/:user_id", photoController.addPhoto)
router.put("/admin/:user_id/:photo_id", photoController.updatePhotoUrl)
router.delete("/admin/:user_id/:photo_id", photoController.deletePhotoById)

module.exports= router  