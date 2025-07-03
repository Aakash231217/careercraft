import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cookie, Settings, Shield, Info, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CookiePolicy = () => {
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
          <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <Cookie className="h-8 w-8" />
              Cookie Policy
            </CardTitle>
            <p className="text-amber-100 mt-2">Last updated: January 4, 2025</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Info className="h-6 w-6 text-amber-600" />
                What Are Cookies?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide 
                you with a better experience by remembering your preferences, analyzing how you use our platform, and enabling 
                certain features to work properly. This Cookie Policy explains what cookies we use, why we use them, and how 
                you can manage your cookie preferences.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Essential Cookies
                  </h3>
                  <p className="text-gray-700 mb-2">
                    These cookies are necessary for the website to function properly and cannot be disabled. They include:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600">
                    <li>Authentication cookies that keep you logged in</li>
                    <li>Security cookies that protect against fraud</li>
                    <li>Session cookies that remember your preferences during your visit</li>
                    <li>Load balancing cookies that ensure website stability</li>
                  </ul>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    Functional Cookies
                  </h3>
                  <p className="text-gray-700 mb-2">
                    These cookies enhance your experience by remembering your choices:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600">
                    <li>Language and region preferences</li>
                    <li>Subscription tier and feature access</li>
                    <li>UI customization settings</li>
                    <li>Recently used tools and features</li>
                  </ul>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="text-lg font-semibold mb-2">Analytics Cookies</h3>
                  <p className="text-gray-700 mb-2">
                    These cookies help us understand how visitors interact with our website:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600">
                    <li>Pages visited and time spent on each page</li>
                    <li>Features and tools used most frequently</li>
                    <li>Error messages encountered</li>
                    <li>Performance metrics and load times</li>
                  </ul>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="text-lg font-semibold mb-2">Marketing Cookies</h3>
                  <p className="text-gray-700 mb-2">
                    These cookies may be set by our advertising partners to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-600">
                    <li>Show relevant advertisements on other websites</li>
                    <li>Limit the number of times you see an ad</li>
                    <li>Measure the effectiveness of advertising campaigns</li>
                    <li>Remember websites you have visited</li>
                  </ul>
                </div>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Specific Cookies We Use</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">auth_token</td>
                      <td className="border border-gray-300 px-4 py-2">User authentication</td>
                      <td className="border border-gray-300 px-4 py-2">Session</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">user_preferences</td>
                      <td className="border border-gray-300 px-4 py-2">Stores user settings</td>
                      <td className="border border-gray-300 px-4 py-2">1 year</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">subscription_tier</td>
                      <td className="border border-gray-300 px-4 py-2">Tracks user subscription</td>
                      <td className="border border-gray-300 px-4 py-2">30 days</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">_ga</td>
                      <td className="border border-gray-300 px-4 py-2">Google Analytics</td>
                      <td className="border border-gray-300 px-4 py-2">2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-amber-600" />
                Managing Your Cookie Preferences
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  You have several options for managing cookies:
                </p>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Browser Settings</h3>
                  <p className="text-sm">
                    Most web browsers allow you to control cookies through their settings. You can:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
                    <li>Block all cookies</li>
                    <li>Block only third-party cookies</li>
                    <li>Clear cookies when you close your browser</li>
                    <li>Accept cookies from specific websites only</li>
                  </ul>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Cookie Consent Tool</h3>
                  <p className="text-sm">
                    When you first visit our website, you'll see a cookie consent banner that allows you to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
                    <li>Accept all cookies</li>
                    <li>Reject non-essential cookies</li>
                    <li>Customize your cookie preferences</li>
                  </ul>
                </div>

                <p className="text-sm text-gray-600 italic">
                  Note: Disabling certain cookies may impact the functionality of our website and limit your access to some features.
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use services from third parties that may set their own cookies:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                <li><strong>Stripe:</strong> For secure payment processing (Pro and Premium subscriptions)</li>
                <li><strong>Supabase:</strong> For authentication and data storage</li>
                <li><strong>OpenAI:</strong> For AI-powered features (no cookies, but API usage)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                These third parties have their own privacy policies and cookie practices. We recommend reviewing their 
                policies to understand how they use cookies.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Do Not Track Signals</h2>
              <p className="text-gray-700 leading-relaxed">
                Some browsers offer a "Do Not Track" (DNT) option that allows you to signal websites not to track your 
                online activities. Currently, our website does not respond to DNT signals, but we respect your cookie 
                preferences as set through our cookie consent tool or your browser settings.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, 
                operational, or regulatory reasons. When we make changes, we will update the "Last updated" date at the 
                top of this policy. If the changes are significant, we may provide additional notice through our website 
                or email.
              </p>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> shalini@adaptius.in<br />
                  <strong>Phone:</strong> +91-7985113984<br />
                  <strong>Address:</strong> Bengaluru, Karnataka, India
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants} className="mt-8 p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-gray-600 flex items-start gap-2">
                <XCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Important:</strong> If you disable essential cookies, you may not be able to access certain 
                  parts of our website or use specific features. We recommend keeping essential cookies enabled for the 
                  best experience.
                </span>
              </p>
            </motion.section>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CookiePolicy;
