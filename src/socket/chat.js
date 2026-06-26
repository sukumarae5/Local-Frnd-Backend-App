// socket/chat.js
// Adds push notification (via existing notificationService) when a message
// is sent and the receiver is either offline OR has the chat muted.

const chatService         = require("../services/chatServices");
const chatModel           = require("../models/chatModel");
const chatOptionsModel    = require("../models/chatOptionsModel");
const notificationService = require("../services/notificationService");
const db                  = require("../config/db");
const socketMap           = require("./socketMap");

const activeChats = {};

module.exports = (socket, io) => {
  const myId = socket.user.user_id;

  /* ── SEND MESSAGE ─────────────────────────────────────────────────────── */
  socket.on("chat_send", async (payload) => {
    try {
      const { receiverId, content, message_type } = payload;

      if (!content) return;
      if (message_type === "text" && !content.trim()) return;

      const allowedTypes = ["text", "image", "video", "audio", "file"];
      if (!allowedTypes.includes(message_type)) {
        return socket.emit("chat_error", { message: "Invalid message type" });
      }

      /* ── BLOCK GUARD (directional) ─────────────────────────────────── */

      // Case 1: I blocked them → error to me, nothing saved
      const iBlockedThem = await chatOptionsModel.hasBlocked(myId, receiverId);
      if (iBlockedThem) {
        return socket.emit("chat_error", {
          message: "You have blocked this user. Unblock to send messages.",
          code: "YOU_BLOCKED",
        });
      }

      // Case 2: They blocked me → save silently, single tick to me, no delivery
      const theyBlockedMe = await chatOptionsModel.hasBlocked(receiverId, myId);
      if (theyBlockedMe) {
        const message = await chatService.sendMessage({
          senderId: myId, receiverId, content, type: message_type,
        });
        io.to(String(myId)).emit("chat_receive", {
          ...message, is_read: 0, delivered: 0,
        });
        return;
      }

      /* ── SAVE MESSAGE ──────────────────────────────────────────────── */
      const message = await chatService.sendMessage({
        senderId: myId, receiverId, content, type: message_type,
      });

      const isOnline       = socketMap.isOnline(String(receiverId));
      const senderInChat   = activeChats[myId]         === receiverId;
      const receiverInChat = activeChats[receiverId]   === myId;
      const bothInChat     = senderInChat && receiverInChat;

      /* ── REAL-TIME DELIVERY ────────────────────────────────────────── */
      if (isOnline && bothInChat) {
        // Both in chat → instant blue double-tick
        await chatModel.markRead(message.message_id, receiverId);
        io.to(String(receiverId)).emit("chat_receive", { ...message, is_read: 1, delivered: 1 });
        io.to(String(myId)).emit("chat_receive",       { ...message, is_read: 1, delivered: 1 });

      } else if (isOnline) {
        // Receiver online but chat not open → gray double-tick
        io.to(String(receiverId)).emit("chat_receive", { ...message, is_read: 0, delivered: 1 });
        io.to(String(myId)).emit("chat_receive",       { ...message, is_read: 0, delivered: 1 });
        io.to(String(myId)).emit("chat_delivered",     { messageId: message.message_id });

      } else {
        // Receiver offline → single tick
        io.to(String(myId)).emit("chat_receive", { ...message, is_read: 0, delivered: 0 });
      }

      /* ── PUSH NOTIFICATION ─────────────────────────────────────────────
         Send a push when:
           a) Receiver is OFFLINE, OR
           b) Receiver is online but does NOT have this chat open (chat muted
              or just in another screen) — so they see the heads-up banner.

         Skip push when both users are actively in the same chat (bothInChat),
         because the real-time socket event is already shown on screen.

         Also skip if the receiver has muted this conversation.
      ──────────────────────────────────────────────────────────────────── */
      if (!bothInChat) {
        // Check mute — get conversationId from message
        const conversationId = message.conversation_id;
        const receiverMuted  = await chatOptionsModel.isMuted(receiverId, conversationId);

        if (!receiverMuted) {
          // Build a human-readable preview
          let preview;
          switch (message_type) {
            case "image":  preview = "📷 Sent a photo";  break;
            case "video":  preview = "🎥 Sent a video";  break;
            case "audio":  preview = "🎙 Sent a voice message"; break;
            case "file":   preview = "📎 Sent a file";   break;
            default:
              // Truncate long text messages
              preview = content.length > 60 ? content.slice(0, 60) + "…" : content;
          }

          // Use your existing notification pipeline:
          // DB insert + FCM push via notificationService
          await notificationService.createNotification(
            myId,           // sender
            receiverId,     // receiver
            "MESSAGE",      // type (matches your notifications table enum)
            preview,        // message column
            {
              call_type:  null,
              session_id: String(message.message_id), // reuse session_id column for msg id
            }
          );

          // Tell the receiver's app to refresh its notification badge
          io.to(String(receiverId)).emit("new_message_notification", {
            senderId:  myId,
            messageId: message.message_id,
          });
        }
      }

    } catch (err) {
      console.error("chat_send error:", err);
      socket.emit("chat_error", { message: err.message });
    }
  });

  /* ── READ (single message) ────────────────────────────────────────────── */
  socket.on("chat_read", async ({ messageId }) => {
    try {
      await chatModel.markRead(messageId, myId);
      const [[row]] = await db.query(
        `SELECT sender_id FROM messages WHERE message_id = ?`, [messageId]
      );
      if (!row) return;
      io.to(String(row.sender_id)).emit("chat_read_update", { messageId, readerId: myId });
    } catch (e) {
      console.error("❌ chat_read error:", e);
    }
  });

  /* ── READ ALL ─────────────────────────────────────────────────────────── */
  socket.on("chat_read_all", async ({ conversationId }) => {
    try {
      await chatModel.markConversationRead(conversationId, myId);

      const [[row]] = await db.query(
        `SELECT user1_id, user2_id FROM conversations WHERE conversation_id = ?`,
        [conversationId]
      );
      if (!row) return;

      const otherUser = row.user1_id === myId ? row.user2_id : row.user1_id;
      
      await notificationService.deleteMessageNotification(
  otherUser,
  myId
);
      io.to(String(otherUser)).emit("chat_read_all_update", { otherUserId: myId });

      const [messages] = await db.query(
        `SELECT message_id FROM messages WHERE conversation_id = ?`, [conversationId]
      );
      messages.forEach(msg => {
        io.to(String(otherUser)).emit("chat_read_update", { messageId: msg.message_id });
      });

    } catch (e) {
      console.error("❌ chat_read_all error:", e);
    }
  });

  /* ── CHAT OPEN ────────────────────────────────────────────────────────── */
  socket.on("chat_open", async ({ userId, chattingWith }) => {
    console.log("CHAT OPEN:", userId, "->", chattingWith);
    activeChats[userId] = chattingWith;

    // Remove message notifications because the chat is now open
await notificationService.deleteMessageNotification(
  chattingWith, // sender
  userId        // receiver
);

    io.to(String(userId)).emit("notification_deleted");

    const [unreadMessages] = await db.query(`
      SELECT m.message_id, m.sender_id
      FROM messages m
      LEFT JOIN message_reads r
        ON r.message_id = m.message_id AND r.user_id = ?
      WHERE m.conversation_id = (
        SELECT conversation_id FROM conversations
        WHERE (user1_id = ? AND user2_id = ?)
           OR (user1_id = ? AND user2_id = ?)
      )
      AND m.sender_id <> ?
      AND r.message_id IS NULL
    `, [userId, userId, chattingWith, chattingWith, userId, userId]);

    for (const msg of unreadMessages || []) {
      await chatModel.markRead(msg.message_id, userId);
      io.to(String(msg.sender_id)).emit("chat_read_update",     { messageId: msg.message_id });
      io.to(String(msg.sender_id)).emit("chat_read_all_update", { otherUserId: userId });
    }
  });

  /* ── CHAT CLOSE / DISCONNECT ──────────────────────────────────────────── */
  socket.on("chat_close",  ({ userId }) => { delete activeChats[userId]; });
  socket.on("disconnect",  ()           => { delete activeChats[myId];   });
};