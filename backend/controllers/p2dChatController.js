import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import messageModel from "../models/messageModel.js";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";

// Helper to calculate 7 days ago cutoff
const get7DaysCutoff = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

// Get conversations list for logged-in user or doctor
export const getConversations = async (req, res) => {
  try {
    const { id: requesterId, role } = req.auth;
    const cutoff = get7DaysCutoff();

    if (role === "user") {
      const userId = requesterId;

      // 1. Get all doctors from recent messages within 7 days
      const recentDoctorIds = await messageModel.distinct("docId", {
        userId,
        createdAt: { $gte: cutoff },
      });

      // 2. Also get doctors from appointments for this user
      const userAppointments = await appointmentModel.find({ userId }).select("docId docData");
      const appointmentDoctorIds = userAppointments.map((a) => String(a.docId));

      // 3. Optional direct query parameter for opening a chat with a specific doctor
      const directDocId = req.query.docId ? String(req.query.docId) : null;

      // Combine and deduplicate
      const allDocIdsSet = new Set([
        ...recentDoctorIds.map(String),
        ...appointmentDoctorIds,
        ...(directDocId ? [directDocId] : []),
      ]);
      const docIds = Array.from(allDocIdsSet);

      // Fetch doctor details
      const doctors = await doctorModel
        .find({ _id: { $in: docIds } })
        .select("_id name email image speciality degree experience about available fees address");

      // For each doctor, calculate latest message and unread count
      const conversations = await Promise.all(
        doctors.map(async (doc) => {
          const chatId = `${userId}_${doc._id}`;
          const lastMsg = await messageModel
            .findOne({ chatId, createdAt: { $gte: cutoff } })
            .sort({ createdAt: -1 });

          const unreadCount = await messageModel.countDocuments({
            chatId,
            recipientId: userId,
            read: false,
            createdAt: { $gte: cutoff },
          });

          return {
            chatId,
            partner: {
              _id: doc._id,
              name: doc.name,
              email: doc.email,
              image: doc.image,
              speciality: doc.speciality,
              degree: doc.degree,
              experience: doc.experience,
              about: doc.about,
              available: doc.available,
              fees: doc.fees,
              role: "doctor",
            },
            lastMessage: lastMsg
              ? {
                  text: lastMsg.text,
                  hasAttachment: Boolean(lastMsg.attachment && lastMsg.attachment.url),
                  attachmentName: lastMsg.attachment?.name || "",
                  senderRole: lastMsg.senderRole,
                  createdAt: lastMsg.createdAt,
                }
              : null,
            unreadCount,
            lastActivity: lastMsg ? lastMsg.createdAt : new Date(0),
          };
        })
      );

      // Sort by recent activity
      conversations.sort(
        (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );

      return res.json({ success: true, conversations });
    } else {
      // Role is doctor
      const docId = requesterId;

      // 1. Get all patients from recent messages
      const recentUserIds = await messageModel.distinct("userId", {
        docId,
        createdAt: { $gte: cutoff },
      });

      // 2. Also get patients from appointments for this doctor
      const doctorAppointments = await appointmentModel.find({ docId }).select("userId userData");
      const appointmentUserIds = doctorAppointments.map((a) => String(a.userId));

      // 3. Optional direct query parameter for opening a chat with a specific patient
      const directUserId = req.query.userId ? String(req.query.userId) : null;

      // Combine and deduplicate
      const allUserIdsSet = new Set([
        ...recentUserIds.map(String),
        ...appointmentUserIds,
        ...(directUserId ? [directUserId] : []),
      ]);
      const userIds = Array.from(allUserIdsSet);

      // Fetch user details
      const users = await userModel
        .find({ _id: { $in: userIds } })
        .select("_id name email phone image Image gender dob address");

      const conversations = await Promise.all(
        users.map(async (user) => {
          const chatId = `${user._id}_${docId}`;
          const lastMsg = await messageModel
            .findOne({ chatId, createdAt: { $gte: cutoff } })
            .sort({ createdAt: -1 });

          const unreadCount = await messageModel.countDocuments({
            chatId,
            recipientId: docId,
            read: false,
            createdAt: { $gte: cutoff },
          });

          return {
            chatId,
            partner: {
              _id: user._id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              image: user.image || user.Image,
              gender: user.gender,
              dob: user.dob,
              role: "user",
            },
            lastMessage: lastMsg
              ? {
                  text: lastMsg.text,
                  hasAttachment: Boolean(lastMsg.attachment && lastMsg.attachment.url),
                  attachmentName: lastMsg.attachment?.name || "",
                  senderRole: lastMsg.senderRole,
                  createdAt: lastMsg.createdAt,
                }
              : null,
            unreadCount,
            lastActivity: lastMsg ? lastMsg.createdAt : new Date(0),
          };
        })
      );

      // Sort by recent activity
      conversations.sort(
        (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );

      return res.json({ success: true, conversations });
    }
  } catch (error) {
    console.error("Error in getConversations:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages for a specific 1-to-1 chat room
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { id: requesterId, role } = req.auth;

    if (!chatId || !chatId.includes("_")) {
      return res.status(400).json({ success: false, message: "Invalid chat ID" });
    }

    const [userId, docId] = chatId.split("_");

    // Security: requester must be either the user or the doctor in this chat
    if (requesterId !== userId && requesterId !== docId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this private chat.",
      });
    }

    const cutoff = get7DaysCutoff();

    // Fetch messages from within 7 days
    const messages = await messageModel
      .find({
        chatId,
        createdAt: { $gte: cutoff },
      })
      .sort({ createdAt: 1 });

    // Mark unread messages sent to the requester as read
    await messageModel.updateMany(
      {
        chatId,
        recipientId: requesterId,
        read: false,
      },
      { $set: { read: true } }
    );

    // Fetch partner details
    let partnerInfo = null;
    if (role === "user") {
      const doc = await doctorModel
        .findById(docId)
        .select("_id name email image speciality degree experience about available fees address");
      if (doc) {
        partnerInfo = {
          _id: doc._id,
          name: doc.name,
          email: doc.email,
          image: doc.image,
          speciality: doc.speciality,
          degree: doc.degree,
          experience: doc.experience,
          about: doc.about,
          available: doc.available,
          fees: doc.fees,
          role: "doctor",
        };
      }
    } else {
      const user = await userModel
        .findById(userId)
        .select("_id name email phone image Image gender dob address");
      if (user) {
        partnerInfo = {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          image: user.image || user.Image,
          gender: user.gender,
          dob: user.dob,
          role: "user",
        };
      }
    }

    return res.json({
      success: true,
      messages,
      partner: partnerInfo,
      autoDeleteNotice: "Messages in this consultation automatically expire after 7 days.",
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Send message (Text and/or Attachment)
export const sendMessage = async (req, res) => {
  try {
    const { id: senderId, role: senderRole } = req.auth;
    const { chatId, recipientId, text, attachment } = req.body;

    if (!chatId || !chatId.includes("_")) {
      return res.status(400).json({ success: false, message: "Valid chatId is required" });
    }

    const [userId, docId] = chatId.split("_");

    // Verify sender belongs to this chat
    if (senderId !== userId && senderId !== docId) {
      return res.status(403).json({ success: false, message: "Unauthorized for this chat" });
    }

    if (!text && (!attachment || !attachment.url)) {
      return res.status(400).json({
        success: false,
        message: "Message text or attachment is required",
      });
    }

    const recipientRole = senderRole === "user" ? "doctor" : "user";
    const resolvedRecipientId = recipientId || (senderRole === "user" ? docId : userId);

    const newMessage = await messageModel.create({
      chatId,
      userId,
      docId,
      senderId,
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

    // Real-time broadcast if socket.io is mounted
    if (req.io) {
      req.io.to(chatId).emit("receive_message", newMessage);
      req.io.to(`user_${resolvedRecipientId}`).emit("new_message_alert", newMessage);
      req.io.to(`doctor_${resolvedRecipientId}`).emit("new_message_alert", newMessage);
    }

    return res.json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Upload attachment (Medical Report, Letter, PDF, Image) to Cloudinary
export const uploadAttachment = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Determine resource type: images as 'image', others as 'auto' or 'raw'
    const isImage = file.mimetype.startsWith("image/");
    const uploadOptions = {
      resource_type: isImage ? "image" : "auto",
      folder: "medicare_chat_attachments",
      public_id: `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
    };

    const uploadResponse = await cloudinary.uploader.upload(file.path, uploadOptions);

    // Clean up local temporary file
    fs.unlink(file.path, (err) => {
      if (err) console.error("Error removing temp file:", err);
    });

    return res.json({
      success: true,
      attachment: {
        url: uploadResponse.secure_url,
        name: file.originalname,
        fileType: file.mimetype,
        size: file.size,
      },
    });
  } catch (error) {
    console.error("Error in uploadAttachment:", error);
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    return res.status(500).json({
      success: false,
      message: "File upload failed: " + error.message,
    });
  }
};

// Mark messages as read
export const markRead = async (req, res) => {
  try {
    const { chatId } = req.body;
    const { id: requesterId } = req.auth;

    if (!chatId) {
      return res.status(400).json({ success: false, message: "chatId is required" });
    }

    await messageModel.updateMany(
      {
        chatId,
        recipientId: requesterId,
        read: false,
      },
      { $set: { read: true } }
    );

    if (req.io) {
      req.io.to(chatId).emit("messages_read", { chatId, readBy: requesterId });
    }

    return res.json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    console.error("Error in markRead:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
