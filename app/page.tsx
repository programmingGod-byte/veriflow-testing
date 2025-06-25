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
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* River Conservation Background Effect */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-15"
          style={{ y }}
        >
          {/* Option 1: Using CSS background with river conservation pattern */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 800'%3E%3Cdefs%3E%3Cstyle%3E.river-bg%7Bfill:none;stroke:%23000;stroke-width:0.8;opacity:0.6%7D%3C/style%3E%3C/defs%3E%3Cg class='river-bg'%3E%3Cpath d='M0,400 Q250,300 500,400 T1000,400' /%3E%3Cpath d='M0,420 Q250,320 500,420 T1000,420' /%3E%3Cpath d='M0,380 Q250,280 500,380 T1000,380' /%3E%3Ccircle cx='150' cy='350' r='8'/%3E%3Ccircle cx='350' cy='450' r='6'/%3E%3Ccircle cx='650' cy='320' r='10'/%3E%3Ccircle cx='850' cy='440' r='7'/%3E%3Cpath d='M100,200 L120,180 L140,200 L160,180 L180,200' /%3E%3Cpath d='M300,150 L320,130 L340,150 L360,130 L380,150' /%3E%3Cpath d='M500,600 L520,580 L540,600 L560,580 L580,600' /%3E%3Cpath d='M700,650 L720,630 L740,650 L760,630 L780,650' /%3E%3Cpath d='M50,500 Q100,480 150,500 Q200,520 250,500' /%3E%3Cpath d='M750,300 Q800,280 850,300 Q900,320 950,300' /%3E%3Cellipse cx='200' cy='250' rx='30' ry='15'/%3E%3Cellipse cx='800' cy='550' rx='35' ry='18'/%3E%3Cpath d='M400,100 L450,120 L500,100 L550,120 L600,100' /%3E%3Cpath d='M100,700 L150,720 L200,700 L250,720 L300,700' /%3E%3C/g%3E%3C/svg%3E")`,
              filter: 'grayscale(100%)'
            }}
          />
          
          {/* Additional overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 via-transparent to-gray-900/10" />
        </motion.div>
        
        {/* Alternative Option 2: More detailed river conservation SVG pattern */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-10"
          style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "20%"]) }}
        >
          <svg 
            className="w-full h-full object-cover" 
            viewBox="0 0 1200 800" 
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id="riverPattern" patternUnits="userSpaceOnUse" width="200" height="200">
                <path d="M0,100 Q50,80 100,100 T200,100" fill="none" stroke="#000" strokeWidth="1" opacity="0.3"/>
                <path d="M0,120 Q50,100 100,120 T200,120" fill="none" stroke="#000" strokeWidth="0.8" opacity="0.2"/>
                <path d="M0,80 Q50,60 100,80 T200,80" fill="none" stroke="#000" strokeWidth="0.6" opacity="0.25"/>
                <circle cx="50" cy="90" r="3" fill="#000" opacity="0.2"/>
                <circle cx="150" cy="110" r="2" fill="#000" opacity="0.15"/>
                <path d="M20,30 L30,20 L40,30 L50,20 L60,30" fill="none" stroke="#000" strokeWidth="0.8" opacity="0.3"/>
                <path d="M120,170 L130,160 L140,170 L150,160 L160,170" fill="none" stroke="#000" strokeWidth="0.8" opacity="0.3"/>
                <ellipse cx="80" cy="50" rx="15" ry="8" fill="none" stroke="#000" strokeWidth="0.6" opacity="0.2"/>
                <ellipse cx="130" cy="150" rx="12" ry="6" fill="none" stroke="#000" strokeWidth="0.6" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#riverPattern)"/>
            
            {/* Main river flow */}
            <path 
              d="M0,400 Q300,350 600,400 Q900,450 1200,400" 
              fill="none" 
              stroke="#000" 
              strokeWidth="3" 
              opacity="0.15"
            />
            <path 
              d="M0,420 Q300,370 600,420 Q900,470 1200,420" 
              fill="none" 
              stroke="#000" 
              strokeWidth="2" 
              opacity="0.1"
            />
            
            {/* Conservation elements - trees and vegetation */}
            <g opacity="0.12">
              <circle cx="100" cy="200" r="25" fill="none" stroke="#000" strokeWidth="1"/>
              <circle cx="110" cy="190" r="15" fill="none" stroke="#000" strokeWidth="0.8"/>
              <circle cx="90" cy="185" r="18" fill="none" stroke="#000" strokeWidth="0.8"/>
              <line x1="100" y1="225" x2="100" y2="250" stroke="#000" strokeWidth="2"/>
            </g>
            
            <g opacity="0.12">
              <circle cx="300" cy="150" r="30" fill="none" stroke="#000" strokeWidth="1"/>
              <circle cx="315" cy="140" r="20" fill="none" stroke="#000" strokeWidth="0.8"/>
              <circle cx="285" cy="135" r="22" fill="none" stroke="#000" strokeWidth="0.8"/>
              <line x1="300" y1="180" x2="300" y2="210" stroke="#000" strokeWidth="2"/>
            </g>
            
            <g opacity="0.12">
              <circle cx="900" cy="600" r="28" fill="none" stroke="#000" strokeWidth="1"/>
              <circle cx="920" cy="590" r="18" fill="none" stroke="#000" strokeWidth="0.8"/>
              <circle cx="880" cy="585" r="20" fill="none" stroke="#000" strokeWidth="0.8"/>
              <line x1="900" y1="628" x2="900" y2="660" stroke="#000" strokeWidth="2"/>
            </g>
            
            {/* Fish and aquatic life representations */}
            <g opacity="0.08">
              <ellipse cx="200" cy="410" rx="12" ry="6" fill="#000"/>
              <ellipse cx="450" cy="390" rx="10" ry="5" fill="#000"/>
              <ellipse cx="700" cy="430" rx="14" ry="7" fill="#000"/>
              <ellipse cx="950" cy="410" rx="11" ry="5.5" fill="#000"/>
            </g>
            
            {/* Water ripples */}
            <g opacity="0.06">
              <circle cx="250" cy="380" r="20" fill="none" stroke="#000" strokeWidth="0.5"/>
              <circle cx="250" cy="380" r="35" fill="none" stroke="#000" strokeWidth="0.3"/>
              <circle cx="550" cy="420" r="25" fill="none" stroke="#000" strokeWidth="0.5"/>
              <circle cx="550" cy="420" r="40" fill="none" stroke="#000" strokeWidth="0.3"/>
              <circle cx="800" cy="400" r="30" fill="none" stroke="#000" strokeWidth="0.5"/>
              <circle cx="800" cy="400" r="45" fill="none" stroke="#000" strokeWidth="0.3"/>
            </g>
          </svg>
        </motion.div>
        
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-500/10 to-transparent z-0" />
        
        <div className="container mx-auto px-4 z-10 pt-24 relative">
          <motion.div 
            className="grid md:grid-cols-2 gap-8 items-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
          <motion.div variants={fadeIn} className="text-center md:text-left">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Intelligent Flood Detection System
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-700 mb-8"
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg inline-block"
                  >
                    View Live Data
                  </Link>
                    ):(
                      <Link 
                    href="/auth" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg inline-block"
                  >
                    Sign In to View Data
                  </Link>
                    )
                  }
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    href="/about" 
                    className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 inline-block"
                  >
                    Learn More
                  </Link>
                </motion.div>
              </motion.div>
              
              {/* Account Links - Only show when not authenticated */}
              {!isAuthenticated && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center md:justify-start text-sm">
                  <span className="mr-2 text-gray-600">Already have an account?</span>
                  <div className="flex items-center">
                    <Link href="/auth" className="text-blue-600 hover:text-blue-800 font-medium">
                      Sign In
                    </Link>
                    <span className="mx-2 text-gray-500">|</span>
                    <Link href="/auth?tab=signup" className="text-blue-600 hover:text-blue-800 font-medium">
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
              {/* Animated Device Visual */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  <motion.div 
                    className="w-full h-full aspect-square bg-gradient-to-br from-blue-600 to-cyan-400 rounded-xl shadow-2xl flex items-center justify-center overflow-hidden"
                    animate={{ 
                      boxShadow: [
                        "0 25px 50px -12px rgba(0, 0, 0, 0.25)", 
                        "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
                        "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                      ]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }}
                  >
                    <div className="text-white text-9xl font-bold opacity-30">V</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div 
                        className="w-3/4 h-3/4 rounded-lg bg-white/20 backdrop-blur-sm flex flex-col items-center justify-center p-4"
                        animate={{ 
                          backgroundColor: ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.2)"]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "reverse" 
                        }}
                      >
                        <motion.div 
                          className="w-20 h-2 bg-blue-200 rounded-full mb-4"
                          animate={{ width: ["5rem", "6rem", "5rem"] }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse" 
                          }}
                        />
                        <div className="w-full h-24 bg-blue-900/30 rounded-lg mb-4 flex items-center justify-center">
                          <motion.div 
                            className="text-white text-xl"
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
                        </div>
                        <div className="grid grid-cols-3 gap-2 w-full">
                          {[1, 2, 3, 4, 5, 6].map(i => (
                            <motion.div 
                              key={i} 
                              className="h-8 bg-blue-200/50 rounded"
                              animate={{ 
                                height: [`${2 + (i % 3)}rem`, `${1.5 + (i % 3)}rem`, `${2 + (i % 3)}rem`]
                              }}
                              transition={{ 
                                duration: 3 + (i * 0.2),
                                repeat: Infinity,
                                repeatType: "reverse" 
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  {/* Animated elements */}
                  <motion.div 
                    className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    NEW
                  </motion.div>
                  
                  <motion.div 
                    className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-xl"
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
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
            <p className="text-gray-600 mb-2 text-sm">Scroll to explore</p>
            <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-1">
              <motion.div 
                className="w-1.5 h-1.5 bg-gray-600 rounded-full"
                animate={{ y: [0, 4, 0] }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative">
        <WaveAnimation className="h-32 absolute -top-32 left-0 right-0" />
        
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-900">Advanced Flood Detection Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
            />
          </div>
        </div>
      </section>

      {/* Data Visualization Section */}
      <section className="py-20 bg-gray-50 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="mb-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-900">Powerful Data Visualization</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Make informed decisions with our interactive dashboards and real-time analytics
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">Monitor River Flow in Real-Time</h3>
                  <p className="text-gray-600 mb-6">
                    Our dashboard provides instant access to critical river flow data, and historical comparisons to help you anticipate flood conditions before they become dangerous.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                      <span className="text-gray-700">Advanced algorithms</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-cyan-500 mr-3"></div>
                      <span className="text-gray-700">Historical data comparison</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-gray-700">Visualize flow of river</span>
                    </div>
                  </div>
                  
                  <motion.button 
                    className="mt-8 inline-flex items-center text-blue-600 font-medium self-start"
                    whileHover={{ x: 5 }}
                  >
                    <span>View Live Data</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </motion.button>
                </div>
                
                <div className="md:w-1/2 bg-gradient-to-br from-blue-500 to-cyan-500 p-8 relative">
                  {/* Sample Dashboard UI */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 relative z-10">
                    <div className="flex justify-between mb-4">
                      <h4 className="font-bold text-blue-900">Water Level Monitor</h4>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    
                    <div className="h-40 mb-4 bg-gray-100 rounded relative overflow-hidden">
                      {/* Animated chart */}
                      <div className="absolute inset-0 flex items-end">
                        {[...Array(20)].map((_, i) => (
                          <motion.div 
                            key={i}
                            className={`h-[${20 + (i % 3) * 20}%] w-[5%] ${
                              i > 7 && i < 11 ? 'bg-blue-600' : 
                              i > 4 && i < 14 ? 'bg-blue-500' : 'bg-blue-400'
                            }`}
                            animate={{ 
                              height: [
                                `${20 + (i % 3) * 20}%`, 
                                `${20 + ((i + 2) % 5) * 15}%`, 
                                `${20 + (i % 3) * 20}%`
                              ] 
                            }}
                            transition={{ 
                              duration: 3 + (i % 3),
                              repeat: Infinity,
                              repeatType: "reverse"
                              }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-blue-600 font-medium">Current Level</p>
                        <motion.p 
                          className="text-2xl font-bold text-blue-900"
                          animate={{ opacity: [1, 0.7, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          2.4m
                        </motion.p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-green-600 font-medium">Status</p>
                        <p className="text-2xl font-bold text-green-900">Normal</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating elements */}
                  <motion.div 
                    className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <motion.div 
                    className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 rounded-full"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, -180, -360]
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500 text-white relative overflow-hidden">
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
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-lg inline-block"
                >
                  Get Started Today
                </Link>
              </motion.div>
              {/* <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/demo" 
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 inline-block"
                >
                  Request Demo
                </Link>
              </motion.div> */}
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
  );
}