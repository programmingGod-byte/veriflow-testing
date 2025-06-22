"use client";

import { ReactNode } from 'react';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
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
        glareMaxOpacity={0.1}
        glareColor="#3b82f6"
        glarePosition="all"
        scale={1.02}
        transitionSpeed={1500}
        tiltReverse
      >
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 h-full shadow-lg border border-blue-100 backdrop-blur-sm">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-500 rounded-lg mb-6 flex items-center justify-center text-white shadow-md">
              {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-blue-900">{title}</h3>
            <p className="text-gray-600">
              {description}
            </p>

            <motion.div 
              className="mt-6 flex items-center text-blue-600 font-medium cursor-pointer"
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
          <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-blue-200 opacity-20 blur-xl -z-10" />
          <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full bg-cyan-200 opacity-20 blur-xl -z-10" />
        </div>
      </Tilt>
    </motion.div>
  );
} 