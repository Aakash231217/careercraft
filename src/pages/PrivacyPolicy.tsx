import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, Database, Info, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

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
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto"
      >
        <Button 
          onClick={() => navigate('/')}
          variant="ghost"
          className="mb-6 hover:bg-gray-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8" />
              Privacy Policy
            </CardTitle>
            <p className="text-purple-100 mt-2">Last updated: January 4, 2025</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Info className="h-6 w-6 text-purple-600" />
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                At Adaptius, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our career 
                development platform and AI-powered tools.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-purple-600" />
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Name and contact information (email address, phone number)</li>
                    <li>Professional information (resume data, work experience, skills)</li>
                    <li>Educational background</li>
                    <li>Career goals and preferences</li>
                    <li>Account credentials</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Usage Information</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Tool usage patterns and feature interactions</li>
                    <li>Generated content (resumes, cover letters, interview responses)</li>
                    <li>Quiz performance and learning progress</li>
                    <li>IP address and device information</li>
                    <li>Browser type and operating system</li>
                  </ul>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-purple-600" />
                How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>To provide and improve our AI-powered career development tools</li>
                <li>To personalize your experience and generate relevant content</li>
                <li>To process your subscription and manage your account</li>
                <li>To communicate with you about updates, features, and promotions</li>
                <li>To analyze usage patterns and improve our services</li>
                <li>To ensure platform security and prevent fraud</li>
                <li>To comply with legal obligations</li>
              </ul>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-purple-600" />
                Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication systems</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal information on a need-to-know basis</li>
                <li>Secure data storage using Supabase infrastructure</li>
              </ul>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations or court orders</li>
                <li>To protect our rights, property, or safety</li>
                <li>With service providers who assist in operating our platform (under strict confidentiality agreements)</li>
                <li>In connection with a business transfer or acquisition</li>
              </ul>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Your Rights and Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-4">You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
              </ul>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes 
                outlined in this policy. When you delete your account, we will delete or anonymize your personal information 
                within 30 days, except where we are required to retain it for legal or legitimate business purposes.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for children under 16 years of age. We do not knowingly collect personal 
                information from children under 16. If you believe we have collected information from a child under 16, 
                please contact us immediately.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. 
                We will notify you of any material changes by posting the updated policy on our platform and updating the 
                "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6 text-purple-600" />
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> shalini@adaptius.in<br />
                  <strong>Phone:</strong> +91-7985113984<br />
                  <strong>Address:</strong> Bengaluru, Karnataka, India
                </p>
              </div>
            </motion.section>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
