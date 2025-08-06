import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Edit,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  Send,
  Camera,
  Mic,
  Heart,
  Smile,
  Image,
  Gift,
  Plus,
  Archive,
  Pin,
  Trash2,
  Forward,
  Reply,
  Copy,
  Star,
  Volume2,
  Play,
  Pause,
  Download,
  Eye,
  EyeOff,
  Users,
  Settings,
  Clock,
  MessageCircle,
  ThumbsUp,
  Laugh,
  Angry,
  Frown,
  Surprise,
  X,
  Bot,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFirebase } from "../context/FirebaseContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMessaging, useChat } from "@/lib/messaging-service";
import { api } from "../lib/api";

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user: firebaseUser, loading: firebaseLoading } = useFirebase();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<
    "primary" | "requests" | "archived"
  >("primary");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time messaging hooks
  const { chats, loading: chatsLoading, refreshChats } = useMessaging();
  const {
    messages,
    loading: messagesLoading,
    typingUsers,
    sendMessage: sendChatMessage,
    setTyping,
    addReaction,
    refreshMessages,
  } = useChat(activeChat || "");

  const reactionEmojis = ["❤️", "😂", "😮", "😢", "😡", "👍"];

  // Handle back navigation based on where user came from
  const handleBackNavigation = () => {
    const fromState = location.state?.from;
    if (fromState === "profile") {
      navigate("/profile");
    } else {
      navigate("/home");
    }
  };

  const filteredChats = chats.filter((chat) => {
    if (currentView === "requests") return false; // Placeholder for message requests
    if (currentView === "archived") return chat.isArchived;
    return (
      !chat.isArchived &&
      (chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) || "")
    );
  });

  const selectedChat = chats.find((chat) => chat.id === activeChat);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    if (activeChat) {
      // Set typing status
      setTyping(true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
      }, 3000);
    }
  };

  const sendMessage = async () => {
    if (messageInput.trim() && activeChat) {
      try {
        await sendChatMessage(messageInput.trim());
        setMessageInput("");

        // Stop typing indicator
        setTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        toast({
          title: "Message sent",
          description: "Your message has been delivered",
        });
      } catch (error) {
        toast({
          title: "Failed to send message",
          description: "Please try again",
          variant: "destructive",
        });
      }
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await addReaction(messageId, emoji);
      setShowReactions(null);
      toast({
        title: "Reaction added",
        description: `You reacted with ${emoji}`,
      });
    } catch (error) {
      toast({
        title: "Failed to add reaction",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Individual Chat View
  if (activeChat) {
    return (
      <motion.div
        className="min-h-screen bg-background text-foreground flex flex-col"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Chat Header */}
        <motion.header
          variants={itemVariants}
          className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border"
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveChat(null)}
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarImage src={selectedChat?.avatar} />
                    <AvatarFallback>
                      {selectedChat?.type === "ai" ? (
                        <Bot className="h-5 w-5" />
                      ) : (
                        selectedChat?.name?.charAt(0)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {selectedChat?.type === "ai" && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-background">
                      <Zap className="h-2 w-2 text-white" />
                    </div>
                  )}
                  {selectedChat?.isOnline && selectedChat?.type !== "ai" && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-1">
                    <h2 className="font-semibold text-sm">
                      {selectedChat?.name}
                    </h2>
                    {selectedChat?.isVerified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                    {selectedChat?.type === "group" && (
                      <Users className="h-3 w-3 text-muted-foreground" />
                    )}
                    {selectedChat?.type === "ai" && (
                      <Bot className="h-3 w-3 text-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {typingUsers.length > 0 ? (
                      <span className="flex items-center space-x-1">
                        <span>Typing</span>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                          <div
                            className="w-1 h-1 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-1 h-1 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </span>
                    ) : selectedChat?.type === "ai" ? (
                      "AI Assistant • Always active"
                    ) : selectedChat?.isOnline ? (
                      "Active now"
                    ) : (
                      selectedChat?.lastSeen
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {selectedChat?.type !== "ai" && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-accent"
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-accent"
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.senderId === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="flex items-end space-x-2 max-w-[75%]">
                    {message.senderId !== "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedChat?.avatar} />
                        <AvatarFallback className="text-xs">
                          {selectedChat?.type === "ai" ? (
                            <Bot className="h-4 w-4" />
                          ) : (
                            selectedChat?.name?.charAt(0)
                          )}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="space-y-1">
                      <div
                        className={`relative group rounded-2xl px-4 py-2 ${
                          message.senderId === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : message.senderId === "ai"
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-bl-md"
                              : "bg-muted text-foreground rounded-bl-md"
                        } ${message.isDisappearing ? "opacity-50" : ""}`}
                        onDoubleClick={() => setShowReactions(message.id)}
                      >
                        {message.type === "text" && (
                          <p className="text-sm">{message.content}</p>
                        )}

                        {message.type === "voice" && (
                          <div className="flex items-center space-x-2 min-w-[120px]">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <div className="flex-1 h-1 bg-muted-foreground/30 rounded-full">
                              <div className="h-full w-1/3 bg-primary rounded-full" />
                            </div>
                            <span className="text-xs">
                              {message.metadata?.duration || 15}s
                            </span>
                          </div>
                        )}

                        {message.type === "image" && (
                          <div className="rounded-lg overflow-hidden">
                            <img
                              src={
                                message.metadata?.imageUrl || "/placeholder.svg"
                              }
                              alt="Shared image"
                              className="w-48 h-32 object-cover"
                            />
                          </div>
                        )}

                        {message.isForwarded && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-1">
                            <Forward className="h-3 w-3" />
                            <span>Forwarded</span>
                          </div>
                        )}

                        {message.isDisappearing && (
                          <Clock className="h-3 w-3 text-muted-foreground inline ml-2" />
                        )}

                        {/* Message options */}
                        <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded-lg shadow-lg flex items-center p-1 space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Reply className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Forward className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {message.reactions.map((reaction, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-1 bg-background border rounded-full px-2 py-1"
                            >
                              <span className="text-xs">{reaction.emoji}</span>
                              <span className="text-xs text-muted-foreground">
                                1
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </p>
                        {message.senderId === "user" && (
                          <div className="text-xs text-muted-foreground">
                            {message.isRead ? (
                              <span className="text-blue-500">✓✓</span>
                            ) : (
                              "✓✓"
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Quick Reactions */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
              onClick={() => setShowReactions(null)}
            >
              <div className="bg-background rounded-full p-4 flex items-center space-x-3">
                {reactionEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    className="text-2xl hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReaction(showReactions, emoji);
                    }}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Input */}
        <motion.div
          variants={itemVariants}
          className="p-4 bg-card/80 backdrop-blur-md border-t border-border"
        >
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="hover:bg-accent">
              <Plus className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="hover:bg-accent">
              <Image className="h-5 w-5" />
            </Button>

            <div className="flex-1 relative">
              <Input
                value={messageInput}
                onChange={handleInputChange}
                placeholder={
                  selectedChat?.type === "ai"
                    ? "Ask AI anything..."
                    : "Message..."
                }
                className="rounded-full bg-muted border-0 pr-12"
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-accent"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={`hover:bg-accent ${isRecording ? "text-red-500" : ""}`}
              onMouseDown={() => setIsRecording(true)}
              onMouseUp={() => setIsRecording(false)}
            >
              <Mic className="h-5 w-5" />
            </Button>

            {messageInput.trim() ? (
              <Button
                onClick={sendMessage}
                size="icon"
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Heart className="h-5 w-5" />
              </Button>
            )}
          </div>
        </motion.div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            // Handle file upload
          }}
        />
      </motion.div>
    );
  }

  // Main Messages List View
  return (
    <motion.div
      className="min-h-screen bg-background text-foreground"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackNavigation}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Messages</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" className="hover:bg-accent">
              Join
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-accent">
              <Edit className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-4 space-x-6">
          <Button
            variant={currentView === "primary" ? "default" : "ghost"}
            className={`text-sm ${currentView === "primary" ? "text-white" : ""}`}
            onClick={() => setCurrentView("primary")}
          >
            Primary
          </Button>
          <Button
            variant={currentView === "requests" ? "default" : "ghost"}
            className={`text-sm ${currentView === "requests" ? "text-white" : ""}`}
            onClick={() => setCurrentView("requests")}
          >
            Requests
          </Button>
          <Button
            variant={currentView === "archived" ? "default" : "ghost"}
            className={`text-sm ${currentView === "archived" ? "text-white" : ""}`}
            onClick={() => setCurrentView("archived")}
          >
            Archived
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="pl-10 rounded-full bg-muted border-0"
            />
          </div>
        </div>
      </motion.header>

      {/* Chat List */}
      <motion.div variants={itemVariants} className="flex-1 overflow-y-auto">
        {chatsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {currentView === "requests" && (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No message requests</h3>
                <p className="text-sm text-muted-foreground">
                  Message requests from people you don't follow will appear here
                </p>
              </div>
            )}

            {currentView === "archived" && filteredChats.length === 0 && (
              <div className="text-center py-12">
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No archived chats</h3>
                <p className="text-sm text-muted-foreground">
                  Chats you archive will appear here
                </p>
              </div>
            )}

            {filteredChats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ backgroundColor: "hsl(var(--accent))" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveChat(chat.id)}
                className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="relative">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>
                      {chat.type === "ai" ? (
                        <Bot className="h-6 w-6" />
                      ) : (
                        chat.name?.charAt(0)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {chat.type === "ai" && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center">
                      <Zap className="h-2 w-2 text-white" />
                    </div>
                  )}
                  {chat.isOnline && chat.type !== "ai" && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {chat.isPinned && (
                        <Pin className="h-3 w-3 text-muted-foreground" />
                      )}
                      <h3
                        className={`text-sm truncate ${(chat.unreadCount || 0) > 0 ? "font-bold" : "font-semibold"}`}
                      >
                        {chat.name}
                      </h3>
                      {chat.isVerified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                      {chat.type === "group" && (
                        <Users className="h-3 w-3 text-muted-foreground" />
                      )}
                      {chat.type === "ai" && (
                        <Bot className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {chat.lastMessage
                          ? formatTime(chat.lastMessage.timestamp)
                          : ""}
                      </span>
                      {(chat.unreadCount || 0) > 0 && (
                        <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                          {chat.unreadCount}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle more options
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <p
                      className={`text-sm truncate ${(chat.unreadCount || 0) > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}
                    >
                      {chat.lastMessage?.content ||
                        (chat.type === "ai"
                          ? "AI Assistant ready to help!"
                          : "Start a conversation")}
                    </p>
                    {chat.type === "group" && chat.groupMembers && (
                      <span className="text-xs text-muted-foreground">
                        · {chat.groupMembers} members
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Edit className="h-6 w-6" />
        </Button>
      </div>
    </motion.div>
  );
};

export default Messages;
