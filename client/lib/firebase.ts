import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser,
  sendPasswordResetEmail,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { 
  getStorage, 
  Storage,
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey && 
    firebaseConfig.authDomain && 
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes('[') &&
    !firebaseConfig.authDomain.includes('[')
  );
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: Storage | null = null;

if (isFirebaseConfigured()) {
  try {
    // Initialize Firebase only if not already initialized
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log('🔥 Firebase initialized successfully');
    } else {
      app = getApps()[0];
    }
    
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    console.log('🔥 Firebase services ready');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
  }
} else {
  console.warn('⚠️ Firebase not configured. Please set environment variables.');
}

// Export configured status
export { isFirebaseConfigured };

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  verified: boolean;
  premium: boolean;
  followersCount: number;
  followingCount: number;
  likedSongsCount: number;
  playlistsCount: number;
  lastActive: Timestamp;
  createdAt: Timestamp;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    publicProfile: boolean;
    shareActivity: boolean;
  };
}

// Song interface for Firebase
export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  coverUrl?: string;
  audioUrl: string;
  genre?: string;
  releaseDate?: Timestamp;
  playCount: number;
  likesCount: number;
  uploadedBy?: string;
  createdAt: Timestamp;
}

// Playlist interface
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  createdBy: string;
  songIds: string[];
  songCount: number;
  totalDuration: number;
  followersCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Real-time activity
export interface UserActivity {
  id: string;
  userId: string;
  type: 'play' | 'like' | 'follow' | 'create_playlist' | 'share';
  details: any;
  timestamp: Timestamp;
}

