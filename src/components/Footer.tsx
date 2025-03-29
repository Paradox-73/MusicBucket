import React from 'react';
import { Link } from 'react-router-dom';
import { Music2, Github, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const footerLinks = {
    product: [
      { name: 'Artist Exploration', path: '/artist-exploration' },
      { name: 'Bucket List', path: '/bucket-list' },
      { name: 'Culture Clash', path: '/culture-clash' },
      { name: 'Exploration Score', path: '/exploration-score' },
      { name: 'Rabbit Hole', path: '/rabbit-hole' },
      { name: 'Recommendation Roulette', path: '/recommendation-roulette' },
      { name: 'Roadtrip Mixtape', path: '/roadtrip-mixtape' },
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Support', path: '/support' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms & Conditions', path: '/privacy' },
    ],
    social: [
      { name: 'Project GitHub', icon: <Github className="w-5 h-5" />, url: 'https://github.com/Paradox-73/MusicBucket' },
      { name: 'Developer 1 LinkedIn', icon: <Linkedin className="w-5 h-5" />, url: 'https://www.linkedin.com/in/kanav-bhardwaj-a25940281/' },
      { name: 'Developer 2 LinkedIn', icon: <Linkedin className="w-5 h-5" />, url: 'https://www.linkedin.com/in/nikunj-mahajan-9b43542b6/' },
      { name: 'Developer 1 Instagram', icon: <Instagram className="w-5 h-5" />, url: 'https://www.instagram.com/kanavbhardwaj_73/' },
      { name: 'Developer 2 Instagram', icon: <Instagram className="w-5 h-5" />, url: 'https://www.instagram.com/nikunjmahajan23/' },
    ],
    share: [
      { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, url: 'https://twitter.com/intent/tweet?text=Check out MusicBucket - A comprehensive music discovery and tracking platform!&url=your-app-url' }
    ],
    contact: [
      { name: 'Contact Us', icon: <Mail className="w-5 h-5" />, url: 'mailto:kanavbhardwaj86412a@gmail.com' },
    ],
  };

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-primary/10 dark:border-secondary/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <Music2 className="w-8 h-8 text-primary dark:text-secondary" />
              <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-primary to-secondary dark:from-secondary dark:to-primary text-transparent bg-clip-text">
                MusicBucket
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400">
              Discover, track, and explore music like never before.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact Links */}
          <div className="space-y-6">
            {/* Connect */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connect</h3>
              <div className="flex flex-wrap gap-4">
                {footerLinks.social.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors duration-200"
                    title={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Share */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spread the Word</h3>
              <div className="flex gap-4">
                {footerLinks.share.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors duration-200"
                    title={`Share on ${link.name}`}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h3>
              <div className="flex gap-4">
                {footerLinks.contact.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary transition-colors duration-200"
                    title={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-primary/10 dark:border-secondary/10 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} MusicBucket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;