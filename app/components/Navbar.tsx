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
  const [isEditMachineModalOpen, setIsEditMachineModalOpen] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [userCoverImage, setUserCoverImage] = useState<string | null>(null);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machineId, setMachineId] = useState('');
  const [machinePassword, setMachinePassword] = useState('');
  const [isAddingMachine, setIsAddingMachine] = useState(false);
  const [isDeletingMachine, setIsDeletingMachine] = useState(false);
  const [isEditingMachine, setIsEditingMachine] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [editMachineName, setEditMachineName] = useState('');
  const [editMachineIp, setEditMachineIp] = useState('');
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
          setAllMachines(machinesData.machines || []);
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

  // Handle delete machine
  const handleDeleteMachine = async (machineId: string) => {
    console.log("INSIDE DELETE FUNCTION")
    if (!confirm('Are you sure you want to delete this machine?')) {
      return;
    }


    setIsDeletingMachine(true);

    try {
      const response = await fetch(`/api/machines/${machineId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh machines list
        const machinesResponse = await fetch('/api/machines');
        if (machinesResponse.ok) {
          const machinesData = await machinesResponse.json();
          setMachines(machinesData.machines || []);
          setAllMachines(machinesData.machines || []);
        }
        alert('Machine deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete machine');
      }
    } catch (error) {
      console.error('Error deleting machine:', error);
      alert('Failed to delete machine');
    } finally {
      setIsDeletingMachine(false);
    }
  };

  // Handle edit machine
  const handleEditMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMachine) return;

    setIsEditingMachine(true);
    console.log(editingMachine.id)
    try {
  const response = await fetch(`/api/machines/${editingMachine.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: editMachineName,
      ip: editMachineIp,
      email: session?.user?.email
    }),
  });
  
  if (response.ok) {
    const responseData = await response.json();
    
    // Update the machine ID in your state if it changed
    if (responseData.newId) {
      setMachines(prevMachines => 
        prevMachines.map(machine => 
          machine.id === editingMachine.id 
            ? { ...machine, id: responseData.newId, name: editMachineName, ip: editMachineIp }
            : machine
        )
      );
    }
    
    // Rest of your success handling...
    setEditingMachine(null);
    setEditMachineName('');
    setEditMachineIp('');
    setIsEditMachineModalOpen(false);
    alert('Machine updated successfully!');
  } else {
    const errorData = await response.json();
    alert(errorData.error || 'Failed to update machine');
  }
} catch (error) {
  console.error('Error updating machine:', error);
  alert('Failed to update machine');
} finally {
  setIsEditingMachine(false);
}
  };

  // Open edit modal
  const openEditModal = (machine: Machine) => {
    setEditingMachine(machine);
    setEditMachineName(machine.name || '');
    setEditMachineIp(machine.id);
    setIsEditMachineModalOpen(true);
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
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg overflow-hidden z-50"
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
                            <div key={machine.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                              <div className="flex items-center justify-between">
                                <button 
                                  onClick={() => handleMacineClick(machine)} 
                                  className="flex items-center gap-3 flex-1 text-left"
                                >
                                  <div className={`w-3 h-3 rounded-full ${getStatusColor(machine.status || 'offline')}`}></div>
                                  <div>
                                    <p className="font-medium text-gray-900">{machine.name || `Machine ${machine.id}`}</p>
                                    <p className="text-xs text-gray-500">IP: {machine.id}</p>
                                  </div>
                                </button>
                                
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                                    machine.status === 'online' ? 'bg-green-100 text-green-800' :
                                    machine.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {machine.status || 'offline'}
                                  </span>
                                  
                                  {/* Edit Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(machine);
                                    }}
                                    className="p-1 rounded-full hover:bg-blue-100 tex-600 transition-colors"
                                    title="Edit machine"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                  </button>
                                  
                                  {/* Del ete Button */}
                                  <button
                                    onClick={(e) => {
                                      console.log("clicked")
                                      e.stopPropagation();
                                      handleDeleteMachine(machine.id);
                                    }}
                                    className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                                    title="Delete machine"
                                    disabled={false}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
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
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-6.293 6.293a1 1 0 01-1.414-1.414L12.586 6H7a1 1 0 110-2h8a1 1 0 011 1v8a1 1 0 11-2 0V7.414z" clipRule="evenodd" />
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

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-white hover:text-blue-200 py-2 border-b border-white/20 last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {!isAuthenticated ? (
              <div className="pt-4 space-y-2">
                <Link 
                  href="/auth" 
                  className="block text-center text-white hover:text-blue-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth?tab=signup" 
                  className="block text-center bg-white text-blue-600 py-2 rounded-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="pt-4 space-y-2">
                <div className="text-white font-medium pb-2">
                  Hello, {session?.user?.name?.split(' ')[0] || 'User'}
                </div>
                <Link 
                  href="/profile" 
                  className="block text-white hover:text-blue-200 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Your Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-red-200 hover:text-red-100 py-2"
                >
                  Sign Out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </motion.nav>

      {/* Add Machine Modal */}
      {isAddMachineModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white rounded-xl p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl text-black font-bold mb-4">Add New Machine</h2>
            <form onSubmit={handleAddMachine}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Machine name
                  </label>
                  <input
                    type="text"
                    value={machineId}
                    onChange={(e) => setMachineId(e.target.value)}
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ip
                  </label>
                  <input
                    type="text"
                    value={machinePassword}
                    onChange={(e) => setMachinePassword(e.target.value)}
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="IP"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddMachineModalOpen(false)}
                  className="flex-1 text-black px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingMachine}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isAddingMachine ? 'Adding...' : 'Add Machine'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Machine Modal */}
      {isEditMachineModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white rounded-xl p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
           <h2 className="text-xl font-bold text-black mb-4">Edit Machine</h2>

            <form onSubmit={handleEditMachine}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Machine Name
                  </label>
                  <input
                    type="text"
                    value={editMachineName}
                    onChange={(e) => setEditMachineName(e.target.value)}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Production Server"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={editMachineIp}
                    onChange={(e) => setEditMachineIp(e.target.value)}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 192.168.1.100"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditMachineModalOpen(false)}
                  className="flex-1 px-4 py-2 border text-black border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingMachine}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isEditingMachine ? 'Updating...' : 'Update Machine'}
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