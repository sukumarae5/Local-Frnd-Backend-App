const UserInterestService = require('../services/userinterestServices');

const saveUserInterests = async (req, res) => {
  try {
    const user_id = req.user.user_id; // from JWT middleware
    const { interests } = req.body;

    if (!Array.isArray(interests)) {
      return res.status(400).json({
        success: false,
        message: "Interests array is required",
      });
    }

    await UserInterestService.saveUserInterests(user_id, interests);

    res.json({
      success: true,
      message: "User interests saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 📄 Get selected interests of a particular user
const getUserInterests = async (req, res) => {
  try {
    const { user_id } = req.params;

    const interests = await UserInterestService.getUserInterests(user_id);

    res.json({
      success: true,
      message: "User interests fetched successfully",
      data: interests
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  saveUserInterests,
  getUserInterests
};
