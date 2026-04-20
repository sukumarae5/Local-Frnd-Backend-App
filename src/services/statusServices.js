const statusModel = require("../models/statusModel");

exports.createStatus = async (userId, body) => {

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  let stories = [];

  if (body.stories) {

    stories = body.stories.map((file) => [
      userId,
      file.type,
      null,
      file.url,
      expiresAt
    ]);

  }

  if (body.text_content) {

    stories.push([
      userId,
      "text",
      body.text_content,
      null,
      expiresAt
    ]);

  }

  return statusModel.createStatus(stories);
};


exports.getMyStatus = async (userId) => {

  const [data] = await statusModel.getMyStatus(userId);

  return data;
};


exports.getFriendsStatus = async (userId) => {

  const [data] = await statusModel.getFriendsStatus(userId);

  return data;
};


exports.deleteStatus = async (statusId, userId) => {

  return statusModel.deleteStatus(statusId, userId);
};


exports.viewStatus = async (statusId, viewerId) => {

  return statusModel.addView(statusId, viewerId);
};


exports.getViewers = async (statusId) => {

  const [data] = await statusModel.getViewers(statusId);

  return data;
};