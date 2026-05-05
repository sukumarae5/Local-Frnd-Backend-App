const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const uploadMiddleware = upload.single("file");

// detect type
const getResourceType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "video"; // cloudinary uses "video" for audio
  return "raw"; // for pdf, doc, etc
};

const processFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const resourceType = getResourceType(req.file.mimetype);

    const uploadToCloudinary = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "chat_files",
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) return reject(error);

            resolve({
              url: result.secure_url,
              type: resourceType,
              format: result.format,
            });
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadToCloudinary();

    // attach to request
    req.body.file_url = result.url;
    req.body.file_type = resourceType;

    next();
  } catch (err) {
    console.error("❌ chat upload error:", err);
    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};

module.exports = {
  uploadMiddleware,
  processFile,
};