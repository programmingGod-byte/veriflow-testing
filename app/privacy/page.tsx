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

export default function PrivacyPolicy() {
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
            Privacy Policy
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
              At Visiflow, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our website, mobile applications, devices, and services (collectively, the "Services").
            </p>
            <p className="mb-5">
              Please read this Privacy Policy carefully. By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
              If you do not agree with our policies and practices, please do not use our Services.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-4 text-blue-500">2.1 Personal Information</h3>
            <p className="mb-4">
              We collect several types of personal information from and about users of our Services, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-5">
              <li><strong>Contact Information:</strong> Such as your name, email address, postal address, and phone number.</li>
              <li><strong>Account Information:</strong> Such as your username, password, and account preferences.</li>
              <li><strong>Payment Information:</strong> Such as credit card details or other financial information needed to purchase our products or services.</li>
              <li><strong>Location Data:</strong> Such as the precise location of your Visiflow device and general location information when you use our mobile applications.</li>
              <li><strong>Device and Usage Information:</strong> Such as your device's IP address, browser type, operating system, and information about how you interact with our Services.</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-4 text-blue-500">2.2 Environmental and Sensor Data</h3>
            <p className="mb-4">
              Our Visiflow devices collect environmental data that is necessary for flood prediction and monitoring, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-5">
              <li>Water level measurements</li>
              <li>Water flow velocity</li>
              <li>Rainfall amounts</li>
              <li>Soil moisture levels</li>
              <li>Temperature and atmospheric pressure</li>
            </ul>
            <p className="mb-5">
              This environmental data is generally not considered personal information but may be associated with your device and account.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">3. How We Collect Information</h2>
            <p className="mb-4">
              We collect information directly from you when you:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-5">
              <li>Register for an account or purchase our products</li>
              <li>Use our website or mobile applications</li>
              <li>Contact our customer service</li>
              <li>Complete surveys or provide feedback</li>
              <li>Subscribe to newsletters or marketing communications</li>
            </ul>
            <p className="mb-4">
              We also collect information automatically when you:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-5">
              <li>Install and use a Visiflow device</li>
              <li>Visit our website or use our mobile applications</li>
              <li>Interact with our emails or online advertisements</li>
            </ul>
            <p className="mb-5">
              Additionally, we may receive information about you from third-party sources, such as public databases, social media platforms, or our business partners.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">4. How We Use Your Information</h2>
            <p className="mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-5">
              <li>Provide, operate, and maintain our Services</li>
              <li>Process and fulfill your orders, subscriptions, and registrations</li>
              <li>Generate accurate flood predictions and alerts</li>
              <li>Improve and personalize your experience with our Services</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you about updates, security alerts, support, and administrative messages</li>
              <li>Provide customer service and respond to inquiries</li>
              <li>Send marketing communications (with your consent where required by law)</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our Services</li>
              <li>Detect, prevent, and address technical issues, security breaches, and fraudulent activities</li>
              <li>Comply with legal obligations and enforce our terms and policies</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">5. How We Share Your Information</h2>
            <p className="mb-5">
              We may share your information with:
            </p>
            <h3 className="text-xl font-semibold mb-4 text-blue-500">5.1 Service Providers</h3>
            <p className="mb-5">
              We share information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, 
              email delivery, hosting, customer service, and marketing assistance.
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-blue-500">5.2 Business Partners</h3>
            <p className="mb-5">
              We may share information with business partners to provide you with certain products, services, or promotions.
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-blue-500">5.3 Emergency Services and Government Authorities</h3>
            <p className="mb-5">
              In the event of a potential flood emergency, we may share relevant device location and environmental data with local emergency services 
              or government authorities to facilitate disaster response and public safety efforts.
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-blue-500">5.4 Legal Requirements</h3>
            <p className="mb-5">
              We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-blue-500">5.5 Business Transfers</h3>
            <p className="mb-5">
              If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-blue-500">5.6 Aggregated or De-identified Data</h3>
            <p className="mb-5">
              We may share aggregated or de-identified information, which cannot reasonably be used to identify you, with third parties for research, 
              analysis, and other purposes.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">6. Data Security</h2>
            <p className="mb-5">
              We implement appropriate technical and organizational measures to protect the security of your personal information. 
              However, please note that no method of transmission over the Internet or electronic storage is 100% secure.
              While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">7. Your Privacy Rights</h2>
            <p className="mb-4">
              Depending on your location, you may have certain rights regarding your personal information, which may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-5">
              <li>The right to access and receive a copy of your personal information</li>
              <li>The right to rectify or update your personal information</li>
              <li>The right to delete your personal information</li>
              <li>The right to restrict or object to our processing of your personal information</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent (where processing is based on consent)</li>
              <li>The right to lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="mb-5">
              To exercise these rights, please contact us at <a href="mailto:admin@visiflow.com" className="text-blue-600 hover:text-blue-700">admin@visiflow.com</a>.
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-blue-500">7.1 India Privacy Rights</h3>
            <p className="mb-5">
              If you are a Indian resident, you have specific rights under the Indian Consumer Privacy Act and the Indian Privacy Rights Act. 
              For more information about your Indian privacy rights, please visit our <Link href="" className="text-blue-600 hover:text-blue-700">Indian Privacy Notice</Link>.
            </p>
            
            <h3 className="text-xl font-semibold mb-4 text-blue-500">7.2 European Economic Area (EEA), United Kingdom, and Switzerland</h3>
            <p className="mb-5">
              If you are located in the EEA, United Kingdom, or Switzerland, we process your personal information in accordance with the General Data Protection Regulation (GDPR) 
              or applicable data protection laws. For more information, please visit our <Link href="/gdpr-privacy" className="text-blue-600 hover:text-blue-700">GDPR Privacy Notice</Link>.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">8. Children's Privacy</h2>
            <p className="mb-5">
              Our Services are not intended for children under the age of 13, and we do not knowingly collect personal information from children under 13. 
              If we learn that we have collected personal information from a child under 13, we will promptly take steps to delete that information.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">9. International Data Transfers</h2>
            <p className="mb-5">
              Your information may be transferred to, and maintained on, computers located outside of your state, province, country, or other governmental jurisdiction 
              where the data protection laws may differ from those in your jurisdiction.
            </p>
            <p className="mb-5">
              If you are located outside the United States and choose to provide information to us, please note that we transfer the data to the United States and process it there. 
              By providing your information, you consent to this transfer.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">10. Cookies and Tracking Technologies</h2>
            <p className="mb-5">
              We use cookies and similar tracking technologies to track activity on our Services and to hold certain information. 
              For more information about the cookies we use and your choices regarding cookies, please see our <Link href="/cookie-policy" className="text-blue-600 hover:text-blue-700">Cookie Policy</Link>.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">11. Third-Party Links and Services</h2>
            <p className="mb-5">
              Our Services may contain links to third-party websites or services that are not owned or controlled by Visiflow. 
              We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. 
              We strongly advise you to review the privacy policy of every site you visit.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">12. Changes to This Privacy Policy</h2>
            <p className="mb-5">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top. 
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-6 text-blue-600">13. Contact Us</h2>
            <p className="mb-5">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <address className="not-italic mb-5">
              Visiflow Tech.<br />
              Privacy Department<br />
              Kamand, Mandi<br />
              Himachal Pradesh, India<br />
              <a href="mailto:admin@visiflow.com" className="text-blue-600 hover:text-blue-700">admin@visiflow.com</a>
            </address>
          </div>
        </motion.div>
        
        <div className="max-w-4xl mx-auto text-center">
          <Link 
            href="/terms" 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-all inline-block shadow-md"
          >
            View our Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}