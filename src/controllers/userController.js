const profileService = require("../services/userServices");

// // Get all users
// exports.getAllUsers = async (req, res) => {
//   try {
//     const result = await profileService.getAllUsers();
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get profile by ID
// exports.getProfileById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await profileService.getProfileById(id);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


exports.updateProfile = async (req, res) => {
  try {
    const user_id  = req.params.id;
    const userData = req.body;
    console.log(req.body)
    console.log(req.params.id)
    if (!user_id)
      return res.status(400).json({ success: false, message: "user id is required" });

    const result = await profileService.updateProfile(user_id, userData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// exports.deleteUserId = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ success: false, message: "User ID is required" });
//     }

//     const result = await profileService.deleteUserId(id);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };