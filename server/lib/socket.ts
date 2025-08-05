import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

export interface SocketUser {
  userId: string;
  username: string;
  room?: string;
}

export class SocketManager {
  private io: SocketIOServer;
  private connectedUsers = new Map<string, SocketUser>();
  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        socket.userId = decoded.userId;
        socket.username = decoded.username;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.username} (${socket.userId})`);
      
      // Store user connection
      this.connectedUsers.set(socket.id, {
        userId: socket.userId,
        username: socket.username,
      });
      this.userSockets.set(socket.userId, socket.id);

      // Join user's personal room
      socket.join(`user:${socket.userId}`);

      // Handle music sync events
      this.setupMusicEvents(socket);
      
      // Handle messaging events
      this.setupMessagingEvents(socket);
      
      // Handle friend activity events
      this.setupFriendActivityEvents(socket);

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.username}`);
        this.connectedUsers.delete(socket.id);
        this.userSockets.delete(socket.userId);
      });
    });
  }

  private setupMusicEvents(socket: any) {
    // Sync music playback with friends
    socket.on('music:now-playing', (data: {
      songId: string;
      title: string;
      artist: string;
      timestamp: number;
      isPlaying: boolean;
    }) => {
      // Broadcast to friends
      socket.broadcast.to(`user:${socket.userId}`).emit('friend:now-playing', {
        userId: socket.userId,
        username: socket.username,
        ...data,
      });
    });

    // Listen party feature
    socket.on('music:join-party', (partyId: string) => {
      socket.join(`party:${partyId}`);
      socket.to(`party:${partyId}`).emit('party:user-joined', {
        userId: socket.userId,
        username: socket.username,
      });
    });

    socket.on('music:party-sync', (data: any) => {
      socket.to(`party:${data.partyId}`).emit('party:sync', data);
    });
  }

  private setupMessagingEvents(socket: any) {
    socket.on('message:send', (data: {
      chatId: string;
      content: string;
      recipientId: string;
    }) => {
      // Send to recipient
      const recipientSocketId = this.userSockets.get(data.recipientId);
      if (recipientSocketId) {
        this.io.to(recipientSocketId).emit('message:receive', {
          chatId: data.chatId,
          content: data.content,
          senderId: socket.userId,
          senderUsername: socket.username,
          timestamp: new Date(),
        });
      }
    });

    socket.on('message:typing', (data: { chatId: string; recipientId: string }) => {
      const recipientSocketId = this.userSockets.get(data.recipientId);
      if (recipientSocketId) {
        this.io.to(recipientSocketId).emit('message:typing', {
          chatId: data.chatId,
          userId: socket.userId,
          username: socket.username,
        });
      }
    });
  }

  private setupFriendActivityEvents(socket: any) {
    socket.on('activity:update', (activity: {
      type: 'listening' | 'browsing' | 'creating';
      details: string;
    }) => {
      // Broadcast to friends (you'll need to get friends list)
      socket.broadcast.emit('friend:activity', {
        userId: socket.userId,
        username: socket.username,
        activity,
        timestamp: new Date(),
      });
    });
  }

  // Helper methods for server-side usage
  public sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public sendToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  public getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }
}

export default SocketManager;
