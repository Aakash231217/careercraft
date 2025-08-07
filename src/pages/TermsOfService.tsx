import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Scale, UserCheck, Ban, AlertTriangle, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TermsOfService = () => {
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
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <FileText className="h-8 w-8" />
              Terms of Service
            </CardTitle>
            <p className="text-blue-100 mt-2">Effective Date: January 4, 2025</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using the Adaptius career development platform ("Service"), you agree to be bound by these 
                Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service. We reserve 
                the right to update these Terms at any time, and your continued use of the Service constitutes acceptance 
                of any changes.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-blue-600" />
                2. Eligibility and Account Registration
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  To use our Service, you must:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Be at least 16 years of age</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Be responsible for all activities that occur under your account</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">3. Service Description</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Adaptius provides AI-powered career development tools including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Resume building and optimization</li>
                <li>Cover letter generation</li>
                <li>Mock interview preparation</li>
                <li>Skills assessment quizzes</li>
                <li>Career roadmap planning</li>
                <li>Project portfolio feedback</li>
                <li>Salary negotiation guidance</li>
                <li>Cold email outreach tools</li>
              </ul>
            </motion.section>

           

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Scale className="h-6 w-6 text-blue-600" />
                4. Acceptable Use Policy
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Share your account with others or resell access to the Service</li>
                <li>Attempt to bypass usage limits or subscription restrictions</li>
                <li>Upload malicious content or attempt to compromise our systems</li>
                <li>Scrape, copy, or redistribute our content without permission</li>
                <li>Impersonate others or provide false information</li>
                <li>Use the Service to spam, harass, or harm others</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property Rights</h2>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  <strong>Our Content:</strong> All content, features, and functionality of the Service are owned by 
                  Adaptius and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <p className="leading-relaxed">
                  <strong>Your Content:</strong> You retain ownership of content you create using our Service. By using 
                  our Service, you grant us a limited, non-exclusive license to process and display your content solely 
                  for the purpose of providing the Service to you.
                </p>
                <p className="leading-relaxed">
                  <strong>AI-Generated Content:</strong> Content generated by our AI tools is provided for your personal 
                  and professional use. You are responsible for reviewing and editing such content before use.
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
                6. Disclaimers and Limitations of Liability
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR 
                  IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p className="leading-relaxed">
                  We do not guarantee:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The accuracy or completeness of AI-generated content</li>
                  <li>Specific career outcomes or job placement</li>
                  <li>Uninterrupted or error-free service</li>
                  <li>Compatibility with all devices or systems</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  IN NO EVENT SHALL ADAPTIUS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, 
                  INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION.
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of our Service is also governed by our Privacy Policy, which describes how we collect, use, and 
                protect your personal information. By using our Service, you consent to our data practices as described 
                in the Privacy Policy.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">8. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold harmless Adaptius, its affiliates, and their respective officers, directors, 
                employees, and agents from any claims, damages, losses, or expenses (including reasonable attorneys' fees) 
                arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Ban className="h-6 w-6 text-blue-600" />
                9. Termination
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may suspend or terminate your access to the Service at any time for violation of these Terms or for any 
                other reason at our sole discretion. Upon termination, your right to use the Service will immediately cease. 
                Provisions of these Terms that by their nature should survive termination shall remain in effect.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">10. Governing Law and Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by the laws of India. Any disputes arising from these Terms or your use of 
                the Service shall be resolved through binding arbitration in Bengaluru, Karnataka, in accordance with the 
                Arbitration and Conciliation Act, 1996. You waive any right to participate in class actions.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">11. Miscellaneous</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Adaptius</li>
                <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions shall continue in effect</li>
                <li><strong>Waiver:</strong> Our failure to enforce any right or provision shall not constitute a waiver</li>
                <li><strong>Assignment:</strong> You may not assign these Terms without our prior written consent</li>
              </ul>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For questions about these Terms of Service, please contact us:
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

export default TermsOfService;
