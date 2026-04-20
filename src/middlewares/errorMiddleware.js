const multer = require("multer");

const MAX_FILE_SIZE_MB = 5;

const errorHandler = (err, req, res, next) => {

  // Multer file size error
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {

    return res.status(400).json({
      success: false,
      message: `Image size exceeds the allowed limit`,
      max_allowed_size: `${MAX_FILE_SIZE_MB}MB`
    });

  }

  // Invalid file type error
  if (err.message === "Only JPG, PNG, WEBP allowed") {

    return res.status(400).json({
      success: false,
      message: err.message
    });

  }

  // Default error
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });

};

module.exports = errorHandler;