"use client";

import { ReactNode } from 'react';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
  isDarkMode?: boolean;
}

export default function FeatureCard({ icon, title, description, delay = 0, isDarkMode = false }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ y: -10 }}
    >
      <Tilt
        className="h-full"
        tiltMaxAngleX={5}
        tiltMaxAngleY={5}
        glareEnable
        glareMaxOpacity={isDarkMode ? 0.05 : 0.1}
        glareColor={isDarkMode ? "#60a5fa" : "#3b82f6"}
        glarePosition="all"
        scale={1.02}
        transitionSpeed={1500}
        tiltReverse
      >
        <div className={`rounded-xl p-8 h-full shadow-lg backdrop-blur-sm border ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' 
            : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100'
        }`}>
          <div className="relative z-10">
            <div className={`w-16 h-16 rounded-lg mb-6 flex items-center justify-center text-white shadow-md ${
              isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              {icon}
            </div>
            <h3 className={`text-xl font-bold mb-3 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-900'
            }`}>
              {title}
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {description}
            </p>

            <motion.div 
              className={`mt-6 flex items-center font-medium cursor-pointer ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}
              whileHover={{ x: 5 }}
            >
              {/* <span>Learn more</span> */}
              {/* <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 ml-1"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg> */}
            </motion.div>
          </div>

          {/* Background decoration */}
          <div className={`absolute top-4 right-4 w-20 h-20 rounded-full opacity-20 blur-xl -z-10 ${
            isDarkMode ? 'bg-blue-400' : 'bg-blue-200'
          }`} />
          <div className={`absolute bottom-4 left-4 w-32 h-32 rounded-full opacity-20 blur-xl -z-10 ${
            isDarkMode ? 'bg-cyan-400' : 'bg-cyan-200'
          }`} />
        </div>
      </Tilt>
    </motion.div>
  );
} 