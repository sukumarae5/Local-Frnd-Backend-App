const router = require("express").Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const controller = require("../controllers/notificationController");

router.get("/", authenticateUser, controller.list);
router.post("/read", authenticateUser, controller.read);

module.exports = router;
