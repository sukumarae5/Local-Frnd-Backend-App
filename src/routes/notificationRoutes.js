

const router = require("express").Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const controller = require("../controllers/notificationController");

router.get("/", authenticateUser, controller.getNotifications);
router.post("/read", authenticateUser, controller.markRead);
router.get("/unread-count", authenticateUser, controller.unreadCount);

module.exports = router;