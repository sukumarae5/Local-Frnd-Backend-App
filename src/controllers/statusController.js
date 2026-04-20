const statusService = require("../services/statusServices");

exports.createStatus = async (req, res) => {
    console.log("Received createStatus request with body:", req.body);  
  try {

    const userId = req.user.user_id;

    await statusService.createStatus(userId, req.body);

    res.json({
      success: true,
      message: "Status uploaded"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


exports.myStatus = async (req, res) => {
  try {

    const userId = req.user.user_id;

    const data = await statusService.getMyStatus(userId);

    res.json({
      success: true,
      data
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


exports.friendsStatus = async (req, res) => {
  console.log(req.user, "is requesting friends' status");
 
  try {

    const userId = req.user.user_id;

    const data = await statusService.getFriendsStatus(userId);
console.log("Fetched friends' status data:", data);
    res.json({
      success: true,
      data
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


exports.deleteStatus = async (req, res) => {
  try {

    const userId = req.user.user_id;
    const { statusId } = req.params;

    await statusService.deleteStatus(statusId, userId);

    res.json({
      success: true,
      message: "Status deleted"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


exports.viewStatus = async (req, res) => {
  console.log(req)
  try {

    const userId = req.user.user_id;
    const { status_id } = req.body;
console.log(status_id, "is being viewed by user", userId);  
    await statusService.viewStatus(status_id, userId);

    res.json({
      success: true
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


exports.viewers = async (req, res) => {
  console.log("Fetching viewers for status:", req.params.statusId);
  try {

    const { statusId } = req.params;

    const data = await statusService.getViewers(statusId);

    res.json({
      success: true,
      data
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};