const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const chatController = require("../controllers/chatController");
const chatListController= require("../controllers/chatListController");


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


module.exports = router;
