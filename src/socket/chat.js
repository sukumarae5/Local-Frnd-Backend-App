const chatService = require("../services/chatServices");
const chatModel = require("../models/chatModel");
const db = require("../config/db");
const socketMap = require("./socketMap");

const activeChats = {};
module.exports = (socket, io) => {

  const myId = socket.user.user_id;

  /* ---------------- SEND MESSAGE ---------------- */


socket.on("chat_send", async (payload) => {
  try {
    const { receiverId, content, message_type } = payload;

if (!content) return;

if (message_type === "text" && !content.trim()) return;

const allowedTypes = ["text", "image", "video", "audio", "file"];

if (!allowedTypes.includes(message_type)) {
  return socket.emit("chat_error", { message: "Invalid message type" });
}
    const message = await chatService.sendMessage({
      senderId: myId,
      receiverId,
      content,
      type: message_type,
    });

const isOnline = socketMap.isOnline(String(receiverId));

const senderInChat = activeChats[myId] === receiverId;
const receiverInChat = activeChats[receiverId] === myId;

const bothInChat = senderInChat && receiverInChat;

if (isOnline && bothInChat) {
  // 🔵 instant blue

  await chatModel.markRead(message.message_id, receiverId);

  io.to(String(receiverId)).emit("chat_receive", {
    ...message,
    is_read: 1,
    delivered: 1
  });

  io.to(String(myId)).emit("chat_receive", {
    ...message,
    is_read: 1,
    delivered: 1
  });

} else if (isOnline) {
  // ✔✔ gray

  io.to(String(receiverId)).emit("chat_receive", {
    ...message,
    is_read: 0,
    delivered: 1
  });

  io.to(String(myId)).emit("chat_receive", {
    ...message,
    is_read: 0,
    delivered: 1
  });

  io.to(String(myId)).emit("chat_delivered", {
    messageId: message.message_id
  });

} else {
  // ✔ single

  io.to(String(myId)).emit("chat_receive", {
    ...message,
    is_read: 0,
    delivered: 0
  });
}
    console.log("----- CHAT DEBUG -----");
console.log("sender:", myId);
console.log("receiver:", receiverId);
console.log("activeChats:", activeChats);

console.log("senderInChat:", activeChats[myId]);
console.log("receiverInChat:", activeChats[receiverId]);

console.log(
  "senderInChat === receiverId:",
  activeChats[myId] === receiverId
);

console.log(
  "receiverInChat === senderId:",
  activeChats[receiverId] === myId
);

console.log("isOnline:", isOnline);
console.log("----------------------");
  } catch (err) {
    socket.emit("chat_error", { message: err.message });
  }
});
  /* ---------------- READ (single message) ---------------- */

  socket.on("chat_read", async ({ messageId }) => {
    try {

      // ✅ mark read in DB
      await chatModel.markRead(messageId, myId);

      // ✅ find sender
      const [[row]] = await db.query(
        `SELECT sender_id FROM messages WHERE message_id = ?`,
        [messageId]
      );

      if (!row) return;

      const senderId = row.sender_id;

      /* ---------------- SEND READ UPDATE ---------------- */

      io.to(String(senderId)).emit("chat_read_update", {
        messageId,
        readerId: myId
      });

    } catch (e) {
      console.error("❌ chat_read error:", e);
    }
  });


  /* ---------------- READ ALL (OPTIONAL) ---------------- */
socket.on("chat_read_all", async ({ conversationId }) => {
  try {
    await chatModel.markConversationRead(conversationId, myId);

    const [[row]] = await db.query(
      `SELECT user1_id, user2_id FROM conversations WHERE conversation_id = ?`,
      [conversationId]
    );

    if (!row) return;

    const otherUser =
      row.user1_id === myId ? row.user2_id : row.user1_id;

    // 🔥 IMPORTANT: send BOTH updates

    io.to(String(otherUser)).emit("chat_read_all_update", {
      otherUserId: myId,
    });

    // 🔥 ALSO send individual updates
    const [messages] = await db.query(`
      SELECT message_id
      FROM messages
      WHERE conversation_id = ?
    `, [conversationId]);

    messages.forEach(msg => {
      io.to(String(otherUser)).emit("chat_read_update", {
        messageId: msg.message_id,
      });
    });

  } catch (e) {
    console.error("❌ chat_read_all error:", e);
  }
});



 socket.on("chat_open", async ({ userId, chattingWith }) => {
  console.log("CHAT OPEN:", userId, "->", chattingWith);

  activeChats[userId] = chattingWith;

const [unreadMessages] = await db.query(`
  SELECT m.message_id, m.sender_id
  FROM messages m
  LEFT JOIN message_reads r 
    ON r.message_id = m.message_id 
    AND r.user_id = ?
  WHERE m.conversation_id = (
    SELECT conversation_id FROM conversations
    WHERE (user1_id = ? AND user2_id = ?)
       OR (user1_id = ? AND user2_id = ?)
  )
  AND m.sender_id <> ?
  AND r.message_id IS NULL
`, [userId, userId, chattingWith, chattingWith, userId, userId]);

// ✅ SAFE LOOP
for (const msg of unreadMessages || []) {
  await chatModel.markRead(msg.message_id, userId);

  io.to(String(msg.sender_id)).emit("chat_read_update", {
    messageId: msg.message_id,
  });

  io.to(String(msg.sender_id)).emit("chat_read_all_update", {
    otherUserId: userId,
  });
}
});

socket.on("chat_close", ({ userId }) => {
  delete activeChats[userId];
  socket.currentChatUser = null;
});

socket.on("disconnect", () => {
  delete activeChats[myId];
});
};