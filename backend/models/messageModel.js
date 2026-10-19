import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: { type: String, required: true, index: true }, // Format: `${userId}_${docId}`
    userId: { type: String, required: true, index: true },
    docId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderRole: { type: String, enum: ["user", "doctor"], required: true },
    recipientId: { type: String, required: true },
    recipientRole: { type: String, enum: ["user", "doctor"], required: true },
    text: { type: String, default: "" },
    attachment: {
      url: { type: String, default: "" },
      name: { type: String, default: "" },
      fileType: { type: String, default: "" },
      size: { type: Number, default: 0 },
    },
    read: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now,
      // 7 days in seconds: 7 * 24 * 60 * 60 = 604800 seconds
      // MongoDB TTL Index automatically deletes documents after 7 days
      expires: 604800,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for optimal chronological message retrieval within a chat room
messageSchema.index({ chatId: 1, createdAt: 1 });
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ docId: 1, createdAt: -1 });

const messageModel =
  mongoose.models.message || mongoose.model("message", messageSchema);

export default messageModel;
