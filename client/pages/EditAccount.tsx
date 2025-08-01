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

export default function EditAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // User account data
  const [accountData, setAccountData] = useState({
    // Basic Info
    fullName: "John Doe",
    username: "johndoe123",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1995-06-15",
    gender: "Male",
    
    // Address Info
    country: "United States",
    city: "Los Angeles",
    address: "123 Music Street, Beverly Hills",
    zipCode: "90210",
    
    // Account Info
    accountType: "Premium",
    memberSince: "January 2024",
    isVerified: true,
    twoFactorEnabled: true,
    
    // Profile
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "Music enthusiast and audio lover. Always discovering new beats and sharing great music with the community.",
    website: "www.johndoe-music.com",
  });

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

  const handleSaveSection = async (section: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setEditMode(prev => ({ ...prev, [section]: false }));
    setIsLoading(false);
    
    toast({
      title: "Changes Saved",
      description: `Your ${section} information has been updated successfully`,
    });
  };

  const handlePasswordChange = async () => {
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setPasswords({ current: "", new: "", confirm: "" });
    setEditMode(prev => ({ ...prev, security: false }));
    setIsLoading(false);
    
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully",
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = e.target?.result as string;
        setAccountData(prev => ({ ...prev, profileImage: newImage }));
        toast({
          title: "Profile Image Updated",
          description: "Your profile image has been updated successfully",
        });
      };
      reader.readAsDataURL(file);
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
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-background">
                      <Verified className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-xl font-bold text-white">{accountData.fullName}</h2>
                    {accountData.accountType === "Premium" && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                        <Crown className="w-3 h-3 text-black" />
                        <span className="text-xs font-bold text-black">PREMIUM</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400">@{accountData.username}</p>
                  <p className="text-sm text-purple-primary">Member since {accountData.memberSince}</p>
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
                  <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditMode(prev => ({ ...prev, basic: !prev.basic }))}
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={accountData.fullName}
                          onChange={(e) => setAccountData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                        <input
                          type="text"
                          value={accountData.username}
                          onChange={(e) => setAccountData(prev => ({ ...prev, username: e.target.value }))}
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={accountData.dateOfBirth}
                          onChange={(e) => setAccountData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                        <select
                          value={accountData.gender}
                          onChange={(e) => setAccountData(prev => ({ ...prev, gender: e.target.value }))}
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white focus:outline-none focus:border-purple-primary/60"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                      <textarea
                        rows={3}
                        value={accountData.bio}
                        onChange={(e) => setAccountData(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setEditMode(prev => ({ ...prev, basic: false }))}
                        className="flex-1 p-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white font-medium"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSaveSection('basic')}
                        disabled={isLoading}
                        className="flex-1 p-3 bg-gradient-to-r from-purple-primary to-purple-secondary rounded-xl text-white font-medium flex items-center justify-center space-x-2"
                      >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Save</span>
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Full Name</p>
                      <p className="text-white font-medium">{accountData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Username</p>
                      <p className="text-white font-medium">@{accountData.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Date of Birth</p>
                      <p className="text-white font-medium">{new Date(accountData.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Gender</p>
                      <p className="text-white font-medium">{accountData.gender}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-400">Bio</p>
                      <p className="text-white font-medium">{accountData.bio}</p>
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
                  <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditMode(prev => ({ ...prev, contact: !prev.contact }))}
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={accountData.email}
                            onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="tel"
                            value={accountData.phone}
                            onChange={(e) => setAccountData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="url"
                            value={accountData.website}
                            onChange={(e) => setAccountData(prev => ({ ...prev, website: e.target.value }))}
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
                        onClick={() => setEditMode(prev => ({ ...prev, contact: false }))}
                        className="flex-1 p-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white font-medium"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSaveSection('contact')}
                        disabled={isLoading}
                        className="flex-1 p-3 bg-gradient-to-r from-purple-primary to-purple-secondary rounded-xl text-white font-medium flex items-center justify-center space-x-2"
                      >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Save</span>
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Email Address</p>
                      <p className="text-white font-medium">{accountData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone Number</p>
                      <p className="text-white font-medium">{accountData.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-400">Website</p>
                      <p className="text-white font-medium">{accountData.website}</p>
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
                  <h3 className="text-lg font-semibold text-white">Address Information</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditMode(prev => ({ ...prev, address: !prev.address }))}
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                        <input
                          type="text"
                          value={accountData.country}
                          onChange={(e) => setAccountData(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                        <input
                          type="text"
                          value={accountData.city}
                          onChange={(e) => setAccountData(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                        <input
                          type="text"
                          value={accountData.address}
                          onChange={(e) => setAccountData(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">ZIP Code</label>
                        <input
                          type="text"
                          value={accountData.zipCode}
                          onChange={(e) => setAccountData(prev => ({ ...prev, zipCode: e.target.value }))}
                          className="w-full px-4 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setEditMode(prev => ({ ...prev, address: false }))}
                        className="flex-1 p-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white font-medium"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSaveSection('address')}
                        disabled={isLoading}
                        className="flex-1 p-3 bg-gradient-to-r from-purple-primary to-purple-secondary rounded-xl text-white font-medium flex items-center justify-center space-x-2"
                      >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Save</span>
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Country</p>
                      <p className="text-white font-medium">{accountData.country}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">City</p>
                      <p className="text-white font-medium">{accountData.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Address</p>
                      <p className="text-white font-medium">{accountData.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">ZIP Code</p>
                      <p className="text-white font-medium">{accountData.zipCode}</p>
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
                  <h3 className="text-lg font-semibold text-white">Security Settings</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditMode(prev => ({ ...prev, security: !prev.security }))}
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwords.current}
                            onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                            className="w-full pl-10 pr-12 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwords.new}
                            onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                            className="w-full pl-10 pr-12 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwords.confirm}
                            onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                            className="w-full pl-10 pr-12 py-3 bg-purple-dark/50 border border-purple-primary/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-primary/60"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-amber-400 mt-0.5" />
                        <div>
                          <h4 className="text-amber-400 font-medium mb-1">Password Requirements</h4>
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
                          setEditMode(prev => ({ ...prev, security: false }));
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
                        {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
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
                          <p className="text-sm text-gray-400">Last updated 2 months ago</p>
                        </div>
                      </div>
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <div>
                          <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-400">Enabled for extra security</p>
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
                  <h3 className="text-lg font-semibold text-white">Account Status</h3>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <div>
                        <h4 className="text-white font-medium">Premium Account</h4>
                        <p className="text-sm text-gray-400">Active subscription</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full">
                      ACTIVE
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <Verified className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="text-white font-medium">Verified Account</h4>
                        <p className="text-sm text-gray-400">Identity confirmed</p>
                      </div>
                    </div>
                    <Check className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                
                <div className="p-4 bg-purple-primary/10 border border-purple-primary/30 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="w-5 h-5 text-purple-primary" />
                    <h4 className="text-white font-medium">Membership Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Member Since</p>
                      <p className="text-white font-medium">{accountData.memberSince}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Account Type</p>
                      <p className="text-white font-medium">{accountData.accountType}</p>
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
