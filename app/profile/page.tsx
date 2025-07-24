'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Image upload state
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  // Refs for file inputs
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // User form data
  const [formData, setFormData] = useState({
    name: '',
    bio: 'Flood detection enthusiast and environmental advocate.',
    location: '',
    phone: '',
    notifications: {
      email: true,
      app: true,
      sms: false
    }
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
    
    if (session?.user) {
      // Fetch user profile data including custom profile and cover images
      const fetchUserProfile = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }
          
          const data = await response.json();
          
          if (data.user) {
            setFormData(prev => ({
              ...prev,
              name: data.user.name || '',
              bio: data.user.bio || 'Flood detection enthusiast and environmental advocate.',
              location: data.user.location || '',
              phone: data.user.phone || '',
              notifications: data.user.notifications || {
                email: true,
                app: true,
                sms: false
              }
            }));
            
            // Set cover and profile image previews if they exist
            if (data.user.coverImage) {
              setCoverImagePreview(data.user.coverImage);
            }
            
            if (data.user.profileImage) {
              setProfileImagePreview(data.user.profileImage);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };
      
      fetchUserProfile();
      
      setFormData(prev => ({
        ...prev,
        name: session?.user?.name || ''
      }));
    }
  }, [status, router, session]);

  // Reset image previews when editing is canceled
  useEffect(() => {
    if (!isEditing) {
      setProfileImage(null);
      setProfileImagePreview(null);
      setCoverImage(null);
      setCoverImagePreview(null);
    }
  }, [isEditing]);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle profile image selection
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        if (e.target?.result) {
          setProfileImagePreview(e.target.result as string);
        }
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Handle cover image selection
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        if (e.target?.result) {
          setCoverImagePreview(e.target.result as string);
        }
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleToggleNotification = (type: string) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type as keyof typeof prev.notifications]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Upload profile image if selected
      if (profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('image', profileImage);
        imageFormData.append('type', 'profile');
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload profile image');
        }
      }
      
      // Upload cover image if selected
      if (coverImage) {
        const imageFormData = new FormData();
        imageFormData.append('image', coverImage);
        imageFormData.append('type', 'cover');
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload cover image');
        }
      }
      
      // Update user profile data
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.'
      });
    } finally {
      setIsSaving(false);
      setIsEditing(false);
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 px-4 pb-16 transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 to-cyan-50'
    }`}>
      {/* Dark Mode Toggle */}
      <motion.button
        onClick={toggleDarkMode}
        className={`fixed top-4 right-4 z-50 p-3 rounded-full transition-all duration-300 ${
          isDarkMode 
            ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' 
            : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
        } shadow-lg`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isDarkMode ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </motion.button>

      <div className="max-w-5xl mx-auto">
        <motion.div 
          className={`rounded-2xl shadow-xl overflow-hidden border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-60 sm:h-72 relative overflow-hidden">
              {coverImagePreview ? (
                <Image 
                  src={coverImagePreview}
                  alt="Cover"
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-blue-600 to-cyan-500 relative overflow-hidden">
                  <motion.div 
                    className="absolute w-full h-full bg-blue-600 opacity-10"
                    animate={{ 
                      x: [0, 20, 0],
                      opacity: [0.1, 0.15, 0.1] 
                    }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                  
                  <motion.div 
                    className="absolute -bottom-5 -left-5 w-40 h-40 bg-white/20 rounded-full blur-xl"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      x: [0, 10, 0],
                      opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ 
                      duration: 6, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                  
                  <motion.div 
                    className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      y: [0, -5, 0],
                      opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ 
                      duration: 7, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </div>
              )}
              
              {/* Cover Photo Dimming Overlay */}
              {isEditing && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 backdrop-blur-sm">
                  <div className="text-white text-center px-6 py-4 rounded-xl bg-black/50 backdrop-blur-md shadow-xl">
                    <div className="mb-2 font-medium text-lg">Change Cover Photo</div>
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg shadow-lg transition-all text-white flex items-center gap-2 mx-auto font-medium hover:scale-105 active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      Upload Photo
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
              />
            </div>
            
            {/* Profile Picture and Name */}
            <div className="flex flex-col md:flex-row md:items-end px-8 -mt-20 pb-6 relative z-10">
              <motion.div 
                className="w-36 h-36 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {profileImagePreview ? (
                  <Image 
                    src={profileImagePreview}
                    alt="Profile"
                    width={144}
                    height={144}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : session?.user?.image ? (
                  <Image 
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={144}
                    height={144}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white">
                    <span className="text-5xl font-bold">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                
                {/* Profile Picture Dimming Overlay */}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => profileInputRef.current?.click()}
                      className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg transition-all text-white hover:scale-110 active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                )}

                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </motion.div>
              
              <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                <motion.h1 
                  className={`text-3xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {session?.user?.name || 'User'}
                </motion.h1>
                <motion.div 
                  className={`mt-1 flex items-center gap-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>{session?.user?.email || 'user@example.com'}</span>
                </motion.div>
                {formData.location && (
                  <motion.div 
                    className={`mt-1 flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{formData.location}</span>
                  </motion.div>
                )}
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-4 md:mt-0"
              >
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Cancel
                  </button>
                )}
              </motion.div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className={`border-b transition-colors ${
            isDarkMode 
              ? 'border-gray-600 bg-gray-700' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex px-8 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => handleTabChange('profile')}
                className={`py-4 px-6 relative font-medium transition-all ${
                  activeTab === 'profile'
                    ? (isDarkMode ? 'text-blue-400' : 'text-blue-600')
                    : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>Profile</span>
                </div>
                {activeTab === 'profile' && (
                  <motion.div 
                    className={`absolute bottom-0 left-0 right-0 h-1 rounded-t-lg ${
                      isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
                    }`}
                    layoutId="activeProfileTab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </button>
              <button
                onClick={() => handleTabChange('security')}
                className={`py-4 px-6 relative font-medium transition-all ${
                  activeTab === 'security'
                    ? (isDarkMode ? 'text-blue-400' : 'text-blue-600')
                    : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Security</span>
                </div>
                {activeTab === 'security' && (
                  <motion.div 
                    className={`absolute bottom-0 left-0 right-0 h-1 rounded-t-lg ${
                      isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
                    }`}
                    layoutId="activeProfileTab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </button>
              <button
                onClick={() => handleTabChange('notifications')}
                className={`py-4 px-6 relative font-medium transition-all ${
                  activeTab === 'notifications'
                    ? (isDarkMode ? 'text-blue-400' : 'text-blue-600')
                    : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  <span>Notifications</span>
                </div>
                {activeTab === 'notifications' && (
                  <motion.div 
                    className={`absolute bottom-0 left-0 right-0 h-1 rounded-t-lg ${
                      isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
                    }`}
                    layoutId="activeProfileTab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {message.text && (
              <motion.div 
                className={`m-8 rounded-xl text-sm ${
                  message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
                  message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : ''
                }`}
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4">
                  {message.type === 'success' && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">{message.text}</p>
                        <p className="text-xs mt-1">Your profile has been updated with the new information.</p>
                      </div>
                    </div>
                  )}
                  {message.type === 'error' && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">{message.text}</p>
                        <p className="text-xs mt-1">Please try again or contact support if the issue persists.</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Content */}
          <div className={`p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <h3 className={`text-lg font-semibold border-b pb-3 ${
                          isDarkMode 
                            ? 'text-gray-200 border-gray-600' 
                            : 'text-gray-800 border-gray-200'
                        }`}>Personal Information</h3>
                        
                        <div>
                          <label htmlFor="name" className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Full Name
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={`w-full p-3 border rounded-lg transition-colors ${
                              isEditing 
                                ? (isDarkMode 
                                  ? 'border-blue-500 bg-gray-700 text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400' 
                                  : 'border-blue-300 bg-blue-50 text-black focus:ring-2 focus:ring-blue-200 focus:border-blue-400')
                                : (isDarkMode 
                                  ? 'border-gray-600 bg-gray-700 text-gray-300' 
                                  : 'border-gray-200 bg-gray-50 text-black')
                            }`}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Email Address
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={session?.user?.email || ''}
                            disabled
                            className={`w-full p-3 border rounded-lg transition-colors ${
                              isDarkMode 
                                ? 'border-gray-600 bg-gray-700 text-gray-300' 
                                : 'border-gray-200 bg-gray-50 text-black'
                            }`}
                          />
                          <p className={`mt-1 text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Email address cannot be changed</p>
                        </div>
                        
                        <div>
                          <label htmlFor="location" className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Location
                          </label>
                          <input
                            id="location"
                            name="location"
                            type="text"
                            value={formData.location}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="e.g. New York, NY"
                            className={`w-full p-3 border rounded-lg transition-colors ${
                              isEditing 
                                ? (isDarkMode 
                                  ? 'border-blue-500 bg-gray-700 text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400' 
                                  : 'border-blue-300 bg-blue-50 text-black focus:ring-2 focus:ring-blue-200 focus:border-blue-400')
                                : (isDarkMode 
                                  ? 'border-gray-600 bg-gray-700 text-gray-300' 
                                  : 'border-gray-200 bg-gray-50 text-black')
                            }`}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Phone Number
                          </label>
                          <input
                            id="phone"
                            name="phone"
                            type="text"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="e.g. +1 (555) 123-4567"
                            className={`w-full p-3 border rounded-lg transition-colors ${
                              isEditing 
                                ? (isDarkMode 
                                  ? 'border-blue-500 bg-gray-700 text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400' 
                                  : 'border-blue-300 bg-blue-50 text-black focus:ring-2 focus:ring-blue-200 focus:border-blue-400')
                                : (isDarkMode 
                                  ? 'border-gray-600 bg-gray-700 text-gray-300' 
                                  : 'border-gray-200 bg-gray-50 text-black')
                            }`}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <h3 className={`text-lg font-semibold border-b pb-3 ${
                          isDarkMode 
                            ? 'text-gray-200 border-gray-600' 
                            : 'text-gray-800 border-gray-200'
                        }`}>About You</h3>
                        
                        <div>
                          <label htmlFor="bio" className={`block text-sm font-medium mb-1 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Bio
                          </label>
                          <textarea
                            id="bio"
                            name="bio"
                            rows={5}
                            value={formData.bio}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="Tell us about yourself..."
                            className={`w-full p-3 border rounded-lg transition-colors ${
                              isEditing 
                                ? (isDarkMode 
                                  ? 'border-blue-500 bg-gray-700 text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400' 
                                  : 'border-blue-300 bg-blue-50 text-black focus:ring-2 focus:ring-blue-200 focus:border-blue-400')
                                : (isDarkMode 
                                  ? 'border-gray-600 bg-gray-700 text-gray-300' 
                                  : 'border-gray-200 bg-gray-50 text-black')
                            }`}
                          />
                          <p className={`mt-1 text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Brief description for your profile</p>
                        </div>
                        
                        {isEditing && (
                          <div className={`p-4 border rounded-lg ${
                            isDarkMode 
                              ? 'bg-blue-900/30 border-blue-700' 
                              : 'bg-blue-50 border-blue-200'
                          }`}>
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 p-1 rounded-full ${
                                isDarkMode 
                                  ? 'text-blue-400 bg-blue-800/50' 
                                  : 'text-blue-500 bg-blue-100'
                              }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <p className={`text-sm ${
                                  isDarkMode ? 'text-blue-300' : 'text-blue-700'
                                }`}>
                                  Your profile information will be visible to other users of the platform.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="mt-8 flex justify-end">
                        <motion.button
                          type="submit"
                          disabled={isSaving}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isSaving ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving Changes...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Save Changes
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}
                  </form>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div 
                  key="security"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className={`border rounded-lg p-4 ${
                    isDarkMode 
                      ? 'bg-blue-900/30 border-blue-700' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-500'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className={`font-medium ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-800'
                        }`}>Account Security</h3>
                        <p className={`text-sm mt-1 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          Your account is secured with Google Authentication. To change your password, please use Google's account settings.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`border rounded-lg overflow-hidden ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div className={`px-4 py-5 border-b ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <h3 className={`text-lg font-medium ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>Login Sessions</h3>
                    </div>
                    <div className={`divide-y ${
                      isDarkMode ? 'divide-gray-600' : 'divide-gray-200'
                    }`}>
                      <div className="px-4 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 00-4.887 9.48c.34.39 1.055.919 1.377 1.267a.5.5 0 01.137.345v.069a.5.5 0 01-.5.5h-2a.5.5 0 00-.5.5v.5a.5.5 0 00.5.5h6a.5.5 0 00.5-.5V14a.5.5 0 00-.5-.5h-2a.5.5 0 01-.5-.5v-.069a.5.5 0 01.137-.345c.322-.348 1.037-.878 1.377-1.267A6 6 0 0010 4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className={`font-medium ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>Current Session</p>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>Windows • Chrome • IP: 192.168.1.1</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active Now
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <button 
                      className="text-red-600 hover:text-red-800 font-medium flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete Account
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div 
                  key="notifications"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className={`text-lg font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between p-4 border rounded-lg hover:bg-opacity-50 transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 hover:bg-gray-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </div>
                        <div>
                          <p className={`font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>Email Notifications</p>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Receive alerts and updates via email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.notifications.email}
                          onChange={() => handleToggleNotification('email')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className={`flex items-center justify-between p-4 border rounded-lg hover:bg-opacity-50 transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 hover:bg-gray-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
                            isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                          }`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className={`font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>App Notifications</p>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Receive in-app notifications and alerts</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.notifications.app}
                          onChange={() => handleToggleNotification('app')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className={`flex items-center justify-between p-4 border rounded-lg hover:bg-opacity-50 transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 hover:bg-gray-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          isDarkMode ? 'bg-green-900/50' : 'bg-green-100'
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </div>
                        <div>
                          <p className={`font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-900'
                          }`}>SMS Notifications</p>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Receive alerts via text message</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.notifications.sms}
                          onChange={() => handleToggleNotification('sms')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 