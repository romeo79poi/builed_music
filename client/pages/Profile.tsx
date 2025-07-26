import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Settings,
  User,
  Mail,
  Phone,
  Edit3,
  Loader2,
  RefreshCw,
  Camera,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Send,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { sendFirebaseEmailVerification } from "../lib/auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

interface UserData {
  name: string;
  username: string;
  email: string;
  phone: string;
  profileImageURL: string;
  createdAt: any;
  verified: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSisSaving] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UserData>>({});

  // Fetch current user and their data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserData(user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string) => {
    try {
      setIsLoading(true);
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        // Merge Firebase auth verification status
        const userData = {
          ...data,
          emailVerified: currentUser?.emailVerified || false,
          phoneVerified: false, // We'll implement phone verification separately
        };
        setUserData(userData);
        setEditedData(userData);
        console.log("✅ User data fetched from Firestore:", userData);
      } else {
        console.warn("⚠️ No user document found in Firestore");
        toast({
          title: "Profile not found",
          description: "User profile data is missing. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      toast({
        title: "Error loading profile",
        description: "Failed to load your profile data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save updated profile data to Firestore
  const saveProfile = async () => {
    if (!currentUser || !userData) return;

    try {
      setSisSaving(true);
      const userDocRef = doc(db, "users", currentUser.uid);

      // Update only the changed fields
      const updateData = {
        ...editedData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userDocRef, updateData);

      // Update local state
      setUserData((prev) => (prev ? { ...prev, ...editedData } : null));
      setIsEditing(false);

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated",
      });

      console.log("✅ Profile updated in Firestore:", updateData);
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSisSaving(false);
    }
  };

  // Handle email verification
  const handleSendEmailVerification = async () => {
    if (!currentUser) return;

    try {
      setSendingVerification(true);
      const result = await sendFirebaseEmailVerification(currentUser);

      if (result.success) {
        toast({
          title: "Verification email sent!",
          description:
            "Please check your email and click the verification link.",
        });
      } else {
        toast({
          title: "Failed to send verification",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setSendingVerification(false);
    }
  };

  // Handle phone OTP (placeholder for now)
  const handleSendPhoneOTP = async () => {
    toast({
      title: "Coming soon",
      description: "Phone verification will be available soon!",
    });
  };

  // Handle input changes
  const handleInputChange = (field: keyof UserData, value: string) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditedData(userData || {});
    setIsEditing(false);
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (currentUser) {
      await fetchUserData(currentUser.uid);
      toast({
        title: "Profile refreshed",
        description: "Your profile data has been updated",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-neon-green mx-auto mb-4" />
          <p className="text-white">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-400 mb-4">
            We couldn't load your profile data
          </p>
          <Button
            onClick={() => navigate("/home")}
            className="bg-neon-green text-black"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-darker via-background to-purple-dark text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-primary/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-secondary/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 pt-12"
        >
          <button
            onClick={() => navigate("/home")}
            className="w-10 h-10 bg-purple-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-purple-primary/30 transition-all duration-200 border border-purple-primary/30"
          >
            <ArrowLeft className="w-5 h-5 text-purple-primary" />
          </button>

          <h1 className="text-xl font-bold">My Profile</h1>

          <div className="flex items-center space-x-2">
            <button
              onClick={refreshProfile}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors"
              title="Refresh Profile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-6 py-8"
        >
          <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
            {/* Profile Picture & Basic Info */}
            <div className="text-center mb-6">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-neon-green to-neon-blue rounded-full p-1">
                  <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                    {userData.profileImageURL ? (
                      <img
                        src={userData.profileImageURL}
                        alt={userData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                </div>
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-neon-green rounded-full flex items-center justify-center text-black">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {!isEditing ? (
                  <>
                    <h2 className="text-2xl font-bold">{userData.name}</h2>
                    <p className="text-gray-400">@{userData.username}</p>
                  </>
                ) : (
                  <div className="space-y-3 max-w-sm mx-auto">
                    <Input
                      value={editedData.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Full Name"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                    <Input
                      value={editedData.username || ""}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      placeholder="Username"
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-neon-green" />
                Contact Information
              </h3>

              {/* Email */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {!isEditing ? (
                        <span className="text-white">{userData.email}</span>
                      ) : (
                        <Input
                          value={editedData.email || ""}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="Email address"
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {userData.emailVerified ? (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-500">
                            Verified
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs text-yellow-500">
                            Not verified
                          </span>
                          <button
                            onClick={handleSendEmailVerification}
                            disabled={sendingVerification}
                            className="text-xs text-neon-green hover:text-neon-blue font-medium flex items-center space-x-1"
                          >
                            {sendingVerification ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            <span>Verify</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {!isEditing ? (
                        <span className="text-white">
                          {userData.phone || "Not provided"}
                        </span>
                      ) : (
                        <Input
                          value={editedData.phone || ""}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="Phone number"
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {userData.phoneVerified ? (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-500">
                            Verified
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs text-yellow-500">
                            Not verified
                          </span>
                          {userData.phone && (
                            <button
                              onClick={handleSendPhoneOTP}
                              className="text-xs text-neon-green hover:text-neon-blue font-medium flex items-center space-x-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Send OTP</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-neon-blue" />
                Account Information
              </h3>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">User ID:</span>
                  <span className="text-white font-mono text-xs">
                    {currentUser?.uid}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Member since:</span>
                  <span className="text-white">
                    {userData.createdAt?.toDate?.()?.toLocaleDateString() ||
                      "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profile status:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-500">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-white/10">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-neon-green to-neon-blue text-black font-semibold"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-3">
                  <Button
                    onClick={saveProfile}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-neon-green to-neon-blue text-black font-semibold"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    onClick={cancelEditing}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Additional Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-6 pb-8"
        >
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/edit-profile")}
              className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <User className="w-6 h-6 text-neon-green mx-auto mb-2" />
              <p className="text-sm font-medium">Edit Details</p>
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Settings className="w-6 h-6 text-neon-blue mx-auto mb-2" />
              <p className="text-sm font-medium">Settings</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
