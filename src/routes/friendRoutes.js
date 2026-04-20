const router = require("express").Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const controller = require("../controllers/friendController");

router.post("/request", authenticateUser, controller.sendRequest);
router.post("/accept", authenticateUser, controller.acceptRequest);
router.post("/reject", authenticateUser, controller.rejectRequest);
router.get("/list", authenticateUser, controller.myFriends);
router.get("/pending", authenticateUser, controller.pendingRequests);

router.get("/status/:other", authenticateUser, controller.friendStatus);
router.post("/unfriend", authenticateUser, controller.unfriend);
router.get("/", authenticateUser, controller.getFriends);
router.get("/admin/friends", controller.adminFriends);


module.exports = router;
