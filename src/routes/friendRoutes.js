const router = require("express").Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const controller = require("../controllers/friendController");

router.post("/request", authenticateUser, controller.sendRequest);
router.post("/accept", authenticateUser, controller.acceptRequest);
router.get("/list", authenticateUser, controller.myFriends);
router.get("/pending", authenticateUser, controller.pendingRequests);
router.get("/status/:other", authenticateUser, controller.friendStatus);
router.post("/unfriend", authenticateUser, controller.unfriend);
router.get("/", authenticateUser, controller.getFriends);
// GET /friends?status=ACCEPTED
// GET /friends?status=PENDING
router.get("/admin/friends", controller.adminFriends);

// GET /admin/friends
// GET /admin/friends?status=PENDING



module.exports = router;
