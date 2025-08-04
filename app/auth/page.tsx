'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Separate client component for search params
import SearchParamsProvider from '../../components/SearchParamsProvider';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.6,
      staggerChildren: 0.1 
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const tabVariants = {
  inactive: { opacity: 0.7, y: 0 },
  active: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signin');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formFocus, setFormFocus] = useState<string | null>(null);
  const [callbackUrl, setCallbackUrl] = useState('/');

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
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // Form validation state
  const [validation, setValidation] = useState({
    name: { valid: true, message: '' },
    email: { valid: true, message: '' },
    password: { valid: true, message: '' },
    confirmPassword: { valid: true, message: '' }
  });
  
  const router = useRouter();
  const { data: session, status } = useSession();

  // Get callbackUrl from the SearchParamsProvider
  useEffect(() => {
    const searchParamsDiv = document.querySelector('[data-callback-url]');
    if (searchParamsDiv) {
      const url = searchParamsDiv.getAttribute('data-callback-url');
      if (url) setCallbackUrl(url);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    // Reset validation
    setValidation({
      name: { valid: true, message: '' },
      email: { valid: true, message: '' },
      password: { valid: true, message: '' },
      confirmPassword: { valid: true, message: '' }
    });
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset individual field validation on change
    setValidation(prev => ({
      ...prev,
      [name]: { valid: true, message: '' }
    }));
  };

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const validatePassword = (password: string) => {
    return password.length >= 6; // Simple validation - extend as needed
  };

  // Handle form input focus/blur
  const handleFocus = (field: string) => {
    setFormFocus(field);
  };

  const handleBlur = () => {
    setFormFocus(null);
  };

  // Handle sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate form
    let isValid = true;
    const newValidation = { ...validation };
    
    if (!formData.email) {
      newValidation.email = { valid: false, message: 'Email is required' };
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newValidation.email = { valid: false, message: 'Please enter a valid email' };
      isValid = false;
    }
    
    if (!formData.password) {
      newValidation.password = { valid: false, message: 'Password is required' };
      isValid = false;
    }
    
    if (!isValid) {
      setValidation(newValidation);
      setIsLoading(false);
      return;
    }
    
    try {
      const { email, password } = formData;
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      
      router.push(callbackUrl);
    } catch (error) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  // Handle sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    // Validate form
    let isValid = true;
    const newValidation = { ...validation };
    
    if (!formData.name) {
      newValidation.name = { valid: false, message: 'Name is required' };
      isValid = false;
    }
    
    if (!formData.email) {
      newValidation.email = { valid: false, message: 'Email is required' };
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newValidation.email = { valid: false, message: 'Please enter a valid email' };
      isValid = false;
    }
    
    if (!formData.password) {
      newValidation.password = { valid: false, message: 'Password is required' };
      isValid = false;
    } else if (!validatePassword(formData.password)) {
      newValidation.password = { valid: false, message: 'Password must be at least 6 characters' };
      isValid = false;
    }
    
    if (!formData.confirmPassword) {
      newValidation.confirmPassword = { valid: false, message: 'Please confirm your password' };
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newValidation.confirmPassword = { valid: false, message: 'Passwords do not match' };
      isValid = false;
    }
    
    if (!isValid) {
      setValidation(newValidation);
      setIsLoading(false);
      return;
    }
    
    try {
      const { name, email, password } = formData;
      
      // Register user
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || 'Registration failed');
        setIsLoading(false);
        return;
      }
      
      setSuccess('Registration successful! You can now sign in.');
      setFormData({
        ...formData,
        name: '',
        password: '',
        confirmPassword: '',
      });
      setActiveTab('signin');
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      setError('Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden transition-all duration-500 ${
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

      {/* Wrap the component in Suspense */}
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsProvider 
          onTabChange={handleTabChange} 
          setActiveTab={setActiveTab} 
        />
      </Suspense>
      
      {/* Decorative elements */}
      <motion.div 
        className={`absolute top-20 left-20 w-64 h-64 rounded-full mix-blend-multiply filter blur-xl opacity-20 ${
          isDarkMode ? 'bg-blue-600' : 'bg-blue-400'
        }`}
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity, 
          repeatType: "reverse" 
        }}
      />
      <motion.div 
        className={`absolute bottom-20 right-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 ${
          isDarkMode ? 'bg-cyan-600' : 'bg-cyan-300'
        }`}
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity, 
          repeatType: "reverse" 
        }}
      />
      
      <motion.div 
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className={`backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border ${
            isDarkMode 
              ? 'bg-gray-800/90 border-gray-600/50' 
              : 'bg-white/90 border-white/50'
          }`}
          whileHover={{ boxShadow: isDarkMode ? "0 20px 30px -10px rgba(0, 0, 0, 0.3)" : "0 20px 30px -10px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.2 }}
        >
          {/* Tabs */}
          <div className="flex relative">
            <motion.button
              className={`flex-1 py-5 text-center font-medium relative z-10 ${
                activeTab === 'signin' 
                  ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') 
                  : (isDarkMode ? 'text-gray-400' : 'text-gray-600')
              }`}
              variants={tabVariants}
              animate={activeTab === 'signin' ? 'active' : 'inactive'}
              onClick={() => handleTabChange('signin')}
              whileHover={{ opacity: activeTab === 'signin' ? 1 : 0.9 }}
              transition={{ duration: 0.2 }}
            >
              Sign In
            </motion.button>
            <motion.button
              className={`flex-1 py-5 text-center font-medium relative z-10 ${
                activeTab === 'signup' 
                  ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') 
                  : (isDarkMode ? 'text-gray-400' : 'text-gray-600')
              }`}
              variants={tabVariants}
              animate={activeTab === 'signup' ? 'active' : 'inactive'}
              onClick={() => handleTabChange('signup')}
              whileHover={{ opacity: activeTab === 'signup' ? 1 : 0.9 }}
              transition={{ duration: 0.2 }}
            >
              Sign Up
            </motion.button>
            
            {/* Animated tab indicator */}
            <motion.div 
              className="absolute bottom-0 h-0.5 bg-blue-600 z-0"
              animate={{ 
                left: activeTab === 'signin' ? '0%' : '50%',
                right: activeTab === 'signup' ? '0%' : '50%'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              {/* Logo */}
              <motion.div 
                className="text-center mb-8"
                variants={itemVariants}
              >
                <Link href="/" className="inline-flex items-center gap-2">
                  <motion.div 
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span>V</span>
                  </motion.div>
                  <motion.span 
                    className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    VISIFLOW
                  </motion.span>
                </Link>
              </motion.div>

              {/* Error and Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-3 border border-red-100"
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </motion.div>
                )}
                
                {success && (
                  <motion.div 
                    className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg text-sm flex items-start gap-3 border border-green-100"
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sign In Form */}
              {activeTab === 'signin' && (
                <motion.form 
                  onSubmit={handleSignIn}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div className="mb-5" variants={itemVariants}>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => handleFocus('email')}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 border ${!validation.email.valid ? 'border-red-300 bg-red-50' : formFocus === 'email' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} rounded-lg transition-all duration-200 text-blue-900 placeholder-gray-400`}
                        placeholder="Your email address"
                      />
                      {!validation.email.valid && (
                        <motion.p 
                          className="mt-1 text-sm text-red-600"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {validation.email.message}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div className="mb-6" variants={itemVariants}>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => handleFocus('password')}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 border ${!validation.password.valid ? 'border-red-300 bg-red-50' : formFocus === 'password' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} rounded-lg transition-all duration-200 text-blue-900 placeholder-gray-400`}
                        placeholder="Your password"
                      />
                      {!validation.password.valid && (
                        <motion.p 
                          className="mt-1 text-sm text-red-600"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {validation.password.message}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-4 flex justify-center items-center shadow-md hover:shadow-lg"
                    whileHover={{ translateY: -2 }}
                    whileTap={{ translateY: 0 }}
                    variants={itemVariants}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </motion.button>
                </motion.form>
              )}

              {/* Sign Up Form */}
              {activeTab === 'signup' && (
                <motion.form 
                  onSubmit={handleSignUp}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div className="mb-5" variants={itemVariants}>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => handleFocus('name')}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 border ${!validation.name.valid ? 'border-red-300 bg-red-50' : formFocus === 'name' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} rounded-lg transition-all duration-200 text-blue-900 placeholder-gray-400`}
                        placeholder="Your full name"
                      />
                      {!validation.name.valid && (
                        <motion.p 
                          className="mt-1 text-sm text-red-600"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {validation.name.message}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div className="mb-5" variants={itemVariants}>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="signup-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => handleFocus('email')}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 border ${!validation.email.valid ? 'border-red-300 bg-red-50' : formFocus === 'email' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} rounded-lg transition-all duration-200 text-blue-900 placeholder-gray-400`}
                        placeholder="Your email address"
                      />
                      {!validation.email.valid && (
                        <motion.p 
                          className="mt-1 text-sm text-red-600"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {validation.email.message}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div className="mb-5" variants={itemVariants}>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => handleFocus('password')}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 border ${!validation.password.valid ? 'border-red-300 bg-red-50' : formFocus === 'password' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} rounded-lg transition-all duration-200 text-blue-900 placeholder-gray-400`}
                        placeholder="Create a password"
                      />
                      {!validation.password.valid && (
                        <motion.p 
                          className="mt-1 text-sm text-red-600"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {validation.password.message}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div className="mb-6" variants={itemVariants}>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={() => handleFocus('confirmPassword')}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 border ${!validation.confirmPassword.valid ? 'border-red-300 bg-red-50' : formFocus === 'confirmPassword' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'} rounded-lg transition-all duration-200 text-blue-900 placeholder-gray-400`}
                        placeholder="Confirm your password"
                      />
                      {!validation.confirmPassword.valid && (
                        <motion.p 
                          className="mt-1 text-sm text-red-600"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {validation.confirmPassword.message}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-4 flex justify-center items-center shadow-md hover:shadow-lg"
                    whileHover={{ translateY: -2 }}
                    whileTap={{ translateY: 0 }}
                    variants={itemVariants}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </motion.button>
                </motion.form>
              )}

              {/* OR Divider */}
              <motion.div 
                className="relative my-6"
                variants={itemVariants}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </motion.div>

              {/* Google Sign In */}
              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium shadow-sm transition-all"
                whileHover={{ 
                  scale: 1.01, 
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#f9f9f9"
                }}
                whileTap={{ scale: 0.99 }}
                variants={itemVariants}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.9895 10.1871C19.9895 9.36767 19.9214 8.76973 19.7742 8.14966H10.1992V11.848H15.8195C15.7062 12.7671 15.0943 14.1512 13.7346 15.0812L13.7155 15.2051L16.7429 17.4969L16.9527 17.5174C18.8789 15.7789 19.9895 13.2212 19.9895 10.1871Z" fill="#4285F4"/>
                  <path d="M10.1992 19.9313C12.9528 19.9313 15.2886 19.0454 16.9527 17.5174L13.7346 15.0812C12.8734 15.6682 11.7176 16.0779 10.1992 16.0779C7.50245 16.0779 5.21352 14.3395 4.39759 11.9366L4.27799 11.9466L1.13003 14.3273L1.08887 14.4391C2.74588 17.6945 6.2023 19.9313 10.1992 19.9313Z" fill="#34A853"/>
                  <path d="M4.39748 11.9366C4.18219 11.3166 4.05759 10.6521 4.05759 9.96565C4.05759 9.27907 4.18219 8.61473 4.38615 7.99466L4.38045 7.8626L1.19304 5.44366L1.08875 5.49214C0.397576 6.84305 0.000976562 8.36008 0.000976562 9.96565C0.000976562 11.5712 0.397576 13.0882 1.08875 14.4391L4.39748 11.9366Z" fill="#FBBC05"/>
                  <path d="M10.1992 3.85336C12.1142 3.85336 13.4068 4.66168 14.1551 5.33717L17.0152 2.59107C15.2773 0.985496 12.9528 0 10.1992 0C6.2023 0 2.74588 2.23672 1.08887 5.49214L4.38626 7.99466C5.21352 5.59183 7.50245 3.85336 10.1992 3.85336Z" fill="#EB4335"/>
                </svg>
                <span>Continue with Google</span>
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        
        {/* Back to home link */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link 
            href="/" 
            className="text-gray-600 hover:text-blue-600 text-sm transition-colors flex items-center justify-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
} 