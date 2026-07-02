
// src/middleware/uploadImage.js
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// Multer memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed"));
    }
    cb(null, true);
  },
});

const uploadMiddleware = upload.array("photos", 5);

const uploadSingleMiddleware = upload.single("photo");

const processImage = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Image files are required",
      });
    }

    const uploadOne = (file) =>
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "profile_photos",
            resource_type: "image",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

    const uploadedUrls = await Promise.all(
      req.files.map((file) => uploadOne(file))
    );

    // pass to controller
    req.body.photo_urls = uploadedUrls;

    next();
  } catch (err) {
    console.error("❌ Image middleware error:", err);
    res.status(500).json({
      success: false,
      message: "Image processing error",
    });
  }
};

const processSingleImage = async (req, res, next) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "profile_images",
            resource_type: "image",
          },
          (error, result) => {

            if (error) return reject(error);

            resolve(result.secure_url);

          }
        );

        streamifier
          .createReadStream(req.file.buffer)
          .pipe(uploadStream);

      });

    const imageUrl = await uploadToCloudinary();

    req.body.profile_image_url = imageUrl;

    next();

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Image upload failed",
    });

  }
};

module.exports = {
  uploadMiddleware,
  processImage,
  uploadSingleMiddleware,
  processSingleImage,
};

