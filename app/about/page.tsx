"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

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

export default function About() {
  // Team members data

  const teamMembers = [
    {
      name: "Dr. Vivek Gupta",
      role: "",
      bio: "Faculty Advisor at Visiflow, Prof. Vivek Gupta provides guidance on technical strategy and research direction. His expertise and mentorship play a vital role in shaping the project's real-world impact and academic rigor.",
      image: "https://pbs.twimg.com/profile_images/1639867545548382208/hx9KZE5z_400x400.jpg"
    },
    
    {
      name: "Dharkan Anand",
      role: "",
      bio: "Dharkan leads the vision and core development of the system. With a strong foundation in engineering, he focuses on turning complex river data into actionable insights for early flood detection.",
      image: "dharkanBhaiya.jpg"
    },
    {
      name: "Om Maheshawri",
      role: "",
      bio: "Om brings a sharp technical mindset and a practical approach to problem-solving. He plays a key role in developing robust systems and ensuring the reliability of our flood monitoring technology in real-world conditions.",
      image: "omBhaiya.jpg"
    },
    {
      name: "Kunal Mittal",
      role: "",
      bio: "A core team member at Visiflow, Kunal focuses on building seamless user experiences and scalable backend systems. His work bridges the gap between field data and intuitive digital platforms, helping deliver real-time insights to users.",
      image: "kunal.jpg"
    },
    
  ];

  // Company milestones
  const milestones = [
    
    {
      year: "2024",
      title: "Visiflow Founded",
      description: "Founded by Om Maheshawri"
    },
    {
      year: "2024",
      title: "First Prototype",
      description: "Development of the first Visiflow sensor prototype, capable of monitoring water levels with unprecedented accuracy."
    },
    
    {
      year: "2024",
      title: "First Deployments",
      description: "Successfully deployed sensors in 5 flood-prone regions, providing early warnings that helped evacuate over 15,000 people."
    },
    {
      year: "2024",
      title: "AI Integration",
      description: "Introduced advanced AI algorithms to enhance prediction accuracy, reducing false alarms by 78%."
    },
    
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('/flood-pattern.png')] bg-repeat opacity-10"></div>
          <div className="h-40 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            About Visiflow
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Empowering communities to predict, prepare for, and prevent flood disasters through innovative technology
          </motion.p>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="#f0f9ff" fillOpacity="1" d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,181.3C672,181,768,203,864,218.7C960,235,1056,245,1152,229.3C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>
      
      {/* Our Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="grid md:grid-cols-2 gap-12 items-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn}>
                <h2 className="text-3xl font-bold text-blue-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-700 mb-6">
                  At Visiflow, we're on a mission to revolutionize how communities predict and respond to flood threats. 
                  We believe that with the right technology and information, the devastating impact of floods can be significantly reduced.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Our advanced sensor devices and AI-powered analytics provide unprecedented accuracy in water level monitoring and flood prediction, 
                  giving communities valuable time to prepare and respond.
                </p>
                <p className="text-lg text-gray-700">
                  Beyond technology, we work closely with local governments, emergency services, and communities to implement 
                  effective early warning systems and develop comprehensive flood preparedness plans.
                </p>
              </motion.div>
              
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br p-1">
                  <div className="bg-white rounded-xl overflow-hidden relative">
                    <Image 
                      src="/aboutImage.png" 
                      alt="Visiflow mission" 
                      width={600} 
                      height={400}
                      className="w-full object-cover"
                      unoptimized // For placeholder purposes
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/80 to-transparent p-6">
                      <p className="text-white font-medium">
                        "Technology that saves lives and protects communities"
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl -z-10"></div>
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-500/20 rounded-full blur-xl -z-10"></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Our Journey */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              From a small startup to a global leader in flood prediction technology
            </p>
          </motion.div>
          
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-blue-200 transform -translate-x-1/2"></div>
              
              <div className="relative">
                {milestones.map((milestone, index) => (
                  <motion.div 
                    key={index}
                    className={`mb-12 flex items-center ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                      <div 
                        className={`bg-white p-6 rounded-xl shadow-md border border-blue-100 ${
                          index % 2 === 0 ? 'ml-auto' : 'mr-auto'
                        }`}
                      >
                        <h3 className="text-xl font-bold text-blue-600 mb-2">{milestone.title}</h3>
                        <p className="text-gray-700">{milestone.description}</p>
                      </div>
                    </div>
                    
                    <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full border-4 border-white shadow flex items-center justify-center text-white font-bold text-xs">
                        {milestone.year.slice(2)}
                      </div>
                      <div className="mt-1 bg-blue-500 text-white text-sm py-1 px-3 rounded-full font-medium">
                        {milestone.year}
                      </div>
                    </div>
                    
                    <div className="w-1/2"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Passionate experts dedicated to building technology that saves lives
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto justify-center">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                    unoptimized // For placeholder purposes
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-xl">{member.name}</h3>
                    <p className="text-blue-200">{member.role}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-700">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              The principles that guide our work and mission
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Innovation",
                description: "We constantly push the boundaries of what's possible in flood prediction technology, seeking new solutions to protect communities.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              },
              {
                title: "Accuracy",
                description: "We're committed to delivering the most accurate flood predictions possible, as we understand lives depend on our technology.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                title: "Accessibility",
                description: "We believe in making our technology accessible to all communities, regardless of economic status or geographic location.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                )
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md border border-blue-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{value.title}</h3>
                <p className="text-gray-700">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Want to be part of our journey to protect communities from flood disasters?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/contact"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium transition-all duration-300 inline-block shadow-lg"
                >
                  Contact Us
                </Link>
              </motion.div>
              {/* <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/careers"
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-medium transition-all duration-300 inline-block"
                >
                  Careers
                </Link>
              </motion.div> */}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 