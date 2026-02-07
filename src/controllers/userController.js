const profileService = require("../services/userServices");

exports.getAllUsers = async (req, res) => {
  try {
    const result = await profileService.getAllUsers();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await profileService.getProfileById(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user_id = req.params.id;
    const userData = req.body;
    console.log(req.body);
    console.log(req.params.id);
    if (!user_id)
      return res
        .status(400)
        .json({ success: false, message: "user id is required" });

    const result = await profileService.updateProfile(user_id, userData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.patchProfile = async (req, res) => {
  console.log("Patch profile request body:", req.body);
  try {
    const user_id = req.user.user_id; 
    const updates = req.body;
console.log("User ID from token:", user_id);
  console.log("Updates to apply:", updates);
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    const result = await profileService.patchProfile(user_id, updates);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteUserId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const result = await profileService.deleteUserId(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRandomUsers = async (req, res) => {
  try {
    const currentUserId = req.user.user_id;

    const result = await profileService.getRandomUsers(currentUserId);

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.connectRandom = async (req, res) => {
  const currentUserId = req.user.user_id;

  const result = await profileService.connectRandomUser(currentUserId);

  res.json(result);
};

exports.connectUser = async (req, res) => {
  const currentUserId = req.user.user_id;
  const { targetUserId } = req.body;

  const result = await profileService.connectToSpecificUser(
    currentUserId,
    targetUserId
  );

  res.json(result);
};

exports.connectRandomOppositeGender = async (req, res) => {
  const currentUserId = req.user.user_id;
  const result = await profileService.connectRandomUserOppositeGender(
    currentUserId
  );
  res.json(result);
};

exports.nearbyForMale = async (req, res) => {
  const userId = req.user.user_id;
  const result = await profileService.connectNearbyForMale(userId);
  res.json(result);
};


exports.connectNearestFemale = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await profileService.connectMaleToNearestFemale(userId);

    return res.json(result);
  } catch (err) {
    console.error("connectNearestFemale error", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.browseRandomFemales = async (req, res) => {
  console.log(req)
  try {
    const result =
      await profileService.getRandomOnlineSearchingFemales();
console.log(result)
    return res.json(result);
  } catch (error) {
    console.error("browseRandomFemales error", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};