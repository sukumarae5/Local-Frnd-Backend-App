const likeMindedService = require("../services/likeMindedService");

const getLikeMindedUsers = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await likeMindedService.getLikeMindedUsers(
      userId,
      page,
      limit
    );

    res.json(result);
  } catch (error) {
    console.error("Like-minded error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getLikeMindedUsers
};