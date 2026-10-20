import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import {
  MessageSquare,
  Send,
  Paperclip,
  FileText,
  File,
  X,
  Search,
  Clock,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  Check,
  CheckCheck,
  ExternalLink,
  PlusCircle,
  UserCheck,
} from "lucide-react";

const DoctorChat = () => {
  const { docId: paramDocId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, token, userData, doctors } = useContext(AppContext);

  // States
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [mobileView, setMobileView] = useState("list"); // 'list' | 'chat'

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, partnerTyping]);

  // Initialize Socket.io connection when token is available
  useEffect(() => {
    if (!token) return;

    const socket = io(backendUrl, {
      auth: { token, role: "user" },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // Socket connected
    });

    socket.on("receive_message", (message) => {
      // If message belongs to active chat, append it
      setActiveChatId((currentChatId) => {
        if (currentChatId === message.chatId) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === message._id)) return prev;
            return [...prev, message];
          });
          // Mark as read immediately
          socket.emit("mark_read", { chatId: message.chatId });
        }
        return currentChatId;
      });

      // Refresh conversations to update last message preview and unread counts
      fetchConversations();
    });

    socket.on("user_typing", (data) => {
      setActiveChatId((currentChatId) => {
        if (currentChatId === data.chatId) {
          setPartnerTyping(data.isTyping);
        }
        return currentChatId;
      });
    });

    socket.on("messages_read", (data) => {
      setActiveChatId((currentChatId) => {
        if (currentChatId === data.chatId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.senderRole === "user" ? { ...msg, read: true } : msg
            )
          );
        }
        return currentChatId;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token, backendUrl]);

  // Fetch conversations list
  const fetchConversations = async (targetDocId = null) => {
    if (!token) return;
    try {
      const url = targetDocId
        ? `${backendUrl}/api/p2d-chat/conversations?docId=${targetDocId}`
        : `${backendUrl}/api/p2d-chat/conversations`;

      const { data } = await axios.get(url, {
        headers: { token },
      });

      if (data.success) {
        setConversations(data.conversations);

        // If target doctor was specified and we need to activate it
        if (targetDocId) {
          const matched = data.conversations.find(
            (c) => c.partner?._id === targetDocId
          );
          if (matched) {
            selectConversation(matched);
          } else {
            // Find doctor in main doctors list and create a draft conversation
            const docObj = doctors.find((d) => d._id === targetDocId);
            if (docObj && userData?._id) {
              const draftChat = {
                chatId: `${userData._id}_${docObj._id}`,
                partner: {
                  _id: docObj._id,
                  name: docObj.name,
                  image: docObj.image,
                  speciality: docObj.speciality,
                  degree: docObj.degree,
                  available: docObj.available,
                  fees: docObj.fees,
                  role: "doctor",
                },
                lastMessage: null,
                unreadCount: 0,
              };
              selectConversation(draftChat);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchConversations(paramDocId);
    }
  }, [token, paramDocId, doctors, userData]);

  // Select and load a conversation
  const selectConversation = async (conv) => {
    setActiveChatId(conv.chatId);
    setActiveDoctor(conv.partner);
    setMobileView("chat");
    setPartnerTyping(false);

    // Join room on socket
    if (socketRef.current) {
      socketRef.current.emit("join_chat", { chatId: conv.chatId });
      socketRef.current.emit("mark_read", { chatId: conv.chatId });
    }

    // Load message history
    try {
      setLoadingMessages(true);
      const { data } = await axios.get(
        `${backendUrl}/api/p2d-chat/messages/${conv.chatId}`,
        { headers: { token } }
      );

      if (data.success) {
        setMessages(data.messages);
        if (data.partner) {
          setActiveDoctor(data.partner);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Handle typing notification
  const handleTyping = (e) => {
    setInputText(e.target.value);

    if (socketRef.current && activeChatId) {
      socketRef.current.emit("typing", {
        chatId: activeChatId,
        isTyping: true,
        userName: userData?.name || "Patient",
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && activeChatId) {
          socketRef.current.emit("typing", {
            chatId: activeChatId,
            isTyping: false,
          });
        }
      }, 1500);
    }
  };

  // Handle file selection (report, PDF, image)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size cannot exceed 20MB");
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Send message with optional attachment
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;
    if (!activeChatId || !activeDoctor) return;

    setSending(true);

    try {
      let attachmentData = null;

      // 1. Upload attachment first if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await axios.post(
          `${backendUrl}/api/p2d-chat/upload`,
          formData,
          {
            headers: {
              token,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (uploadRes.data.success) {
          attachmentData = uploadRes.data.attachment;
        } else {
          toast.error("Failed to upload report: " + uploadRes.data.message);
          setSending(false);
          return;
        }
      }

      // 2. Send message payload via REST API (also triggers real-time socket emit)
      const payload = {
        chatId: activeChatId,
        recipientId: activeDoctor._id,
        text: inputText.trim(),
        attachment: attachmentData,
      };

      const { data } = await axios.post(
        `${backendUrl}/api/p2d-chat/send`,
        payload,
        { headers: { token } }
      );

      if (data.success) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
        setInputText("");
        clearSelectedFile();
        fetchConversations();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Format date header or message timestamp
  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateLabel = (dateString) => {
    const d = new Date(dateString);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const name = c.partner?.name?.toLowerCase() || "";
    const spec = c.partner?.speciality?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return name.includes(q) || spec.includes(q);
  });

  // If user is not logged in:
  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Patient-Doctor Direct Chat
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Connect directly with your doctors in real time, discuss medical
            questions, and securely share reports and prescriptions. Please sign in
            to your Medicare account to continue.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition shadow-sm"
            >
              Sign In to Chat
            </button>
            <button
              onClick={() => navigate("/doctors")}
              className="w-full bg-gray-50 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-100 transition border border-gray-200"
            >
              Browse All Doctors
            </button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            <span>Private & confidential • 7-day auto-retention</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Page Title & Privacy Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Doctor Consultations
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real-time one-to-one discussions with your doctors and specialist physicians.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-xl">
          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Chats and shared medical reports automatically expire in 7 days for privacy.</span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-[78vh] flex">
        {/* Left Sidebar: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-gray-50/50 ${
            mobileView === "chat" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search & New Chat Bar */}
          <div className="p-4 border-b border-gray-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800 text-sm">
                Active Chats ({conversations.length})
              </span>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white transition px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Chat
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors or specialities..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition"
              />
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">No conversations yet</p>
                <p className="text-xs mt-1">
                  Start a new consultation or message a doctor you have booked with.
                </p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="mt-4 text-xs bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition"
                >
                  Choose a Doctor
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeChatId === conv.chatId;
                const partner = conv.partner;
                return (
                  <div
                    key={conv.chatId}
                    onClick={() => selectConversation(conv)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition relative ${
                      isSelected
                        ? "bg-primary/5 border-l-4 border-primary"
                        : "hover:bg-gray-100/70"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={partner?.image || "/src/assets/profile_pic.png"}
                        alt={partner?.name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 bg-gray-100"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://res.cloudinary.com/dzt092f9o/image/upload/v1792113460/user_profiles/o5w4367oe6xropok6ozq.png";
                        }}
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          partner?.available !== false
                            ? "bg-emerald-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {partner?.name}
                        </p>
                        {conv.lastMessage && (
                          <span className="text-[11px] text-gray-400 flex-shrink-0 ml-1">
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-primary font-medium truncate mb-1">
                        {partner?.speciality}
                      </p>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        {conv.lastMessage?.hasAttachment && (
                          <Paperclip className="w-3 h-3 text-primary flex-shrink-0" />
                        )}
                        {conv.lastMessage?.text ||
                          (conv.lastMessage?.hasAttachment
                            ? "Shared report"
                            : "Click to start discussion")}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Window */}
        <div
          className={`flex-1 flex flex-col bg-white ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          {activeChatId && activeDoctor ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 sm:px-6 border-b border-gray-200 flex items-center justify-between bg-white z-10 shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileView("list")}
                    className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    <img
                      src={activeDoctor.image || "/src/assets/profile_pic.png"}
                      alt={activeDoctor.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-100"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://res.cloudinary.com/dzt092f9o/image/upload/v1792113460/user_profiles/o5w4367oe6xropok6ozq.png";
                      }}
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        activeDoctor.available !== false
                          ? "bg-emerald-500"
                          : "bg-gray-400"
                      }`}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">
                      {activeDoctor.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="text-primary font-medium">
                        {activeDoctor.speciality}
                      </span>
                      <span>•</span>
                      <span>{activeDoctor.degree || "Doctor"}</span>
                    </div>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/appointment/${activeDoctor._id}`)}
                    className="hidden sm:flex items-center gap-1.5 text-xs bg-gray-50 hover:bg-primary hover:text-white text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 transition font-medium"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book Slot
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F8F9FD]/60">
                {/* 7-Day Notice card inside message list */}
                <div className="max-w-md mx-auto bg-amber-50/80 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Confidential Medical Consultation</span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    All conversation history and shared lab reports / prescriptions are automatically deleted after 7 days.
                  </p>
                </div>

                {loadingMessages ? (
                  <div className="py-20 text-center">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Loading consultation history...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center max-w-sm mx-auto text-gray-400">
                    <MessageSquare className="w-12 h-12 text-primary/30 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-gray-700">
                      Start your discussion with {activeDoctor.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      You can describe your symptoms, ask follow-up questions, and attach lab reports, prescriptions, or documents.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.senderRole === "user";
                    const showDateLabel =
                      index === 0 ||
                      formatDateLabel(messages[index - 1].createdAt) !==
                        formatDateLabel(msg.createdAt);

                    return (
                      <React.Fragment key={msg._id || index}>
                        {showDateLabel && (
                          <div className="flex items-center justify-center my-3">
                            <span className="bg-gray-200 text-gray-600 text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                              {formatDateLabel(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex items-end gap-2 ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isMe && (
                            <img
                              src={activeDoctor.image || "/src/assets/profile_pic.png"}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover border border-gray-200 bg-gray-100 flex-shrink-0 mb-1"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://res.cloudinary.com/dzt092f9o/image/upload/v1792113460/user_profiles/o5w4367oe6xropok6ozq.png";
                              }}
                            />
                          )}

                          <div
                            className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 shadow-xs ${
                              isMe
                                ? "bg-primary text-white rounded-br-xs"
                                : "bg-white text-gray-800 border border-gray-200 rounded-bl-xs"
                            }`}
                          >
                            {/* Attachment rendering */}
                            {msg.attachment?.url && (
                              <div className="mb-2">
                                {msg.attachment.fileType?.startsWith("image/") ? (
                                  <a
                                    href={msg.attachment.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block overflow-hidden rounded-xl border border-black/10 hover:opacity-95 transition"
                                  >
                                    <img
                                      src={msg.attachment.url}
                                      alt={msg.attachment.name || "Attachment"}
                                      className="max-h-60 w-full object-cover rounded-xl"
                                    />
                                    <p className="text-[11px] mt-1 truncate px-1 opacity-80">
                                      {msg.attachment.name}
                                    </p>
                                  </a>
                                ) : (
                                  <a
                                    href={msg.attachment.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex items-center gap-3 p-2.5 rounded-xl transition ${
                                      isMe
                                        ? "bg-white/15 hover:bg-white/20 text-white"
                                        : "bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200"
                                    }`}
                                  >
                                    <div
                                      className={`p-2 rounded-lg flex-shrink-0 ${
                                        isMe ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                                      }`}
                                    >
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">
                                        {msg.attachment.name || "Medical Report"}
                                      </p>
                                      <p className="text-[10px] opacity-75">
                                        {formatFileSize(msg.attachment.size)} • Click to open
                                      </p>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 opacity-75 flex-shrink-0" />
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Message Text */}
                            {msg.text && (
                              <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
                                {msg.text}
                              </p>
                            )}

                            {/* Timestamp & Read Receipt */}
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                isMe ? "text-white/75" : "text-gray-400"
                              }`}
                            >
                              <span>{formatTime(msg.createdAt)}</span>
                              {isMe &&
                                (msg.read ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-200" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-white/60" />
                                ))}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}

                {/* Typing Indicator */}
                {partnerTyping && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                    <img
                      src={activeDoctor.image || "/src/assets/profile_pic.png"}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>{activeDoctor.name} is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
                {/* File Preview Banner before sending */}
                {selectedFile && (
                  <div className="mb-2 p-2 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="preview"
                          className="w-10 h-10 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearSelectedFile}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  {/* File Upload Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach Medical Report / Document (PDF, Images)"
                    className="p-2.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-xl transition cursor-pointer"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  {/* Input field */}
                  <input
                    type="text"
                    value={inputText}
                    onChange={handleTyping}
                    placeholder="Type your message or discuss medical query..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={sending || (!inputText.trim() && !selectedFile)}
                    className="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center flex-shrink-0"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            // No Active Chat Selected
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Select a doctor to start consultation
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Discuss test reports, symptoms, medication clarifications, or follow-ups with your doctors.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-5 bg-primary text-white text-sm px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition shadow-sm"
              >
                Start New Consultation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Consultation Doctor Picker Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Select Doctor</h3>
                <p className="text-xs text-gray-500">
                  Choose a specialist to start a private 1-to-1 consultation
                </p>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search by doctor name or speciality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
              {doctors
                .filter((d) => {
                  const q = searchQuery.toLowerCase();
                  return (
                    d.name.toLowerCase().includes(q) ||
                    d.speciality.toLowerCase().includes(q)
                  );
                })
                .map((doc) => (
                  <div
                    key={doc._id}
                    onClick={() => {
                      setShowNewChatModal(false);
                      if (userData?._id) {
                        const newChat = {
                          chatId: `${userData._id}_${doc._id}`,
                          partner: {
                            _id: doc._id,
                            name: doc.name,
                            image: doc.image,
                            speciality: doc.speciality,
                            degree: doc.degree,
                            available: doc.available,
                            fees: doc.fees,
                            role: "doctor",
                          },
                          lastMessage: null,
                          unreadCount: 0,
                        };
                        selectConversation(newChat);
                      }
                    }}
                    className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer flex items-center gap-3 transition"
                  >
                    <img
                      src={doc.image || "/src/assets/profile_pic.png"}
                      alt={doc.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-primary">{doc.speciality}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-400">
                      Consult →
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorChat;
