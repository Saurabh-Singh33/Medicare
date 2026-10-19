import express from "express";
import authChat from "../middlewares/authChat.js";
import upload from "../middlewares/multer.js";
import {
  getConversations,
  getMessages,
  sendMessage,
  uploadAttachment,
  markRead,
} from "../controllers/p2dChatController.js";

const p2dChatRouter = express.Router();

// All chat endpoints require either patient 'token' or doctor 'dtoken'
p2dChatRouter.get("/conversations", authChat, getConversations);
p2dChatRouter.get("/messages/:chatId", authChat, getMessages);
p2dChatRouter.post("/send", authChat, sendMessage);
p2dChatRouter.post("/upload", authChat, upload.single("file"), uploadAttachment);
p2dChatRouter.post("/mark-read", authChat, markRead);

export default p2dChatRouter;
