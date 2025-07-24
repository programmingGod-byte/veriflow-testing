"use client";

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSession } from 'next-auth/react';
import FeatureCard from './components/ui/FeatureCard';
import WaveAnimation from './components/ui/WaveAnimation';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Check authentication status
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  // Parallax effect values
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Background slider for flood scenes
  const floodScenes = [
    {
      title: "River Monitoring",
      description: "Real-time water level detection",
      bgGradient: "from-blue-600 via-blue-500 to-cyan-400",
      bgImage: "/monitoring-pattern.svg"
    },
    {
      title: "Flood Alerts", 
      description: "Early warning systems active",
      bgGradient: "from-purple-600 via-blue-600 to-cyan-500",
      bgImage: "/flood-pattern.svg"
    },
    {
      title: "Data Analytics",
      description: "Live data visualization", 
      bgGradient: "from-indigo-600 via-purple-600 to-blue-500",
      bgImage: "/hero-3d-bg.svg"
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % floodScenes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(1deg);
          }
          66% {
            transform: translateY(5px) rotate(-1deg);
          }
        }
        
        @keyframes pulse3d {
          0%, 100% {
            transform: scale(1) translateZ(0);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.05) translateZ(10px);
            opacity: 1;
          }
        }
      `}</style>
      
    <div className={`min-h-screen transition-all duration-500 overflow-hidden ${
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

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated Background Slider */}
        <div className="absolute inset-0 z-0">
          {floodScenes.map((scene, index) => (
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: currentSlide === index ? 1 : 0 
              }}
              transition={{ duration: 1.5 }}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${scene.bgImage})`,
                  filter: isDarkMode 
                    ? 'brightness(0.8) contrast(1.3) saturate(1.2) hue-rotate(10deg)' 
                    : 'brightness(0.9) contrast(1.1) saturate(1.1)',
                  transform: 'scale(1.05)',
                  transition: 'all 1.5s ease-in-out'
                }}
              />
              {/* Enhanced Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${scene.bgGradient} ${
                isDarkMode ? 'opacity-75' : 'opacity-65'
              }`} />
              {/* Advanced 3D Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%2300d4ff' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3Ccircle cx='40' cy='40' r='3' fill='%2300f5ff' opacity='0.6'/%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%230ea5e9' opacity='0.4'/%3E%3Ccircle cx='60' cy='60' r='2' fill='%2306d6a0' opacity='0.5'/%3E%3C/svg%3E")`,
                  backgroundSize: "40px 40px",
                  animation: 'float 20s ease-in-out infinite'
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* 3D Flood Visualization Background */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-20"
          style={{ y }}
        >
          {/* 3D Water Waves */}
          <svg 
            className="w-full h-full object-cover" 
            viewBox="0 0 1200 800" 
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isDarkMode ? "#1e40af" : "#3b82f6"} stopOpacity="0.6"/>
                <stop offset="50%" stopColor={isDarkMode ? "#0891b2" : "#06b6d4"} stopOpacity="0.4"/>
                <stop offset="100%" stopColor={isDarkMode ? "#0369a1" : "#0284c7"} stopOpacity="0.8"/>
              </linearGradient>
              
              <filter id="wave" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3"/>
              </filter>
            </defs>
            
            {/* Animated Water Layers */}
            <motion.path 
              d="M0,400 Q300,350 600,400 Q900,450 1200,400 L1200,800 L0,800 Z" 
              fill="url(#waterGradient)"
              filter="url(#wave)"
              animate={{ 
                d: [
                  "M0,400 Q300,350 600,400 Q900,450 1200,400 L1200,800 L0,800 Z",
                  "M0,420 Q300,370 600,420 Q900,470 1200,420 L1200,800 L0,800 Z",
                  "M0,400 Q300,350 600,400 Q900,450 1200,400 L1200,800 L0,800 Z"
                ]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
            
            <motion.path 
              d="M0,450 Q300,400 600,450 Q900,500 1200,450 L1200,800 L0,800 Z" 
              fill="url(#waterGradient)"
              opacity="0.6"
              animate={{ 
                d: [
                  "M0,450 Q300,400 600,450 Q900,500 1200,450 L1200,800 L0,800 Z",
                  "M0,470 Q300,420 600,470 Q900,520 1200,470 L1200,800 L0,800 Z",
                  "M0,450 Q300,400 600,450 Q900,500 1200,450 L1200,800 L0,800 Z"
                ]
              }}
              transition={{ 
                duration: 3.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 0.5
              }}
            />

            {/* Floating Debris */}
            <motion.circle 
              cx="200" cy="380" r="4" 
              fill={isDarkMode ? "#374151" : "#6b7280"}
              animate={{ 
                cx: [200, 250, 200],
                cy: [380, 370, 380]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <motion.circle 
              cx="600" cy="420" r="3" 
              fill={isDarkMode ? "#374151" : "#6b7280"}
              animate={{ 
                cx: [600, 650, 600],
                cy: [420, 410, 420]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1
              }}
            />
            <motion.circle 
              cx="900" cy="400" r="5" 
              fill={isDarkMode ? "#374151" : "#6b7280"}
              animate={{ 
                cx: [900, 950, 900],
                cy: [400, 390, 400]
              }}
              transition={{ 
                duration: 7,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 2
              }}
            />

            {/* Rain Effect */}
            {[...Array(20)].map((_, i) => (
              <motion.line
                key={i}
                x1={i * 60}
                y1={0}
                x2={i * 60 + 2}
                y2={20}
                stroke={isDarkMode ? "#60a5fa" : "#3b82f6"}
                strokeWidth="1"
                opacity="0.6"
                animate={{
                  y1: [0, 800],
                  y2: [20, 820]
                }}
                transition={{
                  duration: 2 + (i % 3),
                  repeat: Infinity,
                  ease: "linear",
                  delay: (i % 5) * 0.2
                }}
              />
            ))}
          </svg>
        </motion.div>

        {/* Particle System for Atmospheric Effect */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${
                isDarkMode ? 'bg-blue-300' : 'bg-blue-500'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        <div className={`absolute top-0 left-0 right-0 h-64 bg-gradient-to-b ${
          isDarkMode 
            ? 'from-blue-900/20 to-transparent' 
            : 'from-blue-500/10 to-transparent'
        } z-0`} />
        
        <div className="container mx-auto px-4 z-10 pt-24 relative">
          {/* Add backdrop blur for better text readability */}
          <div className="absolute inset-0 backdrop-blur-sm bg-black/10 rounded-lg -z-10" />
          <motion.div 
            className="grid md:grid-cols-2 gap-8 items-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
          <motion.div variants={fadeIn} className="text-center md:text-left">
              <motion.h1 
                className={`text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r ${
                  isDarkMode 
                    ? 'from-white to-cyan-300' 
                    : 'from-blue-700 to-cyan-600'
                } bg-clip-text text-transparent`}
                style={{
                  textShadow: isDarkMode 
                    ? '0 2px 4px rgba(0, 0, 0, 0.8), 0 4px 8px rgba(0, 0, 0, 0.6)' 
                    : '0 2px 4px rgba(255, 255, 255, 0.8), 0 4px 8px rgba(255, 255, 255, 0.4)'
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Intelligent Flood Detection System
              </motion.h1>
              
              <motion.p 
                className={`text-lg md:text-xl mb-8 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-800'
                }`}
                style={{
                  textShadow: isDarkMode 
                    ? '0 1px 3px rgba(0, 0, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.4)' 
                    : '0 1px 3px rgba(255, 255, 255, 0.8), 0 2px 6px rgba(255, 255, 255, 0.2)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Monitor river conditions in real-time and get early flood alerts with the next-generation Visiflow device.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {
                    isAuthenticated ? (
                      <Link 
                    href="/realtime-data" 
                    className={`px-8 py-3 rounded-full font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-lg inline-block border ${
                      isDarkMode 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400 border-blue-400 shadow-blue-500/25' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 border-blue-500 shadow-blue-600/25'
                    }`}
                    style={{
                      boxShadow: isDarkMode 
                        ? '0 4px 14px 0 rgba(59, 130, 246, 0.4), 0 2px 4px 0 rgba(0, 0, 0, 0.3)' 
                        : '0 4px 14px 0 rgba(37, 99, 235, 0.4), 0 2px 4px 0 rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    View Live Data
                  </Link>
                    ):(
                      <Link 
                    href="/auth" 
                    className={`px-8 py-3 rounded-full font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-lg inline-block border ${
                      isDarkMode 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400 border-blue-400 shadow-blue-500/25' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 border-blue-500 shadow-blue-600/25'
                    }`}
                    style={{
                      boxShadow: isDarkMode 
                        ? '0 4px 14px 0 rgba(59, 130, 246, 0.4), 0 2px 4px 0 rgba(0, 0, 0, 0.3)' 
                        : '0 4px 14px 0 rgba(37, 99, 235, 0.4), 0 2px 4px 0 rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    Sign In to View Data
                  </Link>
                    )
                  }
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href="/about" 
                    className={`px-8 py-3 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 inline-block backdrop-blur-sm ${
                      isDarkMode 
                        ? 'border-2 border-blue-400 text-blue-300 hover:bg-blue-900/50 focus:ring-blue-400 bg-blue-900/20' 
                        : 'border-2 border-blue-600 text-blue-700 hover:bg-blue-50/80 focus:ring-blue-500 bg-white/20'
                    }`}
                    style={{
                      boxShadow: isDarkMode 
                        ? '0 4px 14px 0 rgba(59, 130, 246, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.3)' 
                        : '0 4px 14px 0 rgba(37, 99, 235, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    Learn More
                  </Link>
                </motion.div>
              </motion.div>
              
              {/* Account Links - Only show when not authenticated */}
              {!isAuthenticated && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center md:justify-start text-sm">
                  <span className={`mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Already have an account?
                  </span>
                  <div className="flex items-center">
                    <Link 
                      href="/auth" 
                      className={`font-medium ${
                        isDarkMode 
                          ? 'text-blue-400 hover:text-blue-300' 
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      Sign In
                    </Link>
                    <span className={`mx-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>|</span>
                    <Link 
                      href="/auth?tab=signup" 
                      className={`font-medium ${
                        isDarkMode 
                          ? 'text-blue-400 hover:text-blue-300' 
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
            
            <motion.div 
              className="relative h-[300px] md:h-[500px]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Enhanced Device Visual */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  <motion.div 
                    className={`w-full h-full aspect-square bg-gradient-to-br ${
                      floodScenes[currentSlide].bgGradient
                    } rounded-xl shadow-2xl flex items-center justify-center overflow-hidden relative transform-gpu`}
                    style={{
                      backdropFilter: 'blur(10px)',
                      border: isDarkMode ? '2px solid rgba(0, 212, 255, 0.3)' : '2px solid rgba(14, 165, 233, 0.3)',
                      boxShadow: isDarkMode 
                        ? '0 25px 50px -12px rgba(0, 212, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        : '0 25px 50px -12px rgba(14, 165, 233, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    }}
                    animate={{ 
                      boxShadow: [
                        isDarkMode 
                          ? "0 25px 50px -12px rgba(0, 212, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)" 
                          : "0 25px 50px -12px rgba(14, 165, 233, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                        isDarkMode 
                          ? "0 35px 60px -15px rgba(0, 212, 255, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.15)"
                          : "0 35px 60px -15px rgba(14, 165, 233, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.25)",
                        isDarkMode 
                          ? "0 25px 50px -12px rgba(0, 212, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                          : "0 25px 50px -12px rgba(14, 165, 233, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                      ],
                      transform: [
                        "perspective(1000px) rotateX(0deg) rotateY(0deg)",
                        "perspective(1000px) rotateX(2deg) rotateY(-2deg)",
                        "perspective(1000px) rotateX(0deg) rotateY(0deg)"
                      ]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }}
                  >
                    {/* Enhanced 3D Background Pattern */}
                    <div className="absolute inset-0 opacity-15">
                      <svg viewBox="0 0 400 400" className="w-full h-full">
                        <defs>
                          <pattern id="deviceGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.8" opacity="0.6"/>
                            <path d="M 0 0 L 30 30" fill="none" stroke="white" strokeWidth="0.3" opacity="0.4"/>
                            <circle cx="0" cy="0" r="1" fill="white" opacity="0.7"/>
                          </pattern>
                          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="white" stopOpacity="0.1"/>
                          </radialGradient>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#deviceGrid)" />
                        <circle cx="200" cy="200" r="150" fill="url(#centerGlow)" />
                      </svg>
                    </div>

                    {/* Large V Logo */}
                    <div className={`text-9xl font-bold opacity-30 ${
                      isDarkMode ? 'text-white' : 'text-white'
                    }`}>V</div>
                    
                    {/* Centered Monitor Display */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div 
                        className="w-3/4 h-3/4 rounded-lg backdrop-blur-sm flex flex-col items-center justify-center p-6 border transform-gpu"
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.3)',
                          borderColor: isDarkMode ? 'rgba(0, 212, 255, 0.4)' : 'rgba(255, 255, 255, 0.4)',
                          borderWidth: '1px',
                          boxShadow: isDarkMode 
                            ? 'inset 0 2px 4px rgba(0, 212, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3)'
                            : 'inset 0 2px 4px rgba(255, 255, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}
                        animate={{ 
                          backgroundColor: isDarkMode 
                            ? ["rgba(15, 23, 42, 0.6)", "rgba(15, 23, 42, 0.8)", "rgba(15, 23, 42, 0.6)"]
                            : ["rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0.3)"],
                          transform: [
                            "perspective(500px) rotateX(0deg)",
                            "perspective(500px) rotateX(1deg)",
                            "perspective(500px) rotateX(0deg)"
                          ]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "reverse" 
                        }}
                      >
                        {/* Scene Title */}
                        <motion.div 
                          className="text-white text-sm mb-4 px-3 py-1 bg-white/20 rounded-full"
                          key={currentSlide}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {floodScenes[currentSlide].title}
                        </motion.div>

                        {/* VISIFLOW Branding */}
                        <motion.div 
                          className="text-white text-2xl font-bold mb-6 relative z-10"
                          animate={{ 
                            opacity: [1, 0.8, 1],
                            scale: [1, 1.02, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse" 
                          }}
                        >
                          VISIFLOW
                        </motion.div>

                        {/* Simple Data Bars */}
                        <div className="grid grid-cols-3 gap-2 w-full">
                          {[1, 2, 3, 4, 5, 6].map(i => (
                            <motion.div 
                              key={i} 
                              className="h-6 bg-blue-200/50 rounded"
                              animate={{ 
                                height: [`${1.5 + (i % 3) * 0.5}rem`, `${1 + (i % 3) * 0.5}rem`, `${1.5 + (i % 3) * 0.5}rem`]
                              }}
                              transition={{ 
                                duration: 2 + (i * 0.2),
                                repeat: Infinity,
                                repeatType: "reverse" 
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  {/* Enhanced 3D floating badge */}
                  <motion.div 
                    className={`absolute -top-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center text-white text-sm font-bold transform-gpu ${
                      isDarkMode ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-yellow-300 to-orange-400'
                    }`}
                    style={{
                      boxShadow: isDarkMode 
                        ? '0 8px 32px rgba(251, 191, 36, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                        : '0 8px 32px rgba(251, 191, 36, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}
                    animate={{ 
                      scale: [1, 1.15, 1],
                      rotate: [0, 8, 0, -8, 0],
                      y: [0, -5, 0],
                      boxShadow: [
                        isDarkMode 
                          ? '0 8px 32px rgba(251, 191, 36, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                          : '0 8px 32px rgba(251, 191, 36, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                        isDarkMode 
                          ? '0 12px 40px rgba(251, 191, 36, 0.6), inset 0 3px 6px rgba(255, 255, 255, 0.3)'
                          : '0 12px 40px rgba(251, 191, 36, 0.5), inset 0 3px 6px rgba(255, 255, 255, 0.4)',
                        isDarkMode 
                          ? '0 8px 32px rgba(251, 191, 36, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                          : '0 8px 32px rgba(251, 191, 36, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                      ]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    NEW
                  </motion.div>
                  
                  {/* Enhanced 3D glow effects */}
                  <motion.div 
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-2 ${
                      isDarkMode ? 'border-cyan-300/30' : 'border-blue-500/30'
                    }`}
                    style={{
                      boxShadow: isDarkMode 
                        ? '0 0 60px rgba(6, 182, 212, 0.3), inset 0 0 60px rgba(6, 182, 212, 0.1)'
                        : '0 0 60px rgba(59, 130, 246, 0.3), inset 0 0 60px rgba(59, 130, 246, 0.1)'
                    }}
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3],
                      rotate: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                  
                  <motion.div 
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border ${
                      isDarkMode ? 'border-blue-400/20' : 'border-cyan-400/20'
                    }`}
                    animate={{ 
                      scale: [1.1, 1, 1.1],
                      opacity: [0.2, 0.4, 0.2],
                      rotate: [0, -1, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 1
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        {/* <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ 
            y: [0, 10, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <div className="flex flex-col items-center">
            <p className={`mb-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Scroll to explore
            </p>
            <div className={`w-6 h-10 border-2 rounded-full flex justify-center pt-1 ${
              isDarkMode ? 'border-gray-400' : 'border-gray-600'
            }`}>
              <motion.div 
                className={`w-1.5 h-1.5 rounded-full ${
                  isDarkMode ? 'bg-gray-400' : 'bg-gray-600'
                }`}
                animate={{ y: [0, 4, 0] }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </div>
          </div>
        </motion.div> */}

        {/* Background Slide Indicators */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex space-x-3">
            {floodScenes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}

              />
            ))}
          </div>
          <div className="text-center mt-2">
            <motion.p 
              className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
              key={currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {floodScenes[currentSlide].title}
            </motion.p>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {floodScenes[currentSlide].description}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 relative ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <WaveAnimation className="h-32 absolute -top-32 left-0 right-0" />
        
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-900'
            }`}>
              Advanced Flood Detection Features
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Visiflow combines cutting-edge sensor technology with advanced analytics to protect communities
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Real-time Monitoring"
              description="Get access to live data about river flow, water levels, and velocity analytics with millisecond precision."
              delay={0}
              isDarkMode={isDarkMode}
            />
            
            <FeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              }
              title="3D Model Simulation"
              description="Visualize river conditions with advanced 3D modeling to understand flow dynamics and flood risk areas."
              delay={0.2}
              isDarkMode={isDarkMode}
            />
            
            <FeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              title="Early Warning Alerts"
              description="Receive instant alerts before flood conditions occur, giving you precious time to take preventive action."
              delay={0.4}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </section>

      {/* Data Visualization Section */}
      <section className={`py-20 relative ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="mb-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-900'
              }`}>
                Powerful Data Visualization
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Make informed decisions with our interactive dashboards and real-time analytics
              </p>
            </motion.div>
            
            <motion.div 
              className={`rounded-xl shadow-xl overflow-hidden ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <h3 className={`text-2xl font-bold mb-4 ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-900'
                  }`}>
                    Monitor River Flow in Real-Time
                  </h3>
                  <p className={`mb-6 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Our dashboard provides instant access to critical river flow data, and historical comparisons to help you anticipate flood conditions before they become dangerous.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Advanced algorithms
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-cyan-500 mr-3"></div>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Historical data comparison
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Visualize flow of river
                      </span>
                    </div>
                  </div>
                  
                  <motion.button 
                    className={`mt-8 inline-flex items-center font-medium self-start ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}
                    whileHover={{ x: 5 }}
                  >
                    <span>View Live Data</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </motion.button>
                </div>
                
                <div className={`md:w-1/2 bg-gradient-to-br ${
                  floodScenes[currentSlide].bgGradient
                } p-8 relative`}>
                  {/* Clean Sample Dashboard UI */}
                  <div className={`backdrop-blur-sm rounded-lg shadow-lg p-6 relative z-10 ${
                    isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
                  }`}>
                    <div className="flex justify-between mb-4">
                      <h4 className={`font-bold ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-900'
                      }`}>
                        Water Level Monitor
                      </h4>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    
                    <div className={`h-32 mb-4 rounded relative overflow-hidden ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      {/* Simple animated chart */}
                      <div className="absolute inset-0 flex items-end justify-center space-x-1 p-2">
                        {[...Array(8)].map((_, i) => (
                          <motion.div 
                            key={i}
                            className={`w-6 rounded-t ${
                              isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
                            }`}
                            animate={{ 
                              height: [`${30 + (i % 3) * 20}px`, `${20 + (i % 3) * 25}px`, `${30 + (i % 3) * 20}px`]
                            }}
                            transition={{ 
                              duration: 2 + (i * 0.2),
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className={`p-3 rounded ${
                        isDarkMode ? 'bg-blue-900/50' : 'bg-blue-50'
                      }`}>
                        <p className={`font-medium ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-600'
                        }`}>
                          Current Level
                        </p>
                        <motion.p 
                          className={`text-2xl font-bold ${
                            isDarkMode ? 'text-blue-200' : 'text-blue-900'
                          }`}
                          animate={{ opacity: [1, 0.7, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          2.4m
                        </motion.p>
                      </div>
                      <div className={`p-3 rounded ${
                        isDarkMode ? 'bg-green-900/50' : 'bg-green-50'
                      }`}>
                        <p className={`font-medium ${
                          isDarkMode ? 'text-green-300' : 'text-green-600'
                        }`}>
                          Status
                        </p>
                        <p className={`text-2xl font-bold ${
                          isDarkMode ? 'text-green-200' : 'text-green-900'
                        }`}>
                          Normal
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={`py-20 text-white relative overflow-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-r from-blue-800 to-cyan-700' 
          : 'bg-gradient-to-r from-blue-600 to-cyan-500'
      }`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Protect Your Community?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of communities already using Visiflow to stay ahead of flood risks
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/contact" 
                  className={`px-8 py-4 rounded-full font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-lg inline-block ${
                    isDarkMode 
                      ? 'bg-white text-blue-800 hover:bg-gray-100' 
                      : 'bg-white text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  Get Started Today
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Animated background elements */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full opacity-10"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px"
          }}
        />
      </section>

      {/* Footer */}
        </div>
    </>
  );
}