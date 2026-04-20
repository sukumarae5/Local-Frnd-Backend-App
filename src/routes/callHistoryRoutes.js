const router = require("express").Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const controller = require("../controllers/callHistoryController");

router.get("/history", authenticateUser, controller.history);
router.get("/recent-users", authenticateUser, controller.recentUsers);
router.get("/with/:userId", authenticateUser, controller.withUser);


router.get("/call-history", controller.getCallHistory);
router.get("/:id/call-history", controller.getUserCallHistory);


module.exports = router;
