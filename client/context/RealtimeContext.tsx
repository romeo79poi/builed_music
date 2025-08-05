import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Real-time event types
export interface NowPlayingData {
  songId: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  timestamp: number;
  isPlaying: boolean;
  progress?: number;
}

export interface FriendActivity {
  userId: string;
  username: string;
  activity: {
    type: 'listening' | 'browsing' | 'creating' | 'online' | 'offline';
    details: string;
    songData?: NowPlayingData;
  };
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  timestamp: Date;
  type?: 'text' | 'song-share' | 'system';
}

export interface ListenParty {
  id: string;
  name: string;
  hostId: string;
  currentSong?: NowPlayingData;
  participants: Array<{
    userId: string;
    username: string;
    isConnected: boolean;
  }>;
  isActive: boolean;
}

interface RealtimeContextType {
  socket: Socket | null;
  isConnected: boolean;
  
  // Friend Activity
  friendsActivity: FriendActivity[];
  onlineUsers: string[];
  
  // Music Sync
  updateNowPlaying: (songData: NowPlayingData) => void;
  joinListenParty: (partyId: string) => void;
  leaveListenParty: () => void;
  createListenParty: (name: string) => void;
  currentListenParty: ListenParty | null;
  
  // Messaging
  sendMessage: (chatId: string, content: string, recipientId: string) => void;
  sendSongShare: (chatId: string, songData: NowPlayingData, recipientId: string) => void;
  recentMessages: ChatMessage[];
  typingUsers: Record<string, string[]>; // chatId -> usernames[]
  
  // Activity Updates
  updateActivity: (type: 'listening' | 'browsing' | 'creating', details: string) => void;
  
