const ratingService = require("../services/ratingService");

exports.submitRating = async (req, res) => {
  console.log("📊 submitRating called with:", req.body);
  try {
    const { session_id, rater_id, rated_user_id, rating } = req.body;

    // Basic validation
    if (!session_id || !rater_id || !rated_user_id || !rating) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const result = await ratingService.submitRating({
      session_id,
      rater_id,
      rated_user_id,
      rating
    });

    return res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      data: result
    });

  } catch (error) {
    console.error("Rating Controller Error:", error.message);

    if (error.message === "ALREADY_RATED") {
      return res.status(400).json({
        success: false,
        message: "You have already rated this call"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
