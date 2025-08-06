import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Camera,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Globe,
  Star,
  Eye,
  EyeOff,
  Check,
  X,
  Save,
  Edit3,
  AlertTriangle,
  Info,
  Verified,
  Crown,
  Award,
  Sparkles,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import MobileFooter from "../components/MobileFooter";
import { useFirebase } from "../context/FirebaseContext";
import { updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function EditAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: firebaseUser, loading: firebaseLoading } = useFirebase();

  // User account data - will be loaded from Firebase and backend
  const [accountData, setAccountData] = useState({
    // Basic Info
    fullName: "",
    username: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",

    // Address Info
    country: "",
    city: "",
    address: "",
    zipCode: "",

    // Account Info
    accountType: "Free",
    memberSince: "",
    isVerified: false,
    twoFactorEnabled: false,

    // Profile
    profileImage: "",
    bio: "",
    website: "",
  });

  const [dataLoading, setDataLoading] = useState(true);

  // Form states
  const [editMode, setEditMode] = useState({
    basic: false,
    contact: false,
    address: false,
    security: false,
    profile: false,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load user data from Firebase and backend
  useEffect(() => {
    if (!firebaseLoading) {
      if (firebaseUser) {
        loadUserAccountData();
      } else {
        navigate("/login");
      }
    }
  }, [firebaseUser, firebaseLoading]);

  const loadUserAccountData = async () => {
    try {
      setDataLoading(true);

      if (!firebaseUser) {
        console.log("❌ No Firebase user found");
        return;
      }

      console.log("🔥 Loading account data for Firebase user:", firebaseUser.email);

      // Set initial Firebase data
      const firebaseData = {
        fullName: firebaseUser.displayName || "",
        username: firebaseUser.email?.split('@')[0] || "",
        email: firebaseUser.email || "",
        phone: firebaseUser.phoneNumber || "",
        dateOfBirth: "",
        gender: "",
        country: "",
        city: "",
        address: "",
        zipCode: "",
        accountType: "Free",
        memberSince: firebaseUser.metadata.creationTime
          ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            })
          : "Unknown",
        isVerified: firebaseUser.emailVerified,
        twoFactorEnabled: false,
        profileImage: firebaseUser.photoURL || `https://ui-avatars.io/api/?name=${encodeURIComponent(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User')}&background=6366f1&color=fff&size=150`,
        bio: "",
        website: "",
      };

      setAccountData(firebaseData);
      console.log("✅ Firebase account data loaded:", firebaseData);

      // Try to fetch additional data from backend
      try {
        const response = await fetch(`/api/v1/users/${firebaseUser.uid}`, {
          headers: {
            "user-id": firebaseUser.uid,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const backendData = result.data;
            const enhancedData = {
              ...firebaseData,
              fullName: backendData.display_name || backendData.full_name || firebaseData.fullName,
              username: backendData.username || firebaseData.username,
              phone: backendData.phone || firebaseData.phone,
              dateOfBirth: backendData.date_of_birth || "",
              gender: backendData.gender || "",
              country: backendData.country || "",
              city: backendData.city || "",
              address: backendData.address || "",
              zipCode: backendData.zip_code || "",
              accountType: backendData.premium ? "Premium" : "Free",
              bio: backendData.bio || "",
              website: backendData.website || "",
              profileImage: backendData.profile_image_url || firebaseData.profileImage,
            };
            setAccountData(enhancedData);
            console.log("✅ Enhanced account data from backend:", enhancedData);
          }
        } else {
          console.warn("⚠️ Backend user fetch returned:", response.status);
        }
      } catch (backendError) {
        console.warn("⚠️ Backend fetch failed, using Firebase data only:", backendError);
      }
    } catch (error) {
      console.error("❌ Error loading account data:", error);
      toast({
        title: "Error Loading Account",
        description: "Failed to load account data. Please try refreshing.",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleSaveSection = async (section: string) => {
    if (!firebaseUser) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔥 Saving section:", section, "for user:", firebaseUser.uid);

      // Update Firebase profile if it's basic info
      if (section === 'basic' && (accountData.fullName !== firebaseUser.displayName)) {
        try {
          await updateProfile(firebaseUser, {
            displayName: accountData.fullName,
            photoURL: accountData.profileImage,
          });
          console.log("✅ Firebase profile updated");
        } catch (firebaseError) {
          console.error("⚠️ Firebase profile update failed:", firebaseError);
        }
      }

      // Try to save to backend
      try {
        const updateData = {
          display_name: accountData.fullName,
          username: accountData.username,
          phone: accountData.phone,
          date_of_birth: accountData.dateOfBirth,
          gender: accountData.gender,
          country: accountData.country,
          city: accountData.city,
          address: accountData.address,
          zip_code: accountData.zipCode,
          bio: accountData.bio,
          website: accountData.website,
          profile_image_url: accountData.profileImage,
        };

        const response = await fetch(`/api/v1/users/${firebaseUser.uid}`, {
          method: 'PUT',
          headers: {
            "user-id": firebaseUser.uid,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("✅ Backend update successful:", result);
        } else {
          console.warn("⚠️ Backend update failed:", response.status);
          // Continue anyway since Firebase data is updated
        }
      } catch (backendError) {
        console.warn("⚠️ Backend update failed:", backendError);
        // Continue anyway since Firebase data is updated
      }

      // Save to localStorage as backup
      const userDataKey = `firebase_account_${firebaseUser.uid}`;
      localStorage.setItem(userDataKey, JSON.stringify(accountData));

      setEditMode((prev) => ({ ...prev, [section]: false }));

      toast({
        title: "Changes Saved",
        description: `Your ${section} information has been updated successfully`,
      });
    } catch (error) {
      console.error("❌ Error saving section:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!firebaseUser) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    if (!passwords.current) {
      toast({
        title: "Error",
        description: "Current password is required",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔥 Updating password for Firebase user:", firebaseUser.email);

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        firebaseUser.email!,
        passwords.current
      );

      await reauthenticateWithCredential(firebaseUser, credential);
      console.log("✅ User re-authenticated successfully");

      // Update password in Firebase
      await updatePassword(firebaseUser, passwords.new);
      console.log("✅ Password updated in Firebase");

      setPasswords({ current: "", new: "", confirm: "" });
      setEditMode((prev) => ({ ...prev, security: false }));

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully",
      });
    } catch (error: any) {
      console.error("❌ Password update failed:", error);

      let errorMessage = "Failed to update password. Please try again.";

      if (error.code === 'auth/wrong-password') {
        errorMessage = "Current password is incorrect";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "New password is too weak";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Please log out and log back in, then try again";
      }

      toast({
        title: "Password Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && firebaseUser) {
      setIsLoading(true);

      try {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: "Please select an image smaller than 5MB",
            variant: "destructive",
          });
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File Type",
            description: "Please select a valid image file",
            variant: "destructive",
          });
          return;
        }

        console.log("🔥 Uploading profile image for Firebase user:", firebaseUser.uid);

        const reader = new FileReader();
        reader.onload = async (e) => {
          const newImage = e.target?.result as string;

          // Update local state immediately for better UX
          setAccountData((prev) => ({ ...prev, profileImage: newImage }));

          try {
            // Update Firebase profile
            await updateProfile(firebaseUser, {
              photoURL: newImage,
            });
            console.log("✅ Firebase profile image updated");

            // Try to update backend
            try {
              const response = await fetch(`/api/v1/users/${firebaseUser.uid}`, {
                method: 'PUT',
                headers: {
                  "user-id": firebaseUser.uid,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  profile_image_url: newImage,
                }),
              });

              if (response.ok) {
                console.log("✅ Backend profile image updated");
              }
            } catch (backendError) {
              console.warn("⚠️ Backend image update failed:", backendError);
            }

            // Save to localStorage
            const userDataKey = `firebase_account_${firebaseUser.uid}`;
            const currentData = JSON.parse(localStorage.getItem(userDataKey) || '{}');
            localStorage.setItem(userDataKey, JSON.stringify({
              ...currentData,
              profileImage: newImage,
            }));

            toast({
              title: "Profile Image Updated",
              description: "Your profile image has been updated successfully",
            });
          } catch (error) {
            console.error("❌ Profile image update failed:", error);
            toast({
              title: "Update Failed",
              description: "Failed to update profile image. Please try again.",
              variant: "destructive",
            });
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("❌ Image upload error:", error);
        toast({
          title: "Upload Failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-darker via-purple-dark to-background text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-primary/8 via-purple-secondary/4 to-purple-accent/6"></div>

      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-1/4 w-24 h-24 border border-purple-primary/20 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/3 left-1/4 w-16 h-16 border border-purple-secondary/20 rounded-full"
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-xl border-b border-purple-primary/20"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-purple-dark/50 backdrop-blur-sm flex items-center justify-center border border-purple-primary/30"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>

          <h1 className="text-xl font-bold text-white">Edit Account</h1>

          <div className="w-10 h-10"></div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-32">
          {/* Profile Overview */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-6"
          >
            <div className="bg-gradient-to-r from-purple-dark/40 to-purple-primary/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-primary/30">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={accountData.profileImage}
                    alt={accountData.fullName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-neon-green/50"
                  />
                  {accountData.isVerified && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center border-2 border-background">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-xl font-bold text-white">
                      {accountData.fullName}
                    </h2>
                    {accountData.accountType === "Premium" && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                        <Crown className="w-3 h-3 text-black" />
                        <span className="text-xs font-bold text-black">
                          PREMIUM
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400">@{accountData.username}</p>
                  <p className="text-sm text-purple-primary">
                    Member since {accountData.memberSince}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Account Sections */}
          <div className="px-6 space-y-6">
            {/* Basic Information */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-purple-dark/30 backdrop-blur-sm rounded-2xl border border-purple-primary/20 overflow-hidden"
            >
              <div className="p-4 border-b border-purple-primary/20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-purple-primary" />
                  <h3 className="text-lg font-semibold text-white">
                    Basic Information
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setEditMode((prev) => ({ ...prev, basic: !prev.basic }))
                  }
                  className="p-2 rounded-full hover:bg-purple-primary/20 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>

              <div className="p-4 space-y-4">
                {editMode.basic ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={accountData.fullName}
                          onChange={(e) =>
                            setAccountData((prev) => ({
                              ...prev,
                              fullName: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={accountData.username}
                          onChange={(e) =>
                            setAccountData((prev) => ({
                              ...prev,
                              username: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={accountData.dateOfBirth}
                          onChange={(e) =>
                            setAccountData((prev) => ({
                              ...prev,
                              dateOfBirth: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Gender
                        </label>
                        <select
                          value={accountData.gender}
                          onChange={(e) =>
                            setAccountData((prev) => ({
                              ...prev,
                              gender: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white focus:outline-none focus:border-purple-primary/60"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">
                            Prefer not to say
                          </option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        rows={3}
                        value={accountData.bio}
                        onChange={(e) =>
                          setAccountData((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setEditMode((prev) => ({ ...prev, basic: false }))
                        }
                        className="flex-1 p-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white font-medium"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSaveSection("basic")}
                        disabled={isLoading}
                        className="flex-1 p-3 bg-gradient-to-r from-purple-primary to-purple-secondary rounded-xl text-white font-medium flex items-center justify-center space-x-2"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>Save</span>
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Full Name</p>
                      <p className="text-white font-medium">
                        {accountData.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Username</p>
                      <p className="text-white font-medium">
                        @{accountData.username}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Date of Birth</p>
                      <p className="text-white font-medium">
                        {new Date(accountData.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Gender</p>
                      <p className="text-white font-medium">
                        {accountData.gender}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-400">Bio</p>
                      <p className="text-white font-medium">
                        {accountData.bio}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Contact Information */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-purple-dark/30 backdrop-blur-sm rounded-2xl border border-purple-primary/20 overflow-hidden"
            >
              <div className="p-4 border-b border-purple-primary/20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-purple-primary" />
                  <h3 className="text-lg font-semibold text-white">
                    Contact Information
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setEditMode((prev) => ({ ...prev, contact: !prev.contact }))
                  }
                  className="p-2 rounded-full hover:bg-purple-primary/20 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>

              <div className="p-4 space-y-4">
                {editMode.contact ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={accountData.email}
                            onChange={(e) =>
                              setAccountData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className="w-full pl-10 pr-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="tel"
                            value={accountData.phone}
                            onChange={(e) =>
                              setAccountData((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            className="w-full pl-10 pr-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Website
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="url"
                            value={accountData.website}
                            onChange={(e) =>
                              setAccountData((prev) => ({
                                ...prev,
                                website: e.target.value,
                              }))
                            }
                            className="w-full pl-10 pr-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                            placeholder="https://"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setEditMode((prev) => ({ ...prev, contact: false }))
                        }
                        className="flex-1 p-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white font-medium"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSaveSection("contact")}
                        disabled={isLoading}
                        className="flex-1 p-3 bg-gradient-to-r from-purple-primary to-purple-secondary rounded-xl text-white font-medium flex items-center justify-center space-x-2"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>Save</span>
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Email Address</p>
                      <p className="text-white font-medium">
                        {accountData.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone Number</p>
                      <p className="text-white font-medium">
                        {accountData.phone}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-400">Website</p>
                      <p className="text-white font-medium">
                        {accountData.website}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Address Information */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-purple-dark/30 backdrop-blur-sm rounded-2xl border border-purple-primary/20 overflow-hidden"
            >
              <div className="p-4 border-b border-purple-primary/20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-purple-primary" />
                  <h3 className="text-lg font-semibold text-white">
                    Address Information
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setEditMode((prev) => ({ ...prev, address: !prev.address }))
                  }
                  className="p-2 rounded-full hover:bg-purple-primary/20 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>

              <div className="p-4 space-y-4">
                {editMode.address ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={accountData.country}
                          onChange={(e) =>
                            setAccountData((prev) => ({
                              ...prev,
                              country: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={accountData.city}
                          onChange={(e) =>
                            setAccountData((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={accountData.address}
                          onChange={(e) =>
                            setAccountData((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={accountData.zipCode}
                          onChange={(e) =>
                            setAccountData((prev) => ({
                              ...prev,
                              zipCode: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setEditMode((prev) => ({ ...prev, address: false }))
                        }
                        className="flex-1 p-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white font-medium"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSaveSection("address")}
                        disabled={isLoading}
                        className="flex-1 p-3 bg-gradient-to-r from-purple-primary to-purple-secondary rounded-xl text-white font-medium flex items-center justify-center space-x-2"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>Save</span>
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Country</p>
                      <p className="text-white font-medium">
                        {accountData.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">City</p>
                      <p className="text-white font-medium">
                        {accountData.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Address</p>
                      <p className="text-white font-medium">
                        {accountData.address}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">ZIP Code</p>
                      <p className="text-white font-medium">
                        {accountData.zipCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Security Settings */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-purple-dark/30 backdrop-blur-sm rounded-2xl border border-purple-primary/20 overflow-hidden"
            >
              <div className="p-4 border-b border-purple-primary/20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-purple-primary" />
                  <h3 className="text-lg font-semibold text-white">
                    Security Settings
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setEditMode((prev) => ({
                      ...prev,
                      security: !prev.security,
                    }))
                  }
                  className="p-2 rounded-full hover:bg-purple-primary/20 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-gray-400" />
                </motion.button>
              </div>

              <div className="p-4 space-y-4">
                {editMode.security ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwords.current}
                            onChange={(e) =>
                              setPasswords((prev) => ({
                                ...prev,
                                current: e.target.value,
                              }))
                            }
                            className="w-full pl-10 pr-12 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                current: !prev.current,
                              }))
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwords.new}
                            onChange={(e) =>
                              setPasswords((prev) => ({
                                ...prev,
                                new: e.target.value,
                              }))
                            }
                            className="w-full pl-10 pr-12 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                new: !prev.new,
                              }))
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPasswords.new ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwords.confirm}
                            onChange={(e) =>
                              setPasswords((prev) => ({
                                ...prev,
                                confirm: e.target.value,
                              }))
                            }
                            className="w-full pl-10 pr-12 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                confirm: !prev.confirm,
                              }))
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-amber-400 mt-0.5" />
                        <div>
                          <h4 className="text-amber-400 font-medium mb-1">
                            Password Requirements
                          </h4>
                          <ul className="text-sm text-amber-300/80 space-y-1">
                            <li>• At least 8 characters long</li>
                            <li>• Include uppercase and lowercase letters</li>
                            <li>• Include at least one number</li>
                            <li>• Include at least one special character</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setEditMode((prev) => ({ ...prev, security: false }));
                          setPasswords({ current: "", new: "", confirm: "" });
                        }}
                        className="flex-1 p-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white font-medium"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePasswordChange}
                        disabled={isLoading}
                        className="flex-1 p-3 bg-gradient-to-r from-purple-primary to-purple-secondary rounded-xl text-white font-medium flex items-center justify-center space-x-2"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>Change Password</span>
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                          <h4 className="text-white font-medium">Password</h4>
                          <p className="text-sm text-gray-400">
                            Last updated 2 months ago
                          </p>
                        </div>
                      </div>
                      <Check className="w-5 h-5 text-green-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                          <h4 className="text-white font-medium">
                            Two-Factor Authentication
                          </h4>
                          <p className="text-sm text-gray-400">
                            Enabled for extra security
                          </p>
                        </div>
                      </div>
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Account Status */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-purple-dark/30 backdrop-blur-sm rounded-2xl border border-purple-primary/20 overflow-hidden"
            >
              <div className="p-4 border-b border-purple-primary/20">
                <div className="flex items-center space-x-3">
                  <Star className="w-5 h-5 text-purple-primary" />
                  <h3 className="text-lg font-semibold text-white">
                    Account Status
                  </h3>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <div>
                        <h4 className="text-white font-medium">
                          Premium Account
                        </h4>
                        <p className="text-sm text-gray-400">
                          Active subscription
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full">
                      ACTIVE
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <div>
                        <h4 className="text-white font-medium">
                          Verified Account
                        </h4>
                        <p className="text-sm text-gray-400">
                          Identity confirmed
                        </p>
                      </div>
                    </div>
                    <Check className="w-5 h-5 text-purple-400" />
                  </div>
                </div>

                <div className="p-4 bg-purple-primary/10 border border-purple-primary/30 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="w-5 h-5 text-purple-primary" />
                    <h4 className="text-white font-medium">
                      Membership Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Member Since</p>
                      <p className="text-white font-medium">
                        {accountData.memberSince}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Account Type</p>
                      <p className="text-white font-medium">
                        {accountData.accountType}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </main>

        {/* Mobile Footer */}
        <MobileFooter />
      </div>
    </div>
  );
}
