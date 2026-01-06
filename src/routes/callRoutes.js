const express = require("express");
const router = express.Router();
const callController = require("../controllers/callController");
const { authenticateUser } = require("../middlewares/authMiddleware");

router.post("/initiate", authenticateUser, callController.initiate);
router.post("/random-connect", authenticateUser, callController.randomConnect);
router.post("/hangup", authenticateUser, callController.hangup);


router.get("/status/:session_id", authenticateUser, callController.status);

module.exports = router;
