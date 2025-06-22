"use client";

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

export default function TermsOfService() {
  // Last updated date
  const lastUpdated = "September 1, 2023";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="w-full h-24 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
      
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          className="mb-12 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-700">
            Last Updated: {lastUpdated}
          </p>
        </motion.div>
        
        <motion.div
          className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="prose prose-lg max-w-none text-gray-800 prose-h2:text-blue-600 prose-h3:text-blue-500 prose-strong:text-blue-900 prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline">
            <h2 className="text-2xl font-bold mb-6 text-blue-600">1. Introduction</h2>
            <p className="mb-5">
              Welcome to Visiflow. These Terms of Service ("Terms") govern your access to and use of Visiflow's website, devices, 
              applications, and services ("Services"). By accessing or using our Services, you agree to be bound by these Terms.
            </p>
            <p className="mb-5">
              Please read these Terms carefully. If you do not agree with these Terms, you may not access or use our Services. 
              These Terms constitute a binding legal agreement between you and Visiflow Inc. ("Visiflow," "we," "us," or "our").
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">2. Use of Services</h2>
            <h3 className="text-xl font-semibold mb-4 text-blue-500">2.1 Eligibility</h3>
            <p className="mb-5">
              To use our Services, you must be at least 18 years old and have the legal capacity to enter into these Terms.
              If you are accessing or using our Services on behalf of a company, organization, or other entity, you represent that you have the authority to bind that entity to these Terms.
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-blue-500">2.2 Account Creation</h3>
            <p className="mb-5">
              Some of our Services require you to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-blue-500">2.3 Prohibited Uses</h3>
            <p className="mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-5">
              <li>Use our Services for any illegal purpose or in violation of any applicable laws;</li>
              <li>Attempt to gain unauthorized access to our Services or systems;</li>
              <li>Interfere with or disrupt the integrity or performance of our Services;</li>
              <li>Collect or harvest any information from our Services without our permission;</li>
              <li>Use our Services to transmit any viruses, malware, or other harmful code;</li>
              <li>Modify, adapt, or hack our Services or modify another website to falsely imply that it is associated with Visiflow.</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">3. Visiflow Devices</h2>
            <h3 className="text-xl font-semibold mb-4 text-blue-500">3.1 Device Purchase</h3>
            <p className="mb-5">
              When you purchase a Visiflow device, you agree to use it in accordance with all provided documentation and guidelines.
              Title to the physical device transfers to you upon shipment, but Visiflow retains ownership of all software and intellectual property embedded in or associated with the device.
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-blue-500">3.2 Device Installation and Maintenance</h3>
            <p className="mb-5">
              You are responsible for the proper installation and maintenance of your Visiflow device as outlined in the user manual.
              Improper installation or maintenance may result in inaccurate data readings and potentially ineffective flood warnings.
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-blue-500">3.3 Device Data and Analysis</h3>
            <p className="mb-5">
              Your Visiflow device collects environmental data that is transmitted to our servers for analysis.
              While we strive to provide accurate flood predictions and warnings, we cannot guarantee 100% accuracy.
              Our Services should be used as one tool among many for flood preparedness and should not replace official government warnings or common sense safety measures.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">4. Data and Privacy</h2>
            <p className="mb-5">
              Your privacy is important to us. Our <Link href="/privacy" className="text-blue-600 hover:text-blue-800 font-medium">Privacy Policy</Link> explains how we collect, use, and share information about you when you use our Services.
              By using our Services, you agree that we can use your data in accordance with our Privacy Policy.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">5. Intellectual Property</h2>
            <p className="mb-5">
              Our Services and their contents, features, and functionality are owned by Visiflow or its licensors and are protected by copyright, trademark, patent, and other intellectual property laws.
              You may not use our intellectual property without our prior written consent.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">6. Disclaimers and Limitations of Liability</h2>
            <h3 className="text-xl font-semibold mb-4 text-blue-500">6.1 Service Disclaimer</h3>
            <p className="font-medium mb-5">
              Our services are provided "as is" and "as available" without warranties of any kind, either express or implied.
              We do not warrant that our services will be uninterrupted, error-free, or completely secure.
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-blue-500">6.2 Flood Prediction Disclaimer</h3>
            <p className="font-medium mb-5">
              While we strive to provide accurate flood predictions and warnings, we cannot guarantee their accuracy or timeliness.
              You should always follow official government warnings and evacuation orders regardless of the information provided by our services.
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-blue-500">6.3 Limitation of Liability</h3>
            <p className="font-medium mb-5">
              To the maximum extent permitted by law, Visiflow shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
              or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses,
              resulting from (a) your access to or use of or inability to access or use the services; (b) any conduct or content of any third party on the services; 
              or (c) unauthorized access, use, or alteration of your transmissions or content.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">7. Indemnification</h2>
            <p className="mb-5">
              You agree to indemnify, defend, and hold harmless Visiflow and its officers, directors, employees, agents, and affiliates from and against any and all claims, 
              damages, obligations, losses, liabilities, costs or debt, and expenses arising from: (i) your use of and access to the Services; 
              (ii) your violation of any term of these Terms; or (iii) your violation of any third-party right, including without limitation any copyright, 
              property, or privacy right.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">8. Modifications to Terms</h2>
            <p className="mb-5">
              We may modify these Terms from time to time. If we make changes, we will notify you by revising the date at the top of these Terms.
              Continued use of our Services after such changes constitutes your acceptance of the revised Terms.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">9. Termination</h2>
            <p className="mb-5">
              We may terminate or suspend your access to our Services immediately, without prior notice or liability, for any reason whatsoever, 
              including, without limitation, if you breach these Terms.
              Upon termination, your right to use the Services will immediately cease.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">10. Governing Law and Jurisdiction</h2>
            <p className="mb-5">
              These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles.
              Any legal action or proceeding arising out of or relating to these Terms shall be brought exclusively in the federal or state courts located in San Francisco County, California.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">11. Contact Us</h2>
            <p className="mb-5">
              If you have any questions about these Terms, please contact us at <a href="mailto:legal@visiflow.com">admin@visiflow.com</a> or write to us at:
            </p>
            <address className="not-italic mb-5">
              Visiflow Tech.<br />
              Kamand, Mandi<br />
              Himachal Pradesh, India<br />
            </address>
          </div>
        </motion.div>
        
        <div className="max-w-4xl mx-auto text-center">
          <Link 
            href="/privacy" 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-all inline-block shadow-md"
          >
            View our Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
} 