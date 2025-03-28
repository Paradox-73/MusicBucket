import { motion } from 'framer-motion';
import { Coffee, Heart, MessageCircle } from 'lucide-react';

const Support = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold  text-gray-900 dark:text-white mb-6">Support MusicBucket</h1>
        <p className="text-lg  text-gray-900 dark:text-white mb-6">
          Help us keep MusicBucket free and continue improving the music discovery experience.
        </p>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6 text-center"
        >
          <Coffee className="w-12 h-12 mx-auto mb-4 text-amber-600" />
          <h2 className="text-2xl font-bold mb-4">Buy us a Coffee</h2>
          <p className="text-gray-600 mb-6">
            Support our work by buying us a coffee through Ko-Fi. Every contribution helps us
            maintain and improve MusicBucket.
          </p>
          <a
            href="your-kofi-url"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Coffee className="w-5 h-5 mr-2" />
            Support on Ko-Fi
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6 text-center"
        >
          <Heart className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4">Spread the Word</h2>
          <p className="text-gray-600 mb-6">
            Share MusicBucket with your friends and fellow music enthusiasts.
            The more people using MusicBucket, the better it becomes for everyone.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://twitter.com/intent/tweet?text=Check out MusicBucket - A comprehensive music discovery and tracking platform!&url=your-app-url"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600"
            >
              Share on Twitter
            </a>
            <a
              href="https://www.facebook.com/sharer/sharer.php?u=your-app-url"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Share on Facebook
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 text-center"
      >
        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-blue-500" />
        <h2 className="text-2xl font-bold  text-gray-900 dark:text-white mb-6">Get in Touch</h2>
        <p className=" text-gray-900 dark:text-white mb-6">
          Have questions or suggestions? We'd love to hear from you!
        </p>
        <a
          href="mailto:kanavbhardwaj86412a@gmail.com"
          className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Contact Us
        </a>
      </motion.div>
    </div>
  );
};

export default Support; 