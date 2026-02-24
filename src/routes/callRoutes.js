const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const callController = require("../controllers/callController");

router.post("/start-search", authenticateUser, callController.startSearch);
router.get("/searching-females", authenticateUser, callController.searchingFemales);
router.post("/random-connect", authenticateUser, callController.randomConnect);
router.post("/direct-connect", authenticateUser, callController.directConnect);
router.post("/cancel-search", authenticateUser, callController.cancelSearch);
router.get(
  "/connected-details",
  authenticateUser,
  callController.getConnectedCallDetails
);

router.post(
  "/friend-connect",
  authenticateUser,
  callController.friendConnect
);


module.exports = router;
