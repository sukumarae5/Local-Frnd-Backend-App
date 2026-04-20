const express = require("express");
const router = express.Router();

const controller = require("../controllers/statusController");

const {
 uploadHandler,
  processStatus,
  
} = require("../middlewares/uploadStatus");

const { authenticateUser } = require("../middlewares/authMiddleware");

router.post(
  "/create",
  authenticateUser,
  uploadHandler,
  processStatus,
  controller.createStatus
);

router.get(
  "/my",
  authenticateUser,
  controller.myStatus
);

router.get(
  "/friends",
  authenticateUser,
  controller.friendsStatus
);

router.delete(
  "/:statusId",
  authenticateUser,
  controller.deleteStatus
);

router.post(
  "/view",
  authenticateUser,
  controller.viewStatus
);

router.get(
  "/viewers/:statusId",
  authenticateUser,
  controller.viewers
);

module.exports = router;