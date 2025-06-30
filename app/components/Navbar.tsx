"use client";

import { useState, useEffect,useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { MyContext } from '../providers';

interface Machine {
  id: string;
  name?: string;
  status?: 'online' | 'offline' | 'maintenance';
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
   const { value, setValue ,user,setUser,setAllMachines} = useContext(MyContext);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMachinesMenuOpen, setIsMachinesMenuOpen] = useState(false);
  const [isAddMachineModalOpen, setIsAddMachineModalOpen] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [userCoverImage, setUserCoverImage] = useState<string | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machineId, setMachineId] = useState('');
  const [machinePassword, setMachinePassword] = useState('');
  const [isAddingMachine, setIsAddingMachine] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [navLinks,setNavLinks] = useState([
    { name: 'Home', href: '/' },
    
    // { name: 'Status Alerts', href: '/status' },
    { name: 'About Us', href: '/about' },
  ])
  // Fetch user profile data including custom profile image
  useEffect(() => {
    if (isAuthenticated) {
      setNavLinks((prev)=>([
        ...prev,{ name: 'Status Alerts', href: '/status' },{ name: 'Real-time Data', href: '/realtime-data' },
        
      ]))
      const fetchUserProfile = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            console.log(data)
            setUser(data.user);
            if(data.user.email=="verigeektech@gmail.com" || data.user.email=="omdaga6@gmail.com"){
              setNavLinks((prev)=>([
                ...prev,{ name: 'See contact', href: '/checkcontact' },
                { name: 'Maps', href: '/maps' }
              ]))
            }
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

  // Fetch user machines
  useEffect(() => {
    if (isAuthenticated) {
      const fetchMachines = async () => {
        try {
          const response = await fetch('/api/machines');
          if (response.ok) {
            const data = await response.json();
            setMachines(data.machines || []);
            setAllMachines(data.machines || []);
            console.log(data.machines)
            console.log("Machines fetched:", data.machines);
            if(data.machines && data.machines.length > 0) {
              console.log("SSSSSSSSSSSSSSSSSSSSSSSSS")
              setValue({
                name:data.machines[0].name,
                ip:data.machines[0].id
              })
              console.log(value)

            }
          }
        } catch (error) {
          console.error('Error fetching machines:', error);
        }
      };
      
      fetchMachines();
    }
  }, [isAuthenticated]);

  // Navigation links
  
  function handleMacineClick(machine:any) {
    // console.log(machine)
    setValue({
      ip:machine.id,
      name:machine.name

    })
  }

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Create references to the relevant elements
      const profileToggle = document.getElementById('profile-toggle');
      const profileMenu = document.getElementById('profile-menu');
      const machinesToggle = document.getElementById('machines-toggle');
      const machinesMenu = document.getElementById('machines-menu');
      
      // Check if the click is outside both the toggle and the menu
      if (
        profileToggle && 
        profileMenu && 
        !profileToggle.contains(event.target as Node) && 
        !profileMenu.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }

      if (
        machinesToggle && 
        machinesMenu && 
        !machinesToggle.contains(event.target as Node) && 
        !machinesMenu.contains(event.target as Node)
      ) {
        setIsMachinesMenuOpen(false);
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

  // Handle machines menu toggle with stop propagation
  const toggleMachinesMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMachinesMenuOpen(!isMachinesMenuOpen);
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // Handle add machine
  const handleAddMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingMachine(true);

    try {
      const response = await fetch('/api/machines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machineId,
          password: machinePassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("DATA")
        console.log(data)
        // Refresh machines list
        const machinesResponse = await fetch('/api/machines');
        if (machinesResponse.ok) {
          const machinesData = await machinesResponse.json();
          setMachines(machinesData.machines || []);
          console.log("machines")
          console.log(machinesData.machines)
        }
        
        // Reset form and close modal
        setMachineId('');
        setMachinePassword('');
        setIsAddMachineModalOpen(false);
        alert('Machine added successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to add machine');
      }
    } catch (error) {
      console.error('Error adding machine:', error);
      alert('Failed to add machine');
    } finally {
      setIsAddingMachine(false);
    }
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

  // Get status color for machines
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
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

          {/* Auth, Machines, Add Machine Button and Profile */}
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
                {/* Machines Dropdown */}
                <div className="relative">
                  <motion.button 
                    id="machines-toggle"
                    className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors px-3 py-2 rounded-full hover:bg-white/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMachinesMenu}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Machines ({machines.length})</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isMachinesMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                  
                  {/* Machines Dropdown Menu */}
                  {isMachinesMenuOpen && (
                    <motion.div 
                      id="machines-menu"
                      className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg overflow-hidden z-50"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3 text-white">
                        <h3 className="font-bold">Your Machines</h3>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto">
                        {machines.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">No machines added yet</p>
                            <p className="text-xs text-gray-400 mt-1">Click "Add Machine" to get started</p>
                          </div>
                        ) : (
                          machines.map((machine) => (
                            <div key={machine.id}  className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                              <button onClick={()=>handleMacineClick(machine)} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${getStatusColor(machine.status || 'offline')}`}></div>
                                  <div>

                                    <p className="font-medium text-gray-900">{machine.name || `Machine ${machine.id}`}</p>
                                    <p className="text-xs text-gray-500">ID: {machine.id}</p>
                                  </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                                  machine.status === 'online' ? 'bg-green-100 text-green-800' :
                                  machine.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {machine.status || 'offline'}
                                </span>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Add Machine Button */}
                <motion.button
                  className="bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 rounded-full font-medium transition-colors shadow-sm flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAddMachineModalOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Machine
                </motion.button>

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

                    {/* Mobile Add Machine Button */}
                    <button
                      onClick={() => {
                        setIsAddMachineModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 py-2 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      <span>Add Machine</span>
                    </button>

                    {/* Mobile Machines List */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-2">Your Machines ({machines.length})</h4>
                      {machines.length === 0 ? (
                        <p className="text-sm text-gray-500">No machines added yet</p>
                      ) : (
                        <div className="space-y-2">
                          {machines.slice(0, 3).map((machine) => (
                            <div key={machine.id} className="flex items-center justify-between bg-white p-2 rounded">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(machine.status || 'offline')}`}></div>
                                <span className="text-sm text-gray-700">{machine.name || `Machine ${machine.id}`}</span>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                                machine.status === 'online' ? 'bg-green-100 text-green-800' :
                                machine.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {machine.status || 'offline'}
                              </span>
                            </div>
                          ))}
                          {machines.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{machines.length - 3} more machines
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      className="text-gray-700 hover:text-blue-500 transition-colors py-2 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    
                    <Link
                      href="/account/password"
                      className="text-gray-700 hover:text-blue-500 transition-colors py-2 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Change Password
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="text-left text-red-600 hover:text-red-700 transition-colors py-2 font-medium"
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Add Machine Modal */}
      {isAddMachineModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold">Add New Machine</h2>
              <p className="text-blue-100 text-sm mt-1">Connect a new machine to your account</p>
            </div>
            
            <form onSubmit={handleAddMachine} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="machineId" className="block text-sm font-medium text-gray-700 mb-2">
                    Machine name
                  </label>
                  <input
                  style={{
                    color:"black"
                  }}
                    type="text"
                    id="machineId"
                    value={machineId}
                    onChange={(e) => setMachineId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter machine name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="machinePassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Machine ip
                  </label>
                  <input

                  style={{
                    color:"black"
                  }}
                    type="text"
                    id="machinePassword"
                    value={machinePassword}
                    onChange={(e) => setMachinePassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter machine ip"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddMachineModalOpen(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={isAddingMachine}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isAddingMachine}
                >
                  {isAddingMachine ? 'Adding...' : 'Add Machine'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Navbar;