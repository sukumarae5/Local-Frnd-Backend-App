// controllers/photoController.js
const photoService = require("../services/photoServices");

exports.getAllPhotos = async (req, res) => {
  try {
    const result = await photoService.getAllPhotos();
    res.json({ success: true, photos: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPhotosByUserId = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const result = await photoService.getPhotosByUserId(user_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// exports.addPhoto = async (req, res) => {
//   try {
//     const user_id = req.params.user_id;
//     const { photo_url } = req.body;
//     console.log("Adding photo for user:", user_id, "with URL:", photo_url);
//     if (!photo_url) {
//       return res.status(400).json({ success: false, message: "photo_url required" });
//     } 

//     const result = await photoService.addPhoto(user_id, photo_url);
//     res.json(result);
//   } catch (error) {
//     console.error("addPhoto error:", error);    



         
//     res.status(500).json({ success: false, message: error.message });
//   }  
// };


exports.addPhoto = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    const urls = req.body.photo_urls;

    if (!urls || urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No photos uploaded",
      });
    }

    const results = [];

    for (const url of urls) {
      const r = await photoService.addPhoto(user_id, url);
      results.push(r);
    }

    res.json({
      success: true,
      message: "Photos uploaded successfully",
      results,
    });

  } catch (error) {
    console.error("addPhoto error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePhotoUrl = async (req, res) => {
  try {
    console.log("Body:", req.body);

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const user_id = req.params.user_id;
    const photo_id = req.params.photo_id;

    let { photo_url, is_primary, status } = req.body;

    if (typeof is_primary !== "undefined") {
      is_primary = Number(is_primary); // '0' → 0, '1' → 1
    } else {
      is_primary = null;
    }

    const result = await photoService.updatePhotoUrl(user_id, photo_id, {
      photo_url,
      is_primary,
      status,
    });

    res.json(result);
  } catch (error) {
    console.error("updatePhotoUrl error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePhotoById = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const photo_id = req.params.photo_id; 
    console.log("Deleting photo:", photo_id, "for user:", user_id); 
    const result = await photoService.deletePhotoById(user_id, photo_id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.setPrimaryPhoto = async (req, res) => {
  try {
    const { user_id, photo_id } = req.params;

    const result = await photoService.setPrimaryPhoto(user_id, photo_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

