import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

export interface SocketUser {
  userId: string;
  username: string;
  socketId: string;
}

export interface ListenParty {
  id: string;
  name: string;
  hostId: string;
  participants: SocketUser[];
  currentSong?: any;
  isActive: boolean;
  createdAt: Date;
}

export class MusicSocketServer {
  private io: SocketIOServer;
  private connectedUsers = new Map<string, SocketUser>(); // socketId -> user
  private userSockets = new Map<string, string>(); // userId -> socketId
  private listenParties = new Map<string, ListenParty>(); // partyId -> party
  private userActivities = new Map<string, any>(); // userId -> latest activity

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('🎵 Music Socket.IO server initialized');
  }

  private setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.log('❌ Socket connection rejected: No token');
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        (socket as any).userId = decoded.userId || decoded.id;
        (socket as any).username = decoded.username || decoded.name || 'User';
        next();
      } catch (err) {
        console.log('❌ Socket connection rejected: Invalid token');
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = (socket as any).userId;
      const username = (socket as any).username;
      
      console.log(`🔌 User connected: ${username} (${userId})`);
      
      // Store user connection
      const user: SocketUser = { userId, username, socketId: socket.id };
      this.connectedUsers.set(socket.id, user);
      this.userSockets.set(userId, socket.id);

      // Join user's personal room
      socket.join(`user:${userId}`);

      // Send online users list
      this.broadcastOnlineUsers();

      // Setup event handlers
      this.setupMusicEvents(socket);
      this.setupMessagingEvents(socket);
      this.setupListenPartyEvents(socket);
      this.setupActivityEvents(socket);

      // Handle disconnect
      socket.on('disconnect', (reason) => {
        console.log(`🔌 User disconnected: ${username} (${reason})`);
        this.handleUserDisconnect(socket.id, userId);
      });
    });
  }

  private setupMusicEvents(socket: any) {
    const userId = socket.userId;
    const username = socket.username;

    // Now playing updates
    socket.on('music:now-playing', (songData: any) => {
      console.log(`🎵 ${username} now playing: ${songData.title}`);
      
      // Store user activity
      this.userActivities.set(userId, {
        type: 'listening',
        details: `${songData.title} by ${songData.artist}`,
        songData,
        timestamp: new Date(),
      });

      // Broadcast to friends (you can implement friend list logic here)
      socket.broadcast.emit('friend:now-playing', {
        userId,
        username,
        activity: {
          type: 'listening',
          details: `${songData.title} by ${songData.artist}`,
          songData,
        },
        timestamp: new Date(),
      });

      // If user is in a listen party, sync with party members
      const userParty = this.findUserParty(userId);
      if (userParty && userParty.hostId === userId) {
        userParty.currentSong = songData;
        socket.to(`party:${userParty.id}`).emit('party:sync', songData);
        
        // Update party data
        socket.to(`party:${userParty.id}`).emit('party:updated', userParty);
      }
    });
  }

  private setupMessagingEvents(socket: any) {
    const userId = socket.userId;
    const username = socket.username;

    socket.on('message:send', (data: {
      chatId: string;
      content: string;
      recipientId: string;
    }) => {
      const message = {
        id: `${Date.now()}-${Math.random()}`,
        chatId: data.chatId,
        senderId: userId,
        senderUsername: username,
        content: data.content,
        timestamp: new Date(),
        type: 'text',
      };

      // Send to recipient
      const recipientSocketId = this.userSockets.get(data.recipientId);
      if (recipientSocketId) {
        this.io.to(recipientSocketId).emit('message:received', message);
      }

      // Send back to sender for confirmation
      socket.emit('message:sent', message);
    });

    socket.on('message:song-share', (data: {
      chatId: string;
      songData: any;
      recipientId: string;
    }) => {
      const message = {
        id: `${Date.now()}-${Math.random()}`,
        chatId: data.chatId,
        senderId: userId,
        senderUsername: username,
        content: `Shared: ${data.songData.title} by ${data.songData.artist}`,
        timestamp: new Date(),
        type: 'song-share',
        songData: data.songData,
      };

      const recipientSocketId = this.userSockets.get(data.recipientId);
      if (recipientSocketId) {
        this.io.to(recipientSocketId).emit('message:received', message);
      }

      socket.emit('message:sent', message);
    });

    socket.on('message:typing', (data: { chatId: string; recipientId: string }) => {
      const recipientSocketId = this.userSockets.get(data.recipientId);
      if (recipientSocketId) {
        this.io.to(recipientSocketId).emit('message:typing', {
          chatId: data.chatId,
          userId,
          username,
        });
      }
    });
  }

  private setupListenPartyEvents(socket: any) {
    const userId = socket.userId;
    const username = socket.username;

    socket.on('party:create', (data: { name: string }) => {
      const partyId = `party-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const party: ListenParty = {
        id: partyId,
        name: data.name,
        hostId: userId,
        participants: [{ userId, username, socketId: socket.id }],
        isActive: true,
        createdAt: new Date(),
      };

      this.listenParties.set(partyId, party);
      socket.join(`party:${partyId}`);
      
      socket.emit('party:joined', party);
      console.log(`🎉 ${username} created listen party: ${data.name}`);
    });

    socket.on('party:join', (partyId: string) => {
      const party = this.listenParties.get(partyId);
      if (party && party.isActive) {
        // Add user to party
        const existingUser = party.participants.find(p => p.userId === userId);
        if (!existingUser) {
          party.participants.push({ userId, username, socketId: socket.id });
        }

        socket.join(`party:${partyId}`);
        
        // Notify all party members
        socket.to(`party:${partyId}`).emit('party:user-joined', {
          userId,
          username,
        });

        socket.emit('party:joined', party);
        socket.to(`party:${partyId}`).emit('party:updated', party);
        
        console.log(`🎉 ${username} joined listen party: ${party.name}`);
      }
    });

    socket.on('party:leave', () => {
      const userParty = this.findUserParty(userId);
      if (userParty) {
        this.removeUserFromParty(userParty.id, userId);
        socket.leave(`party:${userParty.id}`);
        socket.emit('party:left');
        
        console.log(`👋 ${username} left listen party: ${userParty.name}`);
      }
    });
  }

  private setupActivityEvents(socket: any) {
    const userId = socket.userId;
    const username = socket.username;

    socket.on('activity:update', (activity: {
      type: 'listening' | 'browsing' | 'creating';
      details: string;
    }) => {
      // Store user activity
      this.userActivities.set(userId, {
        ...activity,
        timestamp: new Date(),
      });

      // Broadcast to friends
      socket.broadcast.emit('friend:activity', {
        userId,
        username,
        activity,
        timestamp: new Date(),
      });
    });
  }

  private handleUserDisconnect(socketId: string, userId: string) {
    // Remove from connected users
    this.connectedUsers.delete(socketId);
    this.userSockets.delete(userId);

    // Remove from any listen parties
    this.listenParties.forEach((party, partyId) => {
      const userIndex = party.participants.findIndex(p => p.userId === userId);
      if (userIndex !== -1) {
        party.participants.splice(userIndex, 1);
        
        // If party is empty or host left, deactivate party
        if (party.participants.length === 0 || party.hostId === userId) {
          party.isActive = false;
          this.io.to(`party:${partyId}`).emit('party:ended');
        } else {
          this.io.to(`party:${partyId}`).emit('party:updated', party);
        }
      }
    });

    // Update online users
    this.broadcastOnlineUsers();

    // Broadcast user offline status
    this.io.emit('friend:activity', {
      userId,
      username: 'User',
      activity: {
        type: 'offline',
        details: 'User went offline',
      },
      timestamp: new Date(),
    });
  }

  private findUserParty(userId: string): ListenParty | undefined {
    for (const party of this.listenParties.values()) {
      if (party.participants.some(p => p.userId === userId) && party.isActive) {
        return party;
      }
    }
    return undefined;
  }

  private removeUserFromParty(partyId: string, userId: string) {
    const party = this.listenParties.get(partyId);
    if (party) {
      party.participants = party.participants.filter(p => p.userId !== userId);
      
      if (party.participants.length === 0 || party.hostId === userId) {
        party.isActive = false;
        this.io.to(`party:${partyId}`).emit('party:ended');
      } else {
        this.io.to(`party:${partyId}`).emit('party:updated', party);
      }
    }
  }

  private broadcastOnlineUsers() {
    const onlineUserIds = Array.from(this.userSockets.keys());
    this.io.emit('users:online', onlineUserIds);
  }

  // Public methods for external use
  public sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  public broadcastToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  public getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  public getActiveParties(): ListenParty[] {
    return Array.from(this.listenParties.values()).filter(p => p.isActive);
  }
}

export default MusicSocketServer;
