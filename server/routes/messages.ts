import { RequestHandler } from "express";
import { connectDB } from "../lib/mongodb";
import Message from "../models/Message";
import Chat from "../models/Chat";

interface MessageType {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "voice" | "video" | "sticker" | "gif";
  timestamp: Date;
  isRead: boolean;
  reactions?: Array<{
    emoji: string;
    userId: string;
  }>;
  replyTo?: string;
  isForwarded?: boolean;
  isDisappearing?: boolean;
  metadata?: any; // For voice duration, image URLs, etc.
}

interface ChatType {
  id: string;
  participants: string[];
  type: "direct" | "group" | "ai";
  name?: string;
  avatar?: string;
  lastMessage?: MessageType;
  updatedAt: Date;
  isArchived: boolean;
  isPinned: boolean;
}

// Initialize MongoDB connection
connectDB();

// Store active typing users (in-memory for real-time features)
let typingUsers: { [chatId: string]: { [userId: string]: Date } } = {};

// Helper function to initialize default chats if they don't exist
const initializeDefaultChats = async () => {
  try {
    const existingChats = await Chat.countDocuments();
    if (existingChats === 0) {
      // Create AI chat
      const aiChat = new Chat({
        _id: "ai-chat",
        participants: ["user", "ai"],
        type: "ai",
        name: "AI Assistant",
        avatar: "/placeholder.svg",
        isArchived: false,
        isPinned: true,
      });
      await aiChat.save();

      // Create demo chat
      const demoChat = new Chat({
        _id: "chat-1",
        participants: ["user", "priya"],
        type: "direct",
        name: "Priya Sharma",
        avatar: "/placeholder.svg",
        isArchived: false,
        isPinned: false,
      });
      await demoChat.save();

      // Create initial messages
      const aiMessage = new Message({
        chatId: "ai-chat",
        senderId: "ai",
        content:
          "Hi! I'm your AI music assistant. I can help you discover new music, create playlists, and chat about anything music-related! What would you like to know?",
        type: "text",
        isRead: false,
      });
      await aiMessage.save();

      const demoMessage = new Message({
        chatId: "chat-1",
        senderId: "priya",
        content: "Hey! Did you listen to that new track?",
        type: "text",
        isRead: false,
      });
      await demoMessage.save();

      // Update chats with last messages
      await Chat.findByIdAndUpdate("ai-chat", { lastMessage: aiMessage._id });
      await Chat.findByIdAndUpdate("chat-1", { lastMessage: demoMessage._id });

      console.log("✅ Default chats and messages initialized");
    }
  } catch (error) {
    console.error("Error initializing default chats:", error);
  }
};

// Initialize default data
initializeDefaultChats();

// GET /api/messages/chats/:userId? - Get all chats for a user
export const getChats: RequestHandler = async (req, res) => {
  try {
    await connectDB();

    const userId = req.params.userId || "user"; // Default to "user" for demo

    const chats = await Chat.find({
      participants: userId,
    })
      .populate("lastMessage")
      .sort({ updated_at: -1 });

    const formattedChats = chats.map((chat) => ({
      id: chat._id.toString(),
      participants: chat.participants,
      type: chat.type,
      name: chat.name,
      avatar: chat.avatar,
      lastMessage: chat.lastMessage
        ? {
            id: chat.lastMessage._id.toString(),
            chatId: chat.lastMessage.chatId,
            senderId: chat.lastMessage.senderId,
            content: chat.lastMessage.content,
            type: chat.lastMessage.type,
            timestamp: chat.lastMessage.timestamp,
            isRead: chat.lastMessage.isRead,
            reactions: chat.lastMessage.reactions,
            replyTo: chat.lastMessage.replyTo,
            isForwarded: chat.lastMessage.isForwarded,
            isDisappearing: chat.lastMessage.isDisappearing,
            metadata: chat.lastMessage.metadata,
          }
        : undefined,
      updatedAt: chat.updated_at,
      isArchived: chat.isArchived,
      isPinned: chat.isPinned,
    }));

    res.json({
      success: true,
      data: formattedChats,
    });
  } catch (error) {
    console.error("Error getting chats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get chats",
    });
  }
};

