import { RequestHandler } from "express";

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'video' | 'sticker' | 'gif';
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

interface Chat {
  id: string;
  participants: string[];
  type: 'direct' | 'group' | 'ai';
  name?: string;
  avatar?: string;
  lastMessage?: Message;
  updatedAt: Date;
  isArchived: boolean;
  isPinned: boolean;
}

// In-memory storage for demo (replace with real database)
let chats: Chat[] = [
  {
    id: "ai-chat",
    participants: ["user", "ai"],
    type: 'ai',
    name: "AI Assistant",
    avatar: "/placeholder.svg",
    updatedAt: new Date(),
    isArchived: false,
    isPinned: true,
  },
  {
    id: "chat-1",
    participants: ["user", "priya"],
    type: 'direct',
    name: "Priya Sharma",
    avatar: "/placeholder.svg",
    updatedAt: new Date(),
    isArchived: false,
    isPinned: false,
  },
];

let messages: Message[] = [
  {
    id: "ai-1",
    chatId: "ai-chat",
    senderId: "ai",
    content: "Hi! I'm your AI music assistant. I can help you discover new music, create playlists, and chat about anything music-related! What would you like to know?",
    type: 'text',
    timestamp: new Date(),
    isRead: false,
  },
  {
    id: "msg-1",
    chatId: "chat-1",
    senderId: "priya",
    content: "Hey! Did you listen to that new track?",
    type: 'text',
    timestamp: new Date(),
    isRead: false,
  },
];

// Store active typing users
const typingUsers = new Map<string, Set<string>>();

// AI Response Generator
const generateAIResponse = (userMessage: string): string => {
  const responses = {
    greeting: [
      "Hello! How can I help you with music today?",
      "Hi there! Ready to discover some amazing music?",
      "Hey! What's on your musical mind today?",
    ],
    music: [
      "That's a great song! Have you heard similar tracks by other artists?",
      "Music is amazing! What genre are you into lately?",
      "I love discussing music! Tell me more about your favorite artists.",
    ],
    recommendation: [
      "Based on your taste, you might like some indie pop or alternative rock!",
      "I'd recommend checking out some Lo-fi hip hop or electronic ambient music.",
      "Have you tried exploring world music or jazz fusion?",
    ],
    general: [
      "That's interesting! Tell me more about it.",
      "I see! How does that relate to your music preferences?",
      "Fascinating! Music connects to so many aspects of life, doesn't it?",
    ],
    default: [
      "That's a great question! I'm here to help with anything music-related.",
      "Interesting! Let's talk more about this.",
      "I'd love to help you with that! Can you tell me more?",
    ]
  };

  const message = userMessage.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
  }
  
  if (message.includes('song') || message.includes('music') || message.includes('artist') || message.includes('album')) {
    return responses.music[Math.floor(Math.random() * responses.music.length)];
  }
  
  if (message.includes('recommend') || message.includes('suggest') || message.includes('playlist')) {
    return responses.recommendation[Math.floor(Math.random() * responses.recommendation.length)];
  }
  
  if (message.includes('how') || message.includes('what') || message.includes('why')) {
    return responses.general[Math.floor(Math.random() * responses.general.length)];
  }
  
  return responses.default[Math.floor(Math.random() * responses.default.length)];
};

// Get all chats for a user
export const getChats: RequestHandler = (req, res) => {
  try {
    const userId = req.params.userId || "user";
    
    // Add last message to each chat
    const chatsWithMessages = chats.map(chat => {
      const chatMessages = messages.filter(msg => msg.chatId === chat.id);
      const lastMessage = chatMessages.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      
      return {
        ...chat,
        lastMessage,
        unreadCount: chatMessages.filter(msg => !msg.isRead && msg.senderId !== userId).length,
      };
    });
    
    res.json({ chats: chatsWithMessages });
  } catch (error) {
    res.status(500).json({ error: "Failed to get chats" });
  }
};