// Firebase Authentication Service
export const firebaseAuth = {
  // Check if Firebase is available
  isAvailable: () => !!auth && isFirebaseConfigured(),

  // Google Sign In
  async signInWithGoogle() {
    if (!auth) throw new Error('Firebase not configured');
    
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    try {
      const result = await signInWithPopup(auth, provider);
      return { user: result.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  // Facebook Sign In
  async signInWithFacebook() {
    if (!auth) throw new Error('Firebase not configured');
    
    const provider = new FacebookAuthProvider();
    provider.addScope('public_profile');
    provider.addScope('email');
    
    try {
      const result = await signInWithPopup(auth, provider);
      return { user: result.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  // Email/Password Sign Up
  async signUpWithEmail(email: string, password: string, userData: Partial<UserProfile>) {
    if (!auth || !db) throw new Error('Firebase not configured');
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Update profile
      if (userData.displayName) {
        await updateProfile(user, { displayName: userData.displayName });
      }
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Create user profile in Firestore
      await this.createUserProfile(user, userData);
      
      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  // Email/Password Sign In
  async signInWithEmail(email: string, password: string) {
    if (!auth) throw new Error('Firebase not configured');
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  },

  // Phone Authentication
  async sendPhoneVerification(phoneNumber: string, recaptchaContainer: string) {
    if (!auth) throw new Error('Firebase not configured');
    
    try {
      const recaptcha = new RecaptchaVerifier(auth, recaptchaContainer, {
        size: 'invisible'
      });
      
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptcha);
      return { confirmationResult, error: null };
    } catch (error: any) {
      return { confirmationResult: null, error: error.message };
    }
  },

  // Sign Out
  async signOut() {
    if (!auth) throw new Error('Firebase not configured');
    
    try {
      await signOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Password Reset
  async resetPassword(email: string) {
    if (!auth) throw new Error('Firebase not configured');
    
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Create user profile in Firestore
  async createUserProfile(user: FirebaseUser, additionalData: Partial<UserProfile> = {}) {
    if (!db) throw new Error('Firestore not configured');
    
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      username: additionalData.username || user.displayName || `user_${user.uid.slice(0, 8)}`,
      displayName: user.displayName || additionalData.displayName || '',
      photoURL: user.photoURL || additionalData.photoURL,
      bio: additionalData.bio || '',
      location: additionalData.location || '',
      verified: false,
      premium: false,
      followersCount: 0,
      followingCount: 0,
      likedSongsCount: 0,
      playlistsCount: 0,
      lastActive: serverTimestamp() as Timestamp,
      createdAt: serverTimestamp() as Timestamp,
      preferences: {
        theme: 'dark',
        notifications: true,
        publicProfile: true,
        shareActivity: true,
      },
      ...additionalData
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    return userProfile;
  },

  // Get current user
  getCurrentUser: () => auth?.currentUser || null,

  // Auth state listener
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    if (!auth) return () => {};
    return onAuthStateChanged(auth, callback);
  }
};

// Firebase Firestore Database Service
export const firebaseDB = {
  // Check if Firestore is available
  isAvailable: () => !!db && isFirebaseConfigured(),

  // User Profile Operations
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!db) return null;
    
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  async updateUserProfile(uid: string, updates: Partial<UserProfile>) {
    if (!db) return false;
    
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        ...updates,
        lastActive: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  },

  // Real-time user profile listener
  onUserProfileChange(uid: string, callback: (profile: UserProfile | null) => void) {
    if (!db) return () => {};
    
    const docRef = doc(db, 'users', uid);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as UserProfile);
      } else {
        callback(null);
      }
    });
  },

  // Song Operations
  async addSong(song: Omit<Song, 'id'>) {
    if (!db) return null;
    
    try {
      const docRef = await addDoc(collection(db, 'songs'), {
        ...song,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding song:', error);
      return null;
    }
  },

  async getSong(songId: string): Promise<Song | null> {
    if (!db) return null;
    
    try {
      const docRef = doc(db, 'songs', songId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Song;
      }
      return null;
    } catch (error) {
      console.error('Error getting song:', error);
      return null;
    }
  },

  // Get trending songs
  onTrendingSongs(callback: (songs: Song[]) => void, limitCount = 20) {
    if (!db) return () => {};
    
    const q = query(
      collection(db, 'songs'),
      orderBy('playCount', 'desc'),
      limit(limitCount)
    );
    
    return onSnapshot(q, (snapshot) => {
      const songs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Song[];
      callback(songs);
    });
  },

  // Playlist Operations
  async createPlaylist(playlist: Omit<Playlist, 'id'>) {
    if (!db) return null;
    
    try {
      const docRef = await addDoc(collection(db, 'playlists'), {
        ...playlist,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating playlist:', error);
      return null;
    }
  },

  // Get user playlists
  onUserPlaylists(userId: string, callback: (playlists: Playlist[]) => void) {
    if (!db) return () => {};
    
    const q = query(
      collection(db, 'playlists'),
      where('createdBy', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const playlists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Playlist[];
      callback(playlists);
    });
  },

  // Activity Operations
  async recordActivity(activity: Omit<UserActivity, 'id'>) {
    if (!db) return null;
    
    try {
      const docRef = await addDoc(collection(db, 'activities'), {
        ...activity,
        timestamp: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error recording activity:', error);
      return null;
    }
  },

  // Real-time friend activity
  onFriendActivity(friendIds: string[], callback: (activities: UserActivity[]) => void) {
    if (!db || friendIds.length === 0) return () => {};
    
    const q = query(
      collection(db, 'activities'),
      where('userId', 'in', friendIds),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserActivity[];
      callback(activities);
    });
  }
};

// Firebase Storage Service
export const firebaseStorage = {
  // Check if Storage is available
  isAvailable: () => !!storage && isFirebaseConfigured(),

  // Upload profile picture
  async uploadProfilePicture(file: File, userId: string) {
    if (!storage) return null;
    
    try {
      const fileRef = ref(storage, `profile-pictures/${userId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { url: downloadURL, error: null };
    } catch (error: any) {
      return { url: null, error: error.message };
    }
  },

  // Upload playlist cover
  async uploadPlaylistCover(file: File, playlistId: string) {
    if (!storage) return null;
    
    try {
      const fileRef = ref(storage, `playlist-covers/${playlistId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { url: downloadURL, error: null };
    } catch (error: any) {
      return { url: null, error: error.message };
    }
  },

  // Upload song file
  async uploadSong(file: File, songId: string) {
    if (!storage) return null;
    
    try {
      const fileRef = ref(storage, `songs/${songId}/${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { url: downloadURL, error: null };
    } catch (error: any) {
      return { url: null, error: error.message };
    }
  },

  // Delete file
  async deleteFile(filePath: string) {
    if (!storage) return false;
    
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
};

// Export everything
export { 
  app as firebase, 
  auth, 
  db as firestore, 
  storage,
  serverTimestamp,
  firebaseAuth,
  firebaseDB,
  firebaseStorage
};

export default app;
