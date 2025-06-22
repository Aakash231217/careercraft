
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Mail, MapPin, Phone, Twitter, Linkedin, Github } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.5, 1, 1.5],
            rotate: [360, 0],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          className="py-16 grid md:grid-cols-4 gap-8"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="col-span-1">
            <motion.div
              className="flex items-center mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <FileText className="h-10 w-10 text-white mr-3" />
              </motion.div>
              <span className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                CareerCraft
              </span>
            </motion.div>
            <motion.p
              variants={itemVariants}
              className="text-gray-300 mb-8 text-lg leading-relaxed"
            >
              Empowering professionals to build exceptional careers with AI-powered tools and insights.
            </motion.p>
            <motion.div
              variants={containerVariants}
              className="flex space-x-4"
            >
              {[
                { icon: Twitter, color: 'hover:text-blue-400' },
                { icon: Linkedin, color: 'hover:text-blue-600' },
                { icon: Github, color: 'hover:text-gray-400' }
              ].map((social, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.2, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button variant="ghost" size="sm" className={`text-gray-400 ${social.color} transition-all duration-300`}>
                    <social.icon className="h-6 w-6" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Tools */}
          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-xl mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Tools</h3>
            <ul className="space-y-4">
              {[
                'Resume Builder',
                'Resume Analyzer',
                'Career Roadmap',
                'Cover Letter Builder',
                'Job Tracker'
              ].map((tool, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 text-lg hover:underline decoration-purple-400">
                    {tool}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-xl mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Resources</h3>
            <ul className="space-y-4">
              {[
                'Career Tips',
                'Interview Prep',
                'Salary Guide',
                'Success Stories',
                'Help Center'
              ].map((resource, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 text-lg hover:underline decoration-blue-400">
                    {resource}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h3 className="font-bold text-xl mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Contact</h3>
            <div className="space-y-4">
              {[
                { icon: Mail, text: 'support@careercraft.com' },
                { icon: Phone, text: '+1 (555) 123-4567' },
                { icon: MapPin, text: 'San Francisco, CA' }
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    <contact.icon className="h-5 w-5 text-gray-400 mr-4 group-hover:text-white transition-colors" />
                  </motion.div>
                  <span className="text-gray-400 group-hover:text-white transition-colors text-lg">{contact.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <Separator className="bg-gradient-to-r from-purple-800 via-pink-800 to-blue-800" />

        {/* Bottom Footer */}
        <motion.div
          variants={containerVariants}
          className="py-8 flex flex-col md:flex-row justify-between items-center"
        >
          <motion.div
            variants={itemVariants}
            className="text-gray-400 text-lg mb-4 md:mb-0"
          >
            © 2024 CareerCraft. All rights reserved.
          </motion.div>
          <motion.div
            variants={containerVariants}
            className="flex space-x-8 text-lg"
          >
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link, index) => (
              <motion.a
                key={index}
                variants={itemVariants}
                href="#"
                className="text-gray-400 hover:text-white transition-all duration-300 hover:underline decoration-purple-400"
                whileHover={{ y: -2 }}
              >
                {link}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
