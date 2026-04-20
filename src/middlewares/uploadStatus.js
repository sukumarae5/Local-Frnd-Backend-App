const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 5
  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "video/mp4"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only image (jpg, png) or video (mp4) allowed"), false);
    }

    cb(null, true);
  }

});

const uploadMiddleware = upload.array("stories", 5);

const uploadHandler = (req, res, next) => {

  uploadMiddleware(req, res, function (err) {

    if (err instanceof multer.MulterError) {

      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size exceeds 20MB limit"
        });
      }

      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          success: false,
          message: "Maximum 5 stories allowed"
        });
      }

    }

    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    next();
  });
};

const processStatus = async (req, res, next) => {
  try {

    if (!req.files || req.files.length === 0) {
      return next();
    }

    const uploadOne = (file) =>
      new Promise((resolve, reject) => {

        const resourceType = file.mimetype.startsWith("video")
          ? "video"
          : "image";

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "user_status",
            resource_type: resourceType,
          },
          (error, result) => {

            if (error) return reject(error);

            resolve({
              url: result.secure_url,
              type: resourceType,
            });

          }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

    const uploadedFiles = await Promise.all(
      req.files.map((file) => uploadOne(file))
    );

    req.body.stories = uploadedFiles;

    next();

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Status upload failed"
    });

  }
};

module.exports = {
  uploadMiddleware,
  uploadHandler,
  processStatus,
};