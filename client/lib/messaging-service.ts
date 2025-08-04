import { useEffect, useState, useCallback } from "react";

export interface Message {
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
  metadata?: any;
}

export interface Chat {
  id: string;
  participants: string[];
  type: "direct" | "group" | "ai";
  name?: string;
  avatar?: string;
  lastMessage?: Message;
  updatedAt: Date;
  isArchived: boolean;
  isPinned: boolean;
  unreadCount?: number;
  isOnline?: boolean;
  isTyping?: boolean;
  isVerified?: boolean;
  lastSeen?: string;
  groupMembers?: number;
}

class MessagingService {
  private baseUrl = "/api/messages";
  private userId = "user"; // In real app, get from auth context
  private pollingInterval: NodeJS.Timeout | null = null;
  private listeners: Map<string, Function[]> = new Map();

  // Real-time polling for demo (replace with WebSocket in production)
  startPolling() {
    if (this.pollingInterval) return;

    this.pollingInterval = setInterval(async () => {
      try {
        // Poll for new messages and typing indicators
        this.emit("poll");
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000); // Poll every 2 seconds
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Event system for real-time updates
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  // API methods
  async getChats(): Promise<Chat[]> {
    try {
      const response = await fetch(`${this.baseUrl}/chats/${this.userId}`);
      const data = await response.json();
      return data.success ? (data.data || []) : [];
    } catch (error) {
      console.error("Failed to get chats:", error);
      return [];
    }
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${chatId}`);
      const data = await response.json();
      return data.success ? (data.data || []) : [];
    } catch (error) {
      console.error("Failed to get messages:", error);
      return [];
    }
  }

  async sendMessage(
    chatId: string,
    content: string,
    type: string = "text",
    metadata?: any,
  ): Promise<Message | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${chatId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: this.userId,
          content,
          type,
          metadata,
        }),
      });

      const data = await response.json();

      if (data.message) {
        this.emit("message-sent", data.message);
        return data.message;
      }

      return null;
    } catch (error) {
      console.error("Failed to send message:", error);
      return null;
    }
  }

  async markAsRead(chatId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${chatId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: this.userId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to mark as read:", error);
      return false;
    }
  }

  async addReaction(messageId: string, emoji: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/reaction/${messageId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emoji,
          userId: this.userId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to add reaction:", error);
      return false;
    }
  }

  async setTyping(chatId: string, isTyping: boolean): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${chatId}/typing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isTyping,
          userId: this.userId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to set typing:", error);
      return false;
    }
  }

  async getTypingUsers(chatId: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${chatId}/typing`);
      const data = await response.json();
      return data.typingUsers || [];
    } catch (error) {
      console.error("Failed to get typing users:", error);
      return [];
    }
  }

  async createChat(
    participants: string[],
    type: string = "direct",
    name?: string,
  ): Promise<Chat | null> {
    try {
      const response = await fetch(`${this.baseUrl}/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participants,
          type,
          name,
        }),
      });

      const data = await response.json();
      return data.chat || null;
    } catch (error) {
      console.error("Failed to create chat:", error);
      return null;
    }
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/message/${messageId}`, {
        method: "DELETE",
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to delete message:", error);
      return false;
    }
  }
}

// Singleton instance
export const messagingService = new MessagingService();

// React hook for real-time messaging
export const useMessaging = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshChats = useCallback(async () => {
    const updatedChats = await messagingService.getChats();
    setChats(updatedChats);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial load
    refreshChats();

    // Set up polling for real-time updates
    messagingService.startPolling();

    // Listen for poll events to refresh data
    const handlePoll = () => {
      refreshChats();
    };

    messagingService.on("poll", handlePoll);

    return () => {
      messagingService.off("poll", handlePoll);
      messagingService.stopPolling();
    };
  }, [refreshChats]);

  return {
    chats,
    loading,
    refreshChats,
    messagingService,
  };
};

// React hook for individual chat
export const useChat = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const refreshMessages = useCallback(async () => {
    if (!chatId) return;

    const updatedMessages = await messagingService.getChatMessages(chatId);
    setMessages(updatedMessages);
    setLoading(false);

    // Mark messages as read
    await messagingService.markAsRead(chatId);
  }, [chatId]);

  const refreshTyping = useCallback(async () => {
    if (!chatId) return;

    const users = await messagingService.getTypingUsers(chatId);
    setTypingUsers(users.filter((user) => user !== "user")); // Exclude current user
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;

    // Initial load
    refreshMessages();

    // Listen for new messages
    const handleMessageSent = (message: Message) => {
      if (message.chatId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handlePoll = () => {
      refreshMessages();
      refreshTyping();
    };

    messagingService.on("message-sent", handleMessageSent);
    messagingService.on("poll", handlePoll);

    return () => {
      messagingService.off("message-sent", handleMessageSent);
      messagingService.off("poll", handlePoll);
    };
  }, [chatId, refreshMessages, refreshTyping]);

  const sendMessage = async (
    content: string,
    type: string = "text",
    metadata?: any,
  ) => {
    const message = await messagingService.sendMessage(
      chatId,
      content,
      type,
      metadata,
    );
    if (message) {
      setMessages((prev) => [...prev, message]);
    }
    return message;
  };

  const setTyping = async (isTyping: boolean) => {
    await messagingService.setTyping(chatId, isTyping);
  };

  const addReaction = async (messageId: string, emoji: string) => {
    await messagingService.addReaction(messageId, emoji);
    refreshMessages(); // Refresh to show updated reactions
  };

  return {
    messages,
    loading,
    typingUsers,
    sendMessage,
    setTyping,
    addReaction,
    refreshMessages,
  };
};
