const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// Multer MEMORY storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// This handles POSTMAN "photo" file
const uploadMiddleware = upload.single("photo");

const processImage = async (req, res, next) => {
  try {
    // No file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded. Please attach a 'photo' file."
      });
    }

    const buffer = req.file.buffer;

    console.log("📁 File Received:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size + " bytes"
    });

    // Cloudinary upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "user_photos",
        resource_type: "image"
      },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary Upload Error:", error);
          return res.status(500).json({
            success: false,
            message: "Cloudinary upload failed",
            error
          });
        }

        console.log("✔ Cloudinary Upload Success:", result.secure_url);

        // Add URL for controller
        req.body.photo_url = result.secure_url;

        next();
      }
    );

    // Convert buffer into a readable stream
    streamifier.createReadStream(buffer).pipe(uploadStream);

  } catch (err) {
    console.error("❌ processImage error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error during image upload",
      error: err.message
    });
  }
};

module.exports = { uploadMiddleware, processImage };

// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
// const sharp = require("sharp");

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// const uploadMiddleware = upload.single("photo");

// const processImage = async (req, res, next) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "No file uploaded" });
//     }

//     const uploadDir = path.join(__dirname, "../uploads");
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     const fileName = `photo_${Date.now()}.jpg`;
//     const filePath = path.join(uploadDir, fileName);

//     // 🔥 Compress image using Sharp
//     await sharp(req.file.buffer)
//       .resize({ width: 1080 })        // auto-resize large images
//       .jpeg({ quality: 70 })          // compression (0–100)
//       .toFile(filePath);

//     req.body.photo_url = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

//     next();
//   } catch (error) {
//     console.error("Compression Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error compressing image",
//     });
//   }
// };

// module.exports = { uploadMiddleware, processImage };
