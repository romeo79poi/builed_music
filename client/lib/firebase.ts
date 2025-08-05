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

// Firebase configuration for CATCH Music App
const firebaseConfig = {
  apiKey: "AIzaSyAqlECno9m_k7b_vFf1qW6LBnP-1BGhnPA",
  authDomain: "music-catch-59b79.firebaseapp.com",
  projectId: "music-catch-59b79",
  storageBucket: "music-catch-59b79.firebasestorage.app",
  messagingSenderId: "185813176462",
  appId: "1:185813176462:web:8269607d16eb315f55b9df",
  measurementId: "G-PBGMC7JZR3"
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
      console.log('🔥 Firebase initialized successfully for CATCH Music');
    } else {
      app = getApps()[0];
    }
    
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    console.log('🔥 Firebase services ready for CATCH');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
  }
} else {
  console.warn('⚠️ Firebase not configured properly');
}

// Export configured status
export { isFirebaseConfigured };

// User profile interface for CATCH
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

// Firebase Authentication Service for CATCH
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
      console.log('✅ Google sign-in successful:', result.user.email);
      return { user: result.user, error: null };
    } catch (error: any) {
      console.error('❌ Google sign-in failed:', error);
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
      console.log('✅ Facebook sign-in successful:', result.user.email);
      return { user: result.user, error: null };
    } catch (error: any) {
      console.error('❌ Facebook sign-in failed:', error);
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
      
      console.log('✅ Email signup successful:', user.email);
      return { user, error: null };
    } catch (error: any) {
      console.error('❌ Email signup failed:', error);
      return { user: null, error: error.message };
    }
  },

  // Email/Password Sign In
  async signInWithEmail(email: string, password: string) {
    if (!auth) throw new Error('Firebase not configured');
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Email sign-in successful:', result.user.email);
      return { user: result.user, error: null };
    } catch (error: any) {
      console.error('❌ Email sign-in failed:', error);
      return { user: null, error: error.message };
    }
  },

  // Sign Out
  async signOut() {
    if (!auth) throw new Error('Firebase not configured');
    
    try {
      await signOut(auth);
      console.log('✅ Sign out successful');
      return { error: null };
    } catch (error: any) {
      console.error('❌ Sign out failed:', error);
      return { error: error.message };
    }
  },

  // Password Reset
  async resetPassword(email: string) {
    if (!auth) throw new Error('Firebase not configured');
    
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent');
      return { error: null };
    } catch (error: any) {
      console.error('❌ Password reset failed:', error);
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
    console.log('✅ User profile created for:', user.email);
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

// Firebase Firestore Database Service for CATCH
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
  }
};

// Firebase Storage Service for CATCH
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
      console.log('✅ Profile picture uploaded');
      return { url: downloadURL, error: null };
    } catch (error: any) {
      console.error('❌ Profile picture upload failed:', error);
      return { url: null, error: error.message };
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