// Get messages for a specific chat
export const getChatMessages: RequestHandler = (req, res) => {
  try {
    const { chatId } = req.params;
    const chatMessages = messages
      .filter(msg => msg.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    res.json({ messages: chatMessages });
  } catch (error) {
    res.status(500).json({ error: "Failed to get messages" });
  }
};

// Send a new message
export const sendMessage: RequestHandler = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, type = 'text', replyTo, metadata } = req.body;
    const senderId = req.body.senderId || "user";
    
    const newMessage: Message = {
      id: Date.now().toString(),
      chatId,
      senderId,
      content,
      type,
      timestamp: new Date(),
      isRead: false,
      replyTo,
      metadata,
    };
    
    messages.push(newMessage);
    
    // Update chat's last message and timestamp
    const chatIndex = chats.findIndex(chat => chat.id === chatId);
    if (chatIndex !== -1) {
      chats[chatIndex].lastMessage = newMessage;
      chats[chatIndex].updatedAt = new Date();
    }
    
    // Remove typing indicator
    const typingSet = typingUsers.get(chatId);
    if (typingSet) {
      typingSet.delete(senderId);
    }
    
    // Handle AI response
    if (chatId === "ai-chat" && senderId === "user") {
      setTimeout(() => {
        const aiResponse: Message = {
          id: Date.now().toString() + "-ai",
          chatId,
          senderId: "ai",
          content: generateAIResponse(content),
          type: 'text',
          timestamp: new Date(),
          isRead: false,
        };
        
        messages.push(aiResponse);
        
        // Update chat's last message
        const aiChatIndex = chats.findIndex(chat => chat.id === chatId);
        if (aiChatIndex !== -1) {
          chats[aiChatIndex].lastMessage = aiResponse;
          chats[aiChatIndex].updatedAt = new Date();
        }
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }
    
    res.json({ message: newMessage });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Mark messages as read
export const markAsRead: RequestHandler = (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.body.userId || "user";
    
    messages.forEach(msg => {
      if (msg.chatId === chatId && msg.senderId !== userId) {
        msg.isRead = true;
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
};

// Add reaction to message
export const addReaction: RequestHandler = (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji, userId = "user" } = req.body;
    
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    if (!messages[messageIndex].reactions) {
      messages[messageIndex].reactions = [];
    }
    
    // Remove existing reaction from this user
    messages[messageIndex].reactions = messages[messageIndex].reactions!.filter(
      reaction => reaction.userId !== userId
    );
    
    // Add new reaction
    messages[messageIndex].reactions!.push({ emoji, userId });
    
    res.json({ message: messages[messageIndex] });
  } catch (error) {
    res.status(500).json({ error: "Failed to add reaction" });
  }
};

// Set typing status
export const setTyping: RequestHandler = (req, res) => {
  try {
    const { chatId } = req.params;
    const { isTyping, userId = "user" } = req.body;
    
    if (!typingUsers.has(chatId)) {
      typingUsers.set(chatId, new Set());
    }
    
    const typingSet = typingUsers.get(chatId)!;
    
    if (isTyping) {
      typingSet.add(userId);
    } else {
      typingSet.delete(userId);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to set typing status" });
  }
};

// Get typing users for a chat
export const getTypingUsers: RequestHandler = (req, res) => {
  try {
    const { chatId } = req.params;
    const typingSet = typingUsers.get(chatId) || new Set();
    
    res.json({ typingUsers: Array.from(typingSet) });
  } catch (error) {
    res.status(500).json({ error: "Failed to get typing users" });
  }
};

// Create new chat
export const createChat: RequestHandler = (req, res) => {
  try {
    const { participants, type = 'direct', name, avatar } = req.body;
    
    const newChat: Chat = {
      id: Date.now().toString(),
      participants,
      type,
      name,
      avatar,
      updatedAt: new Date(),
      isArchived: false,
      isPinned: false,
    };
    
    chats.push(newChat);
    
    res.json({ chat: newChat });
  } catch (error) {
    res.status(500).json({ error: "Failed to create chat" });
  }
};

// Delete message
export const deleteMessage: RequestHandler = (req, res) => {
  try {
    const { messageId } = req.params;
    
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    messages.splice(messageIndex, 1);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
};
