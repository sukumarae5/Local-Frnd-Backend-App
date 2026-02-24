const chatModel = require("../models/chatModel");
const chatService = require("../services/chatServices");

const getMessages = async (req, res) => {
  try {

    const userId = req.user.user_id;
    const otherUserId = req.params.userId;
    const { limit = 30, offset = 0 } = req.query;

    const allowed = await chatModel.areFriends(userId, otherUserId);

    if (!allowed) {
      return res.status(403).json({ message: "Not friends" });
    }

    const conversationId =
      await chatService.getOrCreateConversation(
        userId,
        otherUserId
      );

    const messages = await chatModel.getMessages(
  conversationId,
  userId,
  limit,
  offset
);

    res.json({ conversationId, messages });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {

    const userId = req.user.user_id;
    const { messageId } = req.params;

    const affected = await chatModel.deleteMessage(
      messageId,
      userId
    );

    if (!affected) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markConversationRead = async (req, res) => {
  try {

    const userId = req.user.user_id;
    const { conversationId } = req.params;

    await chatModel.markConversationRead(
      conversationId,
      userId
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  getMessages,
  deleteMessage,
  markConversationRead

};
