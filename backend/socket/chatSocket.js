import jwt from "jsonwebtoken";
import messageModel from "../models/messageModel.js";

export const setupChatSocket = (io) => {
  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.token ||
        socket.handshake.headers?.dtoken;

      if (!token) {
        return next(new Error("Authentication token required for chat"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded || !decoded.id) {
        return next(new Error("Invalid authentication token"));
      }

      socket.user = {
        id: decoded.id,
        role: socket.handshake.auth?.role || socket.handshake.query?.role || "user",
      };

      next();
    } catch (err) {
      console.error("Socket Auth Error:", err.message);
      return next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const { id: userId, role } = socket.user;

    // Join personal notification channel
    const personalRoom = `${role}_${userId}`;
    socket.join(personalRoom);

    // Join specific 1-to-1 chat room
    socket.on("join_chat", ({ chatId }) => {
      if (chatId && chatId.includes("_")) {
        const [uId, dId] = chatId.split("_");
        // Ensure only participants can join this chat room
        if (userId === uId || userId === dId) {
          socket.join(chatId);
        }
      }
    });

    // Leave chat room
    socket.on("leave_chat", ({ chatId }) => {
      if (chatId) {
        socket.leave(chatId);
      }
    });

    // Real-time message sending via socket
    socket.on("send_message", async (data, callback) => {
      try {
        const { chatId, text, attachment, recipientId } = data;
        if (!chatId || !chatId.includes("_")) {
          if (callback) callback({ success: false, message: "Invalid chatId" });
          return;
        }

        const [uId, dId] = chatId.split("_");
        if (userId !== uId && userId !== dId) {
          if (callback) callback({ success: false, message: "Unauthorized" });
          return;
        }

        const senderRole = userId === uId ? "user" : "doctor";
        const recipientRole = senderRole === "user" ? "doctor" : "user";
        const resolvedRecipientId = recipientId || (senderRole === "user" ? dId : uId);

        const newMessage = await messageModel.create({
          chatId,
          userId: uId,
          docId: dId,
          senderId: userId,
          senderRole,
          recipientId: resolvedRecipientId,
          recipientRole,
          text: text || "",
          attachment: attachment || {
            url: "",
            name: "",
            fileType: "",
            size: 0,
          },
          read: false,
        });

        // Broadcast to the chat room
        io.to(chatId).emit("receive_message", newMessage);

        // Notify recipient's personal room
        io.to(`${recipientRole}_${resolvedRecipientId}`).emit("new_message_alert", newMessage);

        if (callback) callback({ success: true, message: newMessage });
      } catch (err) {
        console.error("Error in socket send_message:", err);
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // Typing status
    socket.on("typing", ({ chatId, isTyping, userName }) => {
      if (chatId) {
        socket.to(chatId).emit("user_typing", {
          chatId,
          userId,
          userName: userName || (role === "doctor" ? "Doctor" : "Patient"),
          isTyping,
        });
      }
    });

    // Mark messages as read
    socket.on("mark_read", async ({ chatId }) => {
      try {
        if (chatId) {
          await messageModel.updateMany(
            { chatId, recipientId: userId, read: false },
            { $set: { read: true } }
          );
          io.to(chatId).emit("messages_read", { chatId, readBy: userId });
        }
      } catch (err) {
        console.error("Error in socket mark_read:", err);
      }
    });

    socket.on("disconnect", () => {
      // Clean disconnect
    });
  });
};
