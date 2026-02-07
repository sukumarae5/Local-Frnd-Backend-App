const chatModel = require("../models/chatModel");

const getOrCreateConversation = async (userA, userB) => {
  const convo = await chatModel.getConversation(userA, userB);

  if (convo) return convo.conversation_id;

  return await chatModel.createConversation(userA, userB);
};

const sendMessage = async ({ senderId, receiverId, content, type }) => {

  const allowed = await chatModel.areFriends(senderId, receiverId);

  if (!allowed) {
    throw new Error("Not friends");
  }

  const conversationId = await getOrCreateConversation(
    senderId,
    receiverId
  );

  const messageId = await chatModel.insertMessage(
    conversationId,
    senderId,
    content,
    type || "text"
  );

  return {
    message_id: messageId,
    conversation_id: conversationId,
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    message_type: type || "text",
    sent_at: new Date()
  };
};

module.exports = {
  getOrCreateConversation,
  sendMessage,
};
