"use client";

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { MyContext } from '../providers';
import AddMachineModal from './MachineModal';
import MachineDetailsWidget from './machineWidgit';
import {encrypt,decrypt} from "@/app/encrypter"
interface Machine {
  machineCode: string;
  machineName?: string;
  machineType?: string;
  status?: 'online' | 'offline' | 'maintenance';
}

function isValidIPv4(ip: string): boolean {
  const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  return ipv4Regex.test(ip);
}
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { value, setValue, user, setUser, setAllMachines } = useContext(MyContext);
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
  const [editMachineType,setEditMachineType] = useState("")
  const [editMachineIp, setEditMachineIp] = useState('');
  const [selectedMachineType, setSelectedMachineType] = useState('');
  const [isMachineDetailsOpen, setIsMachineDetailsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [navLinks, setNavLinks] = useState([
    { name: 'Home', href: '/' },

    // { name: 'Status Alerts', href: '/status' },
    { name: 'About Us', href: '/about' },
  ])
  // Fetch user profile data including custom profile image
  useEffect(() => {
    if (isAuthenticated) {
      setNavLinks((prev) => ([
        ...prev, { name: 'Status Alerts', href: '/status' }, { name: 'Real-time Data', href: '/realtime-data' },

      ]))
      const fetchUserProfile = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            console.log(data)
            setUser(data.user);
            if (data.user.email == "verigeektech@gmail.com" || data.user.email == "omdaga6@gmail.com") {
              setNavLinks((prev) => ([
                ...prev, { name: 'See contact', href: '/checkcontact' },
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
            if (data.machines && data.machines.length > 0) {
              console.log("SSSSSSSSSSSSSSSSSSSSSSSSS")
              setValue({
                machineName: data.machines[0].machineName,
                machineCode: data.machines[0].machineCode,
                machineType: data.machines[0].machineType
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

  function handleMacineClick(machine: any) {
    console.log(machine)
    setValue({
      machineCode: machine.machineCode,
      machineName: machine.machineName,
      machineType: machine.machineType

    })
    setIsMachinesMenuOpen(false)
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
    console.log(machineId, machinePassword, selectedMachineType)
    let machineName = machineId;
    let machineCode = machinePassword;
    let machineType = selectedMachineType;

    const decryptResult  = decrypt(machineCode);
    console.log(decryptResult)
    if(!decryptResult.success) {
      alert("wrong machine code");
      setIsAddingMachine(false)
      return;
    }

    if(!isValidIPv4(decryptResult.value)){
      setIsAddingMachine(false)
      alert("wrong machine code");
      return;
    }
    machineCode = decryptResult.value

    try {
      const response = await fetch('/api/machines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machineName,
          machineCode,
          machineType,
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
        console.log(errorData)
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
  const handleDeleteMachine = async (machineCode: string) => {
    console.log(machineCode)
    console.log("INSIDE DELETE FUNCTION")
    if (!confirm('Are you sure you want to delete this machine?')) {
      return;
    }


    setIsDeletingMachine(true);

    try {
      const response = await fetch(`/api/machines/${machineCode}`, {
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
    console.log(editingMachine.machineCode)
    console.log({
          machineName: editMachineName,
          machineCode: editMachineIp,
          email: session?.user?.email,
          machineType:editMachineType
        })
    try {
      const response = await fetch(`/api/machines/${editingMachine.machineCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machineName: editMachineName,
          machineCode: editMachineIp,
          email: session?.user?.email,
          machineType:editMachineType
        }),
      });

      if (response.ok) {
        const responseData = await response.json();

        // Update the machine ID in your state if it changed
        if (responseData.newId) {
          setMachines(prevMachines =>
            prevMachines.map(machine =>
              machine.machineCode === editingMachine.machineCode
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
    setEditMachineName(machine.machineName || '');
    setEditMachineIp(machine.machineCode);
    setEditMachineType(machine.machineType)
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
                    className={`relative z-10 font-medium transition-colors duration-300 ${isActive ? 'text-blue-600' : 'text-white hover:text-blue-200'
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
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMachineDetailsOpen(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                    </svg>
                    Machines ({machines.length})
                  </motion.button>

                  
                  {/* Machines Dropdown Menu */}
                  
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

                {/* Machine Details Button */}

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
                // In the mobile menu section (around line 500), add this after the profile links:
                <button
                  onClick={() => {
                    setIsMachineDetailsOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="block text-white hover:text-blue-200 py-2"
                >
                  Machine Details
                </button>
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

      {/* Machine Details Widget */}
      <MachineDetailsWidget
        isOpen={isMachineDetailsOpen}
        onClose={() => setIsMachineDetailsOpen(false)}
        machines={machines}
        handleDeleteMachine={handleDeleteMachine}
        openEditModal = {openEditModal}

      />
      {/* Add Machine Modal */}
      {isAddMachineModalOpen && (
        <AddMachineModal
          machineId={machineId}
          machinePassword={machinePassword}
          selectedMachineType={selectedMachineType}
          isAddingMachine={isAddingMachine}
          isAddMachineModalOpen={isAddMachineModalOpen}
          setMachineId={setMachineId}
          handleAddMachine={handleAddMachine}
          setMachinePassword={setMachinePassword}
          setSelectedMachineType={setSelectedMachineType}
          setIsAddingMachine={setIsAddingMachine}
          setIsAddMachineModalOpen={setIsAddMachineModalOpen}
        />
      )}

      {/* Edit Machine Modal */}
      {isEditMachineModalOpen && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <motion.div
      className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-gray-100"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Machine</h2>
            <p className="text-sm text-gray-500">Update machine configuration</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsEditMachineModalOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleEditMachine} className="space-y-6">
        <div className="space-y-5">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Machine Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={editMachineName}
                onChange={(e) => setEditMachineName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                         transition-all duration-200 bg-gray-50/50 hover:bg-white hover:border-gray-300"
                placeholder=""
                required
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Machine Type
            </label>
            <div className="relative">
              <select
                value={editMachineType || 'doordrishti'}
                onChange={(e) => setEditMachineType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                         transition-all duration-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 
                         appearance-none cursor-pointer"
                required
              >
                <option value="doordrishti">Door Drishti</option>
                <option value="drishti">Drishti</option>
                <option value="tarang">Tarang</option>
                <option value="pravaah">Pravh</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Machine code
            </label>
            <div className="relative">
              <input
                type="text"
                value={editMachineIp}
                onChange={(e) => setEditMachineIp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                         transition-all duration-200 bg-gray-50/50 hover:bg-white hover:border-gray-300"
                placeholder="e.g., 192.168.1.100"
                title="Please enter a valid code"
                required
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              fill all the details
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setIsEditMachineModalOpen(false)}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium 
                     hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 
                     transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isEditingMachine}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium 
                     hover:from-blue-700 hover:to-cyan-600 active:from-blue-800 active:to-cyan-700
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500
                     transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                     shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
          >
            {isEditingMachine ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Update Machine'
            )}
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