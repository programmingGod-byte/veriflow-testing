"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [userCoverImage, setUserCoverImage] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // Fetch user profile data including custom profile image
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            if (data.user?.profileImage) {
              setUserProfileImage(data.user.profileImage);
            }
            if (data.user?.coverImage) {
              setUserCoverImage(data.user.coverImage);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };
      
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  // Navigation links
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Real-time Data', href: '/realtime-data' },
    { name: 'Status Alerts', href: '/status' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Create references to the relevant elements
      const profileToggle = document.getElementById('profile-toggle');
      const profileMenu = document.getElementById('profile-menu');
      
      // Check if the click is outside both the toggle and the menu
      if (
        profileToggle && 
        profileMenu && 
        !profileToggle.contains(event.target as Node) && 
        !profileMenu.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle profile menu toggle with stop propagation
  const toggleProfileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // Get the appropriate profile image source
  const getProfileImageSrc = () => {
    if (userProfileImage) {
      return userProfileImage;
    }
    if (session?.user?.image) {
      return session.user.image;
    }
    return null;
  };

  const profileImageSrc = getProfileImageSrc();

  return (
    <motion.nav
      className="top-0 left-0 right-0 z-50 px-4 md:px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Name */}
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Replace with your actual logo */}
            <div className="relative w-10 h-10 bg-blue-500 rounded-full overflow-hidden flex items-center justify-center text-white font-bold">
              <span className="text-xl">V</span>
            </div>
          </motion.div>
          <motion.span 
            className="text-xl font-bold bg-white bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            VISIFLOW
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || 
                           (pathname.startsWith(link.href) && link.href !== '/');
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className="relative px-4 py-2 rounded-full group"
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-white rounded-full"
                    layoutId="activeTab"
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
                <span 
                  className={`relative z-10 font-medium transition-colors duration-300 ${
                    isActive ? 'text-blue-600' : 'text-white hover:text-blue-200'
                  }`}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Auth and Profile */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link 
                href="/auth" 
                className="text-white hover:text-blue-200 transition-colors px-2 py-1 font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/auth?tab=signup" 
                className="bg-white hover:bg-blue-600 text-blue-600 hover:text-white px-4 py-2 rounded-full transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {/* User's name / welcome message */}
              <span className="text-white font-medium">
                Hello, {session?.user?.name?.split(' ')[0] || 'User'}
              </span>
              
              {/* User Profile Icon */}
              <div className="relative">
                <motion.div 
                  id="profile-toggle"
                  className="w-10 h-10 bg-white/20 rounded-full cursor-pointer overflow-hidden backdrop-blur-sm border-2 border-white/30"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleProfileMenu}
                >
                  {profileImageSrc ? (
                    <Image 
                      src={profileImageSrc} 
                      alt={session?.user?.name || 'Profile'} 
                      width={40} 
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </motion.div>
                
                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <motion.div 
                    id="profile-menu"
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg overflow-hidden z-50"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-4 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50">
                          {profileImageSrc ? (
                            <Image 
                              src={profileImageSrc} 
                              alt={session?.user?.name || 'Profile'} 
                              width={48} 
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{session?.user?.name}</p>
                          <p className="text-xs text-white/80 truncate">{session?.user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span>Your Profile</span>
                      </Link>
                      
                      <Link 
                        href="/account/password" 
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>Change Password</span>
                      </Link>
                      
                      <hr className="my-1 border-gray-200" />
                      
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm11.293 5.707a1 1 0 00-1.414-1.414L11 9.586V6a1 1 0 10-2 0v3.586l-1.793-1.793a1 1 0 00-1.414 1.414l3.5 3.5a1 1 0 001.414 0l3.5-3.5z" clipRule="evenodd" transform="rotate(90, 10, 10)" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          className="md:hidden bg-white absolute left-0 right-0 top-16 p-4 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || 
                             (pathname.startsWith(link.href) && link.href !== '/');
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-3 px-4 rounded-lg transition-colors duration-300 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:text-blue-500 hover:bg-gray-50 font-medium'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                  {isActive && (
                    <motion.div 
                      className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r"
                      layoutId="mobileActiveIndicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              );
            })}
            
            <div className="flex flex-col gap-2 pt-2 mt-2 border-t border-gray-100">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/auth"
                    className="text-gray-700 hover:text-blue-500 transition-colors py-2 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth?tab=signup"
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-center transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  {session?.user && (
                    <div className="flex items-center gap-3 py-2 px-4 bg-blue-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200">
                        {profileImageSrc ? (
                          <Image 
                            src={profileImageSrc} 
                            alt={session.user.name || 'Profile'} 
                            width={40} 
                            height={40} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                      </div>
                    </div>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span>Your Profile</span>
                  </Link>
                  <Link
                    href="/account/password"
                    className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Change Password</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-red-50 text-red-600 transition-colors text-left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm11.293 5.707a1 1 0 00-1.414-1.414L11 9.586V6a1 1 0 10-2 0v3.586l-1.793-1.793a1 1 0 00-1.414 1.414l3.5 3.5a1 1 0 001.414 0l3.5-3.5z" clipRule="evenodd" transform="rotate(90, 10, 10)" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar; 