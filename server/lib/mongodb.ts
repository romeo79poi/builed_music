import mongoose from 'mongoose';

// MongoDB connection
let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log('📊 MongoDB already connected');
    return;
  }

  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/music_catch';
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ Connected to MongoDB successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
      isConnected = true;
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    isConnected = false;
    
    // In development, continue without MongoDB for now
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Continuing without MongoDB in development mode...');
      return;
    }
    
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};

export const isMongoConnected = (): boolean => {
  return isConnected && mongoose.connection.readyState === 1;
};
