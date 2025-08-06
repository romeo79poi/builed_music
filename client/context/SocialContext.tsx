import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFirebase } from './FirebaseContext';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SocialUser {
  id: string;
  displayName: string;
  username: string;
  avatar: string;
  bio: string;
  isVerified: boolean;
  isOnline: boolean;
  lastSeen?: Date;
  location?: string;
}

interface FollowRelationship {
  id: string;
  followerId: string;
  followingId: string;
  followerData: SocialUser;
  followingData: SocialUser;
  createdAt: Date;
  isActive: boolean;
}

interface Notification {
  id: string;
  type: 'follow' | 'message' | 'like' | 'comment' | 'mention';
  fromUserId: string;
  fromUserData: SocialUser;
  toUserId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  data?: any; // Additional notification data
}

interface SocialContextType {
  // Following system
  followers: FollowRelationship[];
  following: FollowRelationship[];
  followersCount: number;
  followingCount: number;
  isFollowing: (userId: string) => boolean;
  followUser: (userId: string, userData: SocialUser) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;
  getMutualFollowers: (userId: string) => Promise<SocialUser[]>;
  
  // Notifications
  notifications: Notification[];
  unreadNotifications: number;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  
  // User discovery
  getSuggestedUsers: () => Promise<SocialUser[]>;
  searchUsers: (query: string) => Promise<SocialUser[]>;
  getNearbyUsers: (location?: string) => Promise<SocialUser[]>;
  
  // Activity
  getUserActivity: (userId: string) => Promise<any[]>;
  recordActivity: (type: string, data: any) => Promise<void>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

interface SocialProviderProps {
  children: ReactNode;
}

export const SocialProvider: React.FC<SocialProviderProps> = ({ children }) => {
  const { user: firebaseUser } = useFirebase();
  
  // State
  const [followers, setFollowers] = useState<FollowRelationship[]>([]);
  const [following, setFollowing] = useState<FollowRelationship[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const followersCount = followers.filter(f => f.isActive).length;
  const followingCount = following.filter(f => f.isActive).length;
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  // Load user's social data when Firebase user changes
  useEffect(() => {
    if (firebaseUser && db) {
      loadSocialData();
      setupRealtimeListeners();
    } else {
      // Clear data when user logs out
      setFollowers([]);
      setFollowing([]);
      setNotifications([]);
    }
  }, [firebaseUser]);

  const loadSocialData = async () => {
    if (!firebaseUser || !db) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load followers
      const followersQuery = query(
        collection(db, 'follows'),
        where('followingId', '==', firebaseUser.uid),
        where('isActive', '==', true)
      );
      const followersSnapshot = await getDocs(followersQuery);
      const followersData = followersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FollowRelationship[];

      // Load following
      const followingQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', firebaseUser.uid),
        where('isActive', '==', true)
      );
      const followingSnapshot = await getDocs(followingQuery);
      const followingData = followingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FollowRelationship[];

      // Load notifications
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('toUserId', '==', firebaseUser.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const notificationsData = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Notification[];

      setFollowers(followersData);
      setFollowing(followingData);
      setNotifications(notificationsData);

    } catch (err: any) {
      console.error('Error loading social data:', err);
      setError(err.message || 'Failed to load social data');
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    if (!firebaseUser || !db) return;

    // Listen to followers changes
    const followersQuery = query(
      collection(db, 'follows'),
      where('followingId', '==', firebaseUser.uid)
    );
    
    const unsubscribeFollowers = onSnapshot(followersQuery, (snapshot) => {
      const followersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FollowRelationship[];
      setFollowers(followersData);
    });

    // Listen to following changes
    const followingQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', firebaseUser.uid)
    );
    
    const unsubscribeFollowing = onSnapshot(followingQuery, (snapshot) => {
      const followingData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FollowRelationship[];
      setFollowing(followingData);
    });

    // Listen to notifications
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('toUserId', '==', firebaseUser.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Notification[];
      setNotifications(notificationsData);
    });

    // Cleanup function
    return () => {
      unsubscribeFollowers();
      unsubscribeFollowing();
      unsubscribeNotifications();
    };
  };

  const isFollowing = (userId: string): boolean => {
    return following.some(f => f.followingId === userId && f.isActive);
  };

