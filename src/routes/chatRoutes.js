const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const chatController = require("../controllers/chatController");
const chatListController= require("../controllers/chatListController");
const { uploadMiddleware, processFile } = require("../middlewares/chatUpload");


router.get(
  "/messages/:userId",
  authenticateUser,
  chatController.getMessages
);

router.delete(
  "/messages/:messageId",
  authenticateUser,
  chatController.deleteMessage
);

router.get(  
  "/list",
  authenticateUser,
  chatListController.getChatList
);

router.post(
  "/read/conversation/:conversationId",
  authenticateUser,
  chatController.markConversationRead
);


router.post(
  "/upload",
  authenticateUser,
  uploadMiddleware,
  processFile,
  (req, res) => {
    res.json({
      file_url: req.body.file_url,
      file_type: req.body.file_type,
    });
  }
);

module.exports = router;
