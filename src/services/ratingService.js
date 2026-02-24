const ratingModel = require("../models/ratingModel");

exports.submitRating = async ({
  session_id,
  rater_id,
  rated_user_id,
  rating
}) => {

  // 1️⃣ Check if already rated
  const alreadyRated = await ratingModel.checkDuplicateRating(
    session_id,
    rater_id
  );

  if (alreadyRated) {
    throw new Error("ALREADY_RATED");
  }

  // 2️⃣ Insert rating
  await ratingModel.insertRating({
    session_id,
    rater_id,
    rated_user_id,
    rating
  });

  // 3️⃣ Update user average rating
  const updatedStats = await ratingModel.updateUserAverage(
    rated_user_id
  );

  return updatedStats;
};
