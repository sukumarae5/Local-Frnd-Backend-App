const chatService = require("../services/chatServices");
const chatModel = require("../models/chatModel");
const db = require("../config/db"); // only if needed

module.exports = (socket, io) => {

  const myId = socket.user.user_id;

  /* ---------------- SEND ---------------- */

  socket.on("chat_send", async (payload) => {
    try {
      const { receiverId, content, message_type } = payload;

      if (!content || !content.trim()) return;

      const message = await chatService.sendMessage({
        senderId: myId,
        receiverId,
        content,
        type: message_type,
      });

      io.to(String(receiverId)).emit("chat_receive", message);
      io.to(String(myId)).emit("chat_receive", message);

    } catch (err) {
      socket.emit("chat_error", { message: err.message });
    }
  });


  /* ---------------- READ (single message) ---------------- */

  socket.on("chat_read", async ({ messageId }) => {
    try {

      // ✅ mark read for current user
      await chatModel.markRead(messageId, myId);

      // ✅ find sender of that message
      const [[row]] = await db.query(
        `SELECT sender_id
         FROM messages
         WHERE message_id = ?`,
        [messageId]
      );

      if (!row) return;

      const senderId = row.sender_id;

      // ✅ notify the original sender
      io.to(String(senderId)).emit("chat_read_update", {
        messageId,
        readerId: myId
      });

    } catch (e) {
      console.error(e);
    }
  });

};