  const followUser = async (userId: string, userData: SocialUser): Promise<boolean> => {
    if (!firebaseUser || !db || userId === firebaseUser.uid) return false;

    try {
      // Check if already following
      if (isFollowing(userId)) {
        console.log('Already following this user');
        return false;
      }

      // Get current user data
      const currentUserData = localStorage.getItem('currentUser');
      const parsedUserData = currentUserData ? JSON.parse(currentUserData) : null;

      const currentUser: SocialUser = {
        id: firebaseUser.uid,
        displayName: parsedUserData?.name || firebaseUser.displayName || 'User',
        username: parsedUserData?.username || firebaseUser.email?.split('@')[0] || 'user',
        avatar: parsedUserData?.profileImageURL || firebaseUser.photoURL || '',
        bio: parsedUserData?.bio || '',
        isVerified: firebaseUser.emailVerified || false,
        isOnline: true,
      };

      // Create follow relationship
      const followData = {
        followerId: firebaseUser.uid,
        followingId: userId,
        followerData: currentUser,
        followingData: userData,
        createdAt: serverTimestamp(),
        isActive: true,
      };

      await addDoc(collection(db, 'follows'), followData);

      // Create notification for the followed user
      const notificationData = {
        type: 'follow',
        fromUserId: firebaseUser.uid,
        fromUserData: currentUser,
        toUserId: userId,
        content: `${currentUser.displayName} started following you`,
        isRead: false,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'notifications'), notificationData);

      console.log(`Successfully followed ${userData.displayName}`);
      return true;

    } catch (err: any) {
      console.error('Error following user:', err);
      setError(err.message || 'Failed to follow user');
      return false;
    }
  };

  const unfollowUser = async (userId: string): Promise<boolean> => {
    if (!firebaseUser || !db) return false;

    try {
      // Find the follow relationship
      const followRelationship = following.find(f => f.followingId === userId && f.isActive);
      if (!followRelationship) {
        console.log('Not following this user');
        return false;
      }

      // Mark as inactive instead of deleting
      const followRef = doc(db, 'follows', followRelationship.id);
      await updateDoc(followRef, {
        isActive: false,
        unfollowedAt: serverTimestamp(),
      });

      console.log(`Successfully unfollowed user ${userId}`);
      return true;

    } catch (err: any) {
      console.error('Error unfollowing user:', err);
      setError(err.message || 'Failed to unfollow user');
      return false;
    }
  };

  const getMutualFollowers = async (userId: string): Promise<SocialUser[]> => {
    if (!firebaseUser || !db) return [];

    try {
      // Get users that both current user and target user follow
      const currentUserFollowing = following.map(f => f.followingId);
      
      const targetUserFollowingQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', userId),
        where('isActive', '==', true)
      );
      
      const targetUserFollowingSnapshot = await getDocs(targetUserFollowingQuery);
      const targetUserFollowing = targetUserFollowingSnapshot.docs.map(doc => doc.data().followingId);

      // Find mutual follows
      const mutualFollowIds = currentUserFollowing.filter(id => targetUserFollowing.includes(id));
      
      // Get user data for mutual follows
      const mutualUsers: SocialUser[] = [];
      for (const userId of mutualFollowIds.slice(0, 10)) { // Limit to 10
        const followRelationship = following.find(f => f.followingId === userId);
        if (followRelationship) {
          mutualUsers.push(followRelationship.followingData);
        }
      }

      return mutualUsers;

    } catch (err: any) {
      console.error('Error getting mutual followers:', err);
      return [];
    }
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    if (!db) return;

    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllNotificationsAsRead = async (): Promise<void> => {
    if (!firebaseUser || !db) return;

    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      for (const notification of unreadNotifications) {
        const notificationRef = doc(db, 'notifications', notification.id);
        await updateDoc(notificationRef, {
          isRead: true,
          readAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const getSuggestedUsers = async (): Promise<SocialUser[]> => {
    // This would typically involve complex algorithms
    // For now, return empty array - can be enhanced with actual suggestions
    return [];
  };

  const searchUsers = async (query: string): Promise<SocialUser[]> => {
    if (!db || !query.trim()) return [];

    try {
      // Search by username (simple text search)
      const usersQuery = query(
        collection(db, 'users'),
        where('username', '>=', query.toLowerCase()),
        where('username', '<=', query.toLowerCase() + '\uf8ff'),
        limit(20)
      );

      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SocialUser[];

      return users;

    } catch (err: any) {
      console.error('Error searching users:', err);
      return [];
    }
  };

  const getNearbyUsers = async (location?: string): Promise<SocialUser[]> => {
    // Placeholder for location-based user discovery
    // Would require geolocation integration
    return [];
  };

  const getUserActivity = async (userId: string): Promise<any[]> => {
    if (!db) return [];

    try {
      const activityQuery = query(
        collection(db, 'activities'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const activitySnapshot = await getDocs(activityQuery);
      return activitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

    } catch (err: any) {
      console.error('Error getting user activity:', err);
      return [];
    }
  };

  const recordActivity = async (type: string, data: any): Promise<void> => {
    if (!firebaseUser || !db) return;

    try {
      const activityData = {
        userId: firebaseUser.uid,
        type,
        data,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'activities'), activityData);
    } catch (err: any) {
      console.error('Error recording activity:', err);
    }
  };

  const contextValue: SocialContextType = {
    // Following system
    followers,
    following,
    followersCount,
    followingCount,
    isFollowing,
    followUser,
    unfollowUser,
    getMutualFollowers,
    
    // Notifications
    notifications,
    unreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    
    // User discovery
    getSuggestedUsers,
    searchUsers,
    getNearbyUsers,
    
    // Activity
    getUserActivity,
    recordActivity,
    
    // Loading states
    isLoading,
    error,
  };

  return (
    <SocialContext.Provider value={contextValue}>
      {children}
    </SocialContext.Provider>
  );
};

export default SocialContext;
