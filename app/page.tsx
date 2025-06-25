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
        {/* Background Effect */}
        <motion.div 
          className="absolute inset-0 z-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-10"
          style={{ y }}
        />
        
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
                      
                      {/* Alert level lines */}
                      <motion.div 
                        className="absolute top-[20%] left-0 right-0 border-t border-dashed border-yellow-500"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div 
                        className="absolute top-[10%] left-0 right-0 border-t border-dashed border-red-500"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div 
                        className="bg-blue-50 p-3 rounded"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-xs text-gray-500">Current Level</div>
                        <motion.div 
                          className="text-lg font-bold text-blue-900"
                          animate={{ opacity: [1, 0.8, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          4.2 m
                        </motion.div>
                      </motion.div>
                      <motion.div 
                        className="bg-green-50 p-3 rounded"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-xs text-gray-500">Status</div>
                        <motion.div 
                          className="text-lg font-bold text-green-600"
                          animate={{ opacity: [1, 0.8, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        >
                          Safe
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <motion.div 
                    className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.7, 0.5]
                    }}
                    transition={{ 
                      duration: 5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                  <motion.div 
                    className="absolute bottom-0 left-0 w-40 h-40 bg-blue-900/10 rounded-full blur-xl"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.7, 0.5]
                    }}
                    transition={{ 
                      duration: 7,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500 text-white relative">
        {/* Removed WaveAnimation */}
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to protect your community?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of communities using Visiflow to stay safe from flood disasters
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/contact" 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-full font-medium transition-all duration-300 inline-block"
                >
                  Get Visiflow Today
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/auth?tab=signup" 
                  className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 inline-block border border-white/30"
                >
                  Create Account
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
