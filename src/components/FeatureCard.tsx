import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode; // Or string for icon path
  link: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, link }) => {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 flex flex-col items-center text-center border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2"
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-primary mb-4 text-4xl">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300 mb-4">{description}</p>
      <Link
        to={link}
        className="mt-auto bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-colors duration-200 text-sm font-medium"
      >
        Explore
      </Link>
    </motion.div>
  );
};

export default FeatureCard;
