import { motion } from 'framer-motion';
import { Shield, FileText, Lock } from 'lucide-react';

const Legal = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold  text-gray-900 dark:text-white mb-6">Legal Information</h1>
        <p className="text-lg  text-gray-900 dark:text-white mb-6">
          Important information about your privacy and usage of MusicBucket.
        </p>
      </motion.div>

      <div className="space-y-12">
        {/* Privacy Policy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-blue-500 mr-3" />
            <h2 className="text-2xl font-bold">Privacy Policy</h2>
          </div>
          
          <div className="space-y-4 text-gray-600">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h3 className="text-xl font-semibold text-gray-800">1. Information We Collect</h3>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6">
              <li>Account information (email, username)</li>
              <li>Spotify account data (with your permission)</li>
              <li>Your music preferences and listening history</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800">2. How We Use Your Information</h3>
            <p>
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6">
              <li>Provide and improve our services</li>
              <li>Personalize your music discovery experience</li>
              <li>Communicate with you about updates and features</li>
              <li>Analyze usage patterns to improve our platform</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800">3. Data Security</h3>
            <p>
              We implement appropriate security measures to protect your personal information.
              Your data is stored securely using Supabase, and we use industry-standard
              encryption for data transmission.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">4. Third-Party Services</h3>
            <p>
              We integrate with Spotify and other third-party services. Their privacy
              policies govern how they handle your data.
            </p>
          </div>
        </motion.section>

        {/* Terms & Conditions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-green-500 mr-3" />
            <h2 className="text-2xl font-bold">Terms & Conditions</h2>
          </div>
          
          <div className="space-y-4 text-gray-600">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h3 className="text-xl font-semibold text-gray-800">1. Acceptance of Terms</h3>
            <p>
              By accessing and using MusicBucket, you agree to be bound by these Terms
              and Conditions. If you disagree with any part, please do not use our service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">2. User Responsibilities</h3>
            <p>
              As a user of MusicBucket, you agree to:
            </p>
            <ul className="list-disc pl-6">
              <li>Provide accurate account information</li>
              <li>Maintain the security of your account</li>
              <li>Use the service in compliance with applicable laws</li>
              <li>Not engage in any harmful or disruptive activities</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800">3. Intellectual Property</h3>
            <p>
              MusicBucket and its original content, features, and functionality are owned
              by us and are protected by international copyright, trademark, and other
              intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-800">4. Service Modifications</h3>
            <p>
              We reserve the right to modify or discontinue any part of our service
              without notice. We shall not be liable for any modification, suspension,
              or discontinuance of the service.
            </p>
          </div>
        </motion.section>

        {/* Contact Information */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center mb-6">
            <Lock className="w-8 h-8 text-purple-500 mr-3" />
            <h2 className="text-2xl font-bold">Contact Us</h2>
          </div>
          
          <div className="text-gray-600">
            <p>
              If you have any questions about our Privacy Policy or Terms & Conditions,
              please contact us at:
            </p>
            <a
              href="mailto:kanavbhardwaj86412a@gmail.com"
              className="text-blue-500 hover:text-blue-600 mt-2 inline-block"
            >
              Mail
            </a>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Legal; 