  // Events
  onFriendActivity: (callback: (activity: FriendActivity) => void) => () => void;
  onMessageReceived: (callback: (message: ChatMessage) => void) => () => void;
  onPartyUpdate: (callback: (party: ListenParty) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface RealtimeProviderProps {
  children: ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [friendsActivity, setFriendsActivity] = useState<FriendActivity[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [currentListenParty, setCurrentListenParty] = useState<ListenParty | null>(null);
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  
  const { user, token } = useAuth();

  // Event listeners management
  const [activityListeners, setActivityListeners] = useState<((activity: FriendActivity) => void)[]>([]);
  const [messageListeners, setMessageListeners] = useState<((message: ChatMessage) => void)[]>([]);
  const [partyListeners, setPartyListeners] = useState<((party: ListenParty) => void)[]>([]);

  useEffect(() => {
    if (user && token) {
      console.log('🔌 Connecting to real-time server...');
      
      const newSocket = io(window.location.origin, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('🔌 Connected to real-time server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from real-time server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('🔌 Connection error:', error);
        setIsConnected(false);
      });

      // Friend activity events
      newSocket.on('friend:activity', (activity: FriendActivity) => {
        setFriendsActivity(prev => {
          const filtered = prev.filter(a => a.userId !== activity.userId);
          return [activity, ...filtered].slice(0, 50); // Keep last 50 activities
        });
        
        // Notify listeners
        activityListeners.forEach(listener => listener(activity));
      });

      newSocket.on('friend:now-playing', (data: FriendActivity) => {
        setFriendsActivity(prev => {
          const filtered = prev.filter(a => a.userId !== data.userId);
          return [data, ...filtered].slice(0, 50);
        });
      });

      newSocket.on('users:online', (users: string[]) => {
        setOnlineUsers(users);
      });

      // Listen party events
      newSocket.on('party:joined', (party: ListenParty) => {
        setCurrentListenParty(party);
        partyListeners.forEach(listener => listener(party));
      });

      newSocket.on('party:updated', (party: ListenParty) => {
        setCurrentListenParty(party);
        partyListeners.forEach(listener => listener(party));
      });

      newSocket.on('party:sync', (songData: NowPlayingData) => {
        if (currentListenParty) {
          setCurrentListenParty(prev => prev ? {
            ...prev,
            currentSong: songData
          } : null);
        }
      });

      newSocket.on('party:left', () => {
        setCurrentListenParty(null);
      });

      // Messaging events
      newSocket.on('message:received', (message: ChatMessage) => {
        setRecentMessages(prev => [message, ...prev.slice(0, 99)]);
        messageListeners.forEach(listener => listener(message));
      });

      newSocket.on('message:typing', (data: { chatId: string; userId: string; username: string }) => {
        setTypingUsers(prev => ({
          ...prev,
          [data.chatId]: [...(prev[data.chatId] || []), data.username].slice(0, 3)
        }));
        
        // Clear typing after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [data.chatId]: (prev[data.chatId] || []).filter(u => u !== data.username)
          }));
        }, 3000);
      });

      setSocket(newSocket);

      return () => {
        console.log('🔌 Disconnecting socket...');
        newSocket.close();
      };
    }
  }, [user, token]);

  // API functions
  const updateNowPlaying = (songData: NowPlayingData) => {
    if (socket && isConnected) {
      socket.emit('music:now-playing', songData);
    }
  };

  const joinListenParty = (partyId: string) => {
    if (socket && isConnected) {
      socket.emit('party:join', partyId);
    }
  };

  const leaveListenParty = () => {
    if (socket && isConnected) {
      socket.emit('party:leave');
      setCurrentListenParty(null);
    }
  };

  const createListenParty = (name: string) => {
    if (socket && isConnected) {
      socket.emit('party:create', { name });
    }
  };

  const sendMessage = (chatId: string, content: string, recipientId: string) => {
    if (socket && isConnected) {
      socket.emit('message:send', { chatId, content, recipientId });
    }
  };

  const sendSongShare = (chatId: string, songData: NowPlayingData, recipientId: string) => {
    if (socket && isConnected) {
      socket.emit('message:song-share', { chatId, songData, recipientId });
    }
  };

  const updateActivity = (type: 'listening' | 'browsing' | 'creating', details: string) => {
    if (socket && isConnected) {
      socket.emit('activity:update', { type, details });
    }
  };

  // Event listener registration
  const onFriendActivity = (callback: (activity: FriendActivity) => void) => {
    setActivityListeners(prev => [...prev, callback]);
    return () => {
      setActivityListeners(prev => prev.filter(cb => cb !== callback));
    };
  };

  const onMessageReceived = (callback: (message: ChatMessage) => void) => {
    setMessageListeners(prev => [...prev, callback]);
    return () => {
      setMessageListeners(prev => prev.filter(cb => cb !== callback));
    };
  };

  const onPartyUpdate = (callback: (party: ListenParty) => void) => {
    setPartyListeners(prev => [...prev, callback]);
    return () => {
      setPartyListeners(prev => prev.filter(cb => cb !== callback));
    };
  };

  const value: RealtimeContextType = {
    socket,
    isConnected,
    friendsActivity,
    onlineUsers,
    updateNowPlaying,
    joinListenParty,
    leaveListenParty,
    createListenParty,
    currentListenParty,
    sendMessage,
    sendSongShare,
    recentMessages,
    typingUsers,
    updateActivity,
    onFriendActivity,
    onMessageReceived,
    onPartyUpdate,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

// Hook for friend activity
export function useFriendActivity() {
  const { friendsActivity, onlineUsers, updateActivity } = useRealtime();
  return { friendsActivity, onlineUsers, updateActivity };
}

// Hook for music sync
export function useMusicSync() {
  const { 
    updateNowPlaying, 
    joinListenParty, 
    leaveListenParty, 
    createListenParty, 
    currentListenParty 
  } = useRealtime();
  
  return { 
    updateNowPlaying, 
    joinListenParty, 
    leaveListenParty, 
    createListenParty, 
    currentListenParty 
  };
}

// Hook for messaging
export function useRealtimeMessaging() {
  const { 
    sendMessage, 
    sendSongShare, 
    recentMessages, 
    typingUsers, 
    onMessageReceived 
  } = useRealtime();
  
  return { 
    sendMessage, 
    sendSongShare, 
    recentMessages, 
    typingUsers, 
    onMessageReceived 
  };
}
