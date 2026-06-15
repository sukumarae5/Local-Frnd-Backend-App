const router = require("express").Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const controller = require("../controllers/withdrawController");

/* =============================
   WITHDRAW
============================= */
router.post(
  "/create",
  authenticateUser,
  controller.createWithdraw
);
router.post("/webhook/razorpay", controller.handleWebhook);
/* =============================
   HISTORY
============================= */
router.get(
  "/history",
  authenticateUser,
  controller.getHistory
);

module.exports = router;