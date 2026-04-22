const router = require("express").Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const controller = require("../controllers/purchaseController");
const db = require("../config/db");

router.post(
  "/create-order",
  authenticateUser,
  controller.createOrder
);

router.post(
  "/verify",
  authenticateUser,
  controller.verifyPayment
);


module.exports = router;