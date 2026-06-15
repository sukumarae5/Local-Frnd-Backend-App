const likeMindedModel = require("../models/likeMindedModel");

const getLikeMindedUsers = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const users = await likeMindedModel.getLikeMindedUsers(
    userId,
    limit,
    offset
  );

  return {
    success: true,
    page,
    limit,
    total: users.length,
    users: users.map(u => ({
      user_id: u.user_id,
      name: u.name,
      avatar: u.avatar,
      is_online: !!u.is_online,
      matched_interests: u.matched_interests
        ? u.matched_interests.split(",")
        : [],
      match_count: u.match_count
    }))
  };
};

module.exports = {
  getLikeMindedUsers
};