// GET /api/messages/:chatId - Get messages for a specific chat
export const getChatMessages: RequestHandler = async (req, res) => {
  try {
    await connectDB();

    const chatId = req.params.chatId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await Message.find({ chatId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset);

    const formattedMessages = messages.reverse().map((msg) => ({
      id: msg._id.toString(),
      chatId: msg.chatId,
      senderId: msg.senderId,
      content: msg.content,
      type: msg.type,
      timestamp: msg.timestamp,
      isRead: msg.isRead,
      reactions: msg.reactions,
      replyTo: msg.replyTo,
      isForwarded: msg.isForwarded,
      isDisappearing: msg.isDisappearing,
      metadata: msg.metadata,
    }));

    res.json({
      success: true,
      data: formattedMessages,
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get messages",
    });
  }
};

// POST /api/messages/:chatId - Send a new message
export const sendMessage: RequestHandler = async (req, res) => {
  try {
    await connectDB();

    const chatId = req.params.chatId;
    const { senderId, content, type = "text", replyTo, metadata } = req.body;

    if (!senderId || !content) {
      return res.status(400).json({
        success: false,
        message: "Sender ID and content are required",
      });
    }

    // Check if chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Create new message
    const newMessage = new Message({
      chatId,
      senderId,
      content,
      type,
      replyTo,
      metadata,
      isRead: false,
    });

    await newMessage.save();

    // Update chat's last message and updated_at
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: newMessage._id,
      updated_at: new Date(),
    });

    // Handle AI response for AI chats
    if (chat.type === "ai" && senderId !== "ai") {
      setTimeout(
        async () => {
          try {
            const aiResponse = new Message({
              chatId,
              senderId: "ai",
              content: generateAIResponse(content),
              type: "text",
              isRead: false,
            });

            await aiResponse.save();
            await Chat.findByIdAndUpdate(chatId, {
              lastMessage: aiResponse._id,
              updated_at: new Date(),
            });
          } catch (error) {
            console.error("Error sending AI response:", error);
          }
        },
        1000 + Math.random() * 2000,
      ); // 1-3 second delay
    }

    const responseMessage = {
      id: newMessage._id.toString(),
      chatId: newMessage.chatId,
      senderId: newMessage.senderId,
      content: newMessage.content,
      type: newMessage.type,
      timestamp: newMessage.timestamp,
      isRead: newMessage.isRead,
      reactions: newMessage.reactions,
      replyTo: newMessage.replyTo,
      isForwarded: newMessage.isForwarded,
      isDisappearing: newMessage.isDisappearing,
      metadata: newMessage.metadata,
    };

    res.json({
      success: true,
      data: responseMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

// PUT /api/messages/:chatId/read - Mark messages as read
export const markAsRead: RequestHandler = async (req, res) => {
  try {
    await connectDB();

    const chatId = req.params.chatId;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Mark all messages in the chat as read for messages not sent by the user
    await Message.updateMany(
      {
        chatId,
        senderId: { $ne: userId },
        isRead: false,
      },
      { isRead: true },
    );

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
};

// POST /api/messages/reaction/:messageId - Add reaction to message
export const addReaction: RequestHandler = async (req, res) => {
  try {
    await connectDB();

    const messageId = req.params.messageId;
    const { userId, emoji } = req.body;

    if (!userId || !emoji) {
      return res.status(400).json({
        success: false,
        message: "User ID and emoji are required",
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user already reacted with this emoji
    const existingReactionIndex =
      message.reactions?.findIndex(
        (r) => r.userId === userId && r.emoji === emoji,
      ) ?? -1;

    if (existingReactionIndex >= 0) {
      // Remove existing reaction
      message.reactions?.splice(existingReactionIndex, 1);
    } else {
      // Add new reaction
      if (!message.reactions) message.reactions = [];
      message.reactions.push({ emoji, userId });
    }

    await message.save();

    res.json({
      success: true,
      data: {
        reactions: message.reactions,
      },
    });
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add reaction",
    });
  }
};

// POST /api/messages/:chatId/typing - Set typing status
export const setTyping: RequestHandler = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { userId, isTyping } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!typingUsers[chatId]) {
      typingUsers[chatId] = {};
    }

    if (isTyping) {
      typingUsers[chatId][userId] = new Date();
    } else {
      delete typingUsers[chatId][userId];
    }

    // Auto-remove typing status after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        if (typingUsers[chatId] && typingUsers[chatId][userId]) {
          delete typingUsers[chatId][userId];
        }
      }, 3000);
    }

    res.json({
      success: true,
      message: "Typing status updated",
    });
  } catch (error) {
    console.error("Error setting typing status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set typing status",
    });
  }
};

