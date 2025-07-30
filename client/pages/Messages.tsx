import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  content: string;
  time: string;
  isOwn: boolean;
  isRead?: boolean;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  isVerified?: boolean;
}

const Messages = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const chats: Chat[] = [
    {
      id: "1",
      name: "Priya Sharma",
      avatar: "/placeholder.svg",
      lastMessage: "That song you shared is amazing! 🎵",
      time: "2m",
      unreadCount: 2,
      isOnline: true,
      isVerified: true,
    },
    {
      id: "2", 
      name: "Rohit Kumar",
      avatar: "/placeholder.svg",
      lastMessage: "When are we jamming next?",
      time: "1h",
      unreadCount: 0,
      isOnline: true,
    },
    {
      id: "3",
      name: "Music Squad",
      avatar: "/placeholder.svg",
      lastMessage: "Check out this new playlist 🔥",
      time: "3h",
      unreadCount: 5,
      isOnline: false,
    },
    {
      id: "4",
      name: "Anita Singh",
      avatar: "/placeholder.svg",
      lastMessage: "Loved your latest upload!",
      time: "1d",
      unreadCount: 0,
      isOnline: false,
    },
  ];

  const messages: Message[] = [
    {
      id: "1",
      content: "Hey! Did you listen to that new track?",
      time: "10:30 AM",
      isOwn: false,
    },
    {
      id: "2",
      content: "Yes! It's absolutely incredible 🎵",
      time: "10:32 AM",
      isOwn: true,
      isRead: true,
    },
    {
      id: "3",
      content: "Right? The production quality is amazing",
      time: "10:33 AM",
      isOwn: false,
    },
    {
      id: "4",
      content: "We should collaborate on something like this",
      time: "10:35 AM",
      isOwn: true,
      isRead: true,
    },
  ];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChat = chats.find(chat => chat.id === activeChat);

  const sendMessage = () => {
    if (messageInput.trim()) {
      // Handle message sending logic here
      setMessageInput("");
    }
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
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedChat?.avatar} />
                    <AvatarFallback>
                      {selectedChat?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {selectedChat?.isOnline && (
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
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedChat?.isOnline ? "Active now" : "Active 1h ago"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-accent">
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Messages */}
        <motion.div
          variants={itemVariants}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.isOwn ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  message.isOwn
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">{message.time}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Message Input */}
        <motion.div
          variants={itemVariants}
          className="p-4 bg-card/80 backdrop-blur-md border-t border-border"
        >
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="hover:bg-accent">
              <Camera className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Message..."
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

            <Button variant="ghost" size="icon" className="hover:bg-accent">
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
      </motion.div>
    );
  }

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
              onClick={() => navigate("/home")}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Messages</h1>
          </div>

          <Button variant="ghost" size="icon" className="hover:bg-accent">
            <Edit className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
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
        <div className="space-y-1 p-2">
          {filteredChats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ backgroundColor: "hsl(var(--accent))" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveChat(chat.id)}
              className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors"
            >
              <div className="relative">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {chat.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-semibold text-sm truncate">
                      {chat.name}
                    </h3>
                    {chat.isVerified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {chat.time}
                    </span>
                    {chat.unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {chat.lastMessage}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Messages;
