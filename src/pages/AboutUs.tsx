import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  github?: string;
  linkedin?: string;
  email?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Kanav Bhardwaj",
    role: "Lead Developer",
    bio: "A passionate music enthusiast and full-stack developer with expertise in React, TypeScript, and cloud technologies.",
    github: "https://github.com/Paradox-73",
    linkedin: "https://www.linkedin.com/in/kanav-bhardwaj-a25940281",
    email: "kanavbhardwaj86412a@gmail.com"
  }
];

const AboutUs = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold  text-gray-900 dark:text-white mb-6">About MusicBucket</h1>
        <p className="text-lg  text-gray-900 dark:text-white mb-6">
          MusicBucket is a labor of love, created by music enthusiasts for music enthusiasts.
          Our mission is to transform how people discover, track, and engage with music.
        </p>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-2">{member.name}</h2>
            <p className="text-gray-600 mb-4">{member.role}</p>
            <p className="text-gray-700 mb-4">{member.bio}</p>
            <div className="flex gap-4">
              {member.github && (
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Github className="w-6 h-6" />
                </a>
              )}
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Mail className="w-6 h-6" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 text-center"
      >
        <h2 className="text-2xl font-bold  text-gray-900 dark:text-white mb-6">Our Vision</h2>
        <p className=" text-gray-900 dark:text-white mb-6">
          We believe in making music discovery more engaging and personal.
          MusicBucket combines data-driven insights with intuitive design to help
          you explore new artists, track your listening journey, and deepen your
          appreciation for music.
        </p>
      </motion.div>
    </div>
  );
};

export default AboutUs; 