// GET /api/messages/:chatId/typing - Get typing users
export const getTypingUsers: RequestHandler = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const currentTime = new Date();

    // Clean up old typing statuses (older than 5 seconds)
    if (typingUsers[chatId]) {
      Object.keys(typingUsers[chatId]).forEach((userId) => {
        const typingTime = typingUsers[chatId][userId];
        if (currentTime.getTime() - typingTime.getTime() > 5000) {
          delete typingUsers[chatId][userId];
        }
      });
    }

    const activeTypingUsers = typingUsers[chatId]
      ? Object.keys(typingUsers[chatId])
      : [];

    res.json({
      success: true,
      data: activeTypingUsers,
    });
  } catch (error) {
    console.error("Error getting typing users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get typing users",
    });
  }
};

// POST /api/messages/chats - Create a new chat
export const createChat: RequestHandler = async (req, res) => {
  try {
    await connectDB();

    const { participants, type = "direct", name, avatar } = req.body;

    if (!participants || participants.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 participants are required",
      });
    }

    // Check if direct chat already exists between these participants
    if (type === "direct" && participants.length === 2) {
      const existingChat = await Chat.findOne({
        type: "direct",
        participants: { $all: participants, $size: 2 },
      });

      if (existingChat) {
        return res.json({
          success: true,
          data: {
            id: existingChat._id.toString(),
            participants: existingChat.participants,
            type: existingChat.type,
            name: existingChat.name,
            avatar: existingChat.avatar,
            updatedAt: existingChat.updated_at,
            isArchived: existingChat.isArchived,
            isPinned: existingChat.isPinned,
          },
        });
      }
    }

    const newChat = new Chat({
      participants,
      type,
      name,
      avatar,
      isArchived: false,
      isPinned: false,
    });

    await newChat.save();

    res.json({
      success: true,
      data: {
        id: newChat._id.toString(),
        participants: newChat.participants,
        type: newChat.type,
        name: newChat.name,
        avatar: newChat.avatar,
        updatedAt: newChat.updated_at,
        isArchived: newChat.isArchived,
        isPinned: newChat.isPinned,
      },
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create chat",
    });
  }
};

// DELETE /api/messages/message/:messageId - Delete a message
export const deleteMessage: RequestHandler = async (req, res) => {
  try {
    await connectDB();

    const messageId = req.params.messageId;
    const { userId } = req.body;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only allow sender or admin to delete message
    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    await Message.findByIdAndDelete(messageId);

    // Update chat's last message if this was the last message
    const chat = await Chat.findById(message.chatId);
    if (chat && chat.lastMessage?.toString() === messageId) {
      const lastMessage = await Message.findOne({
        chatId: message.chatId,
      }).sort({ timestamp: -1 });

      await Chat.findByIdAndUpdate(message.chatId, {
        lastMessage: lastMessage?._id || null,
      });
    }

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
};

// Helper function to generate AI responses
function generateAIResponse(userMessage: string): string {
  const responses = [
    "That's a great question! I'd love to help you with that.",
    "Interesting! Let me think about that for a moment...",
    "I totally understand what you mean. Music has that effect on people!",
    "Have you tried exploring similar artists? I can recommend some!",
    "That's one of my favorite topics! Music discovery is so exciting.",
    "I can help you create a playlist for that mood if you'd like!",
    "That reminds me of a few songs that might interest you.",
    "Music taste is so personal - I love hearing about what people enjoy!",
    "That's a really cool perspective on music!",
    "I'm here whenever you want to chat about music or anything else!",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
