import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, Building, MapPin, Calendar, Star, ExternalLink, Download } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { toast } from 'react-toastify';

interface HrContact {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  location: string;
  industry: string;
  linkedin?: string;
  experience: string;
  verified: boolean;
  lastUpdated: string;
  companySize: string;
  hiringFor: string[];
}

const HrContactList: React.FC = () => {
  const { checkAndUseFeature } = useSubscription();
  const [contacts, setContacts] = useState<HrContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Sample HR contacts data - in production, this would come from an API
  const sampleContacts: HrContact[] = [
    {
      id: '1',
      name: 'Priya Sharma',
      title: 'Senior HR Manager',
      company: 'TechCorp India',
      email: 'priya.sharma@techcorp.in',
      phone: '+91 9876543210',
      location: 'Bangalore, India',
      industry: 'Information Technology',
      linkedin: 'https://linkedin.com/in/priya-sharma-hr',
      experience: '8+ years',
      verified: true,
      lastUpdated: new Date().toISOString(),
      companySize: '500-1000',
      hiringFor: ['Software Engineer', 'Product Manager', 'Data Scientist']
    },
    {
      id: '2',
      name: 'Rahul Gupta',
      title: 'Talent Acquisition Lead',
      company: 'InnovateLab Solutions',
      email: 'rahul.gupta@innovatelab.com',
      phone: '+91 9876543211',
      location: 'Mumbai, India',
      industry: 'Consulting',
      linkedin: 'https://linkedin.com/in/rahul-gupta-ta',
      experience: '6+ years',
      verified: true,
      lastUpdated: new Date().toISOString(),
      companySize: '200-500',
      hiringFor: ['Business Analyst', 'Consultant', 'Project Manager']
    },
    {
      id: '3',
      name: 'Anitha Reddy',
      title: 'HR Business Partner',
      company: 'CloudTech Systems',
      email: 'anitha.reddy@cloudtech.in',
      phone: '+91 9876543212',
      location: 'Hyderabad, India',
      industry: 'Cloud Services',
      linkedin: 'https://linkedin.com/in/anitha-reddy-hr',
      experience: '5+ years',
      verified: true,
      lastUpdated: new Date().toISOString(),
      companySize: '100-200',
      hiringFor: ['DevOps Engineer', 'Cloud Architect', 'SRE']
    },
    {
      id: '4',
      name: 'Vikram Singh',
      title: 'Recruitment Manager',
      company: 'NextGen Fintech',
      email: 'vikram.singh@nextgenfintech.com',
      phone: '+91 9876543213',
      location: 'Delhi, India',
      industry: 'Financial Technology',
      linkedin: 'https://linkedin.com/in/vikram-singh-recruitment',
      experience: '7+ years',
      verified: true,
      lastUpdated: new Date().toISOString(),
      companySize: '300-500',
      hiringFor: ['Full Stack Developer', 'Blockchain Developer', 'Risk Analyst']
    },
    {
      id: '5',
      name: 'Meera Patel',
      title: 'Head of Talent',
      company: 'EduTech Innovations',
      email: 'meera.patel@edutech.in',
      phone: '+91 9876543214',
      location: 'Pune, India',
      industry: 'Education Technology',
      linkedin: 'https://linkedin.com/in/meera-patel-talent',
      experience: '9+ years',
      verified: true,
      lastUpdated: new Date().toISOString(),
      companySize: '150-300',
      hiringFor: ['UI/UX Designer', 'Content Developer', 'QA Engineer']
    },
    {
      id: '6',
      name: 'Arjun Krishnan',
      title: 'Senior Recruiter',
      company: 'HealthCare Digital',
      email: 'arjun.krishnan@healthcare.in',
      phone: '+91 9876543215',
      location: 'Chennai, India',
      industry: 'Healthcare Technology',
      linkedin: 'https://linkedin.com/in/arjun-krishnan-recruiter',
      experience: '4+ years',
      verified: true,
      lastUpdated: new Date().toISOString(),
      companySize: '50-100',
      hiringFor: ['Mobile Developer', 'Backend Engineer', 'Data Analyst']
    },
    {
      id: '7',
      name: 'Kavya Nair',
      title: 'Talent Partner',
      company: 'GreenTech Solutions',
      email: 'kavya.nair@greentech.in',
      phone: '+91 9876543216',
      location: 'Kochi, India',
      industry: 'Renewable Energy',
      linkedin: 'https://linkedin.com/in/kavya-nair-talent',
      experience: '6+ years',
      verified: true,
      lastUpdated: new Date().toISOString(),
      companySize: '100-200',
      hiringFor: ['Mechanical Engineer', 'Electrical Engineer', 'Project Coordinator']
    },
    {
      id: '8',
      name: 'Rohan Joshi',
      title: 'HR Director',
      company: 'RetailTech Hub',
      email: 'rohan.joshi@retailtech.in',
      phone: '+91 9876543217',
      location: 'Mumbai, India',
      industry: 'Retail Technology',
      linkedin: 'https://linkedin.com/in/rohan-joshi-hr',
      experience: '10+ years',
      verified: true,
      lastUpdated: new Date().toISOString(),
      companySize: '500-1000',
      hiringFor: ['Frontend Developer', 'Marketing Manager', 'Operations Manager']
    },
    {
      id: '9',
      name: 'Sneha Agarwal',
      title: 'Recruitment Specialist',
      company: 'AI Innovations Lab',
      email: 'sneha.agarwal@ailab.in',
      phone: '+91 9876543218',
      location: 'Bangalore, India',
      industry: 'Artificial Intelligence',
      linkedin: 'https://linkedin.com/in/sneha-agarwal-recruitment',
      experience: '5+ years',
      verified: true,
      lastUpdated: new Date().toISOString(),
      companySize: '200-500',
      hiringFor: ['AI Engineer', 'Machine Learning Engineer', 'Data Scientist']
    },
    {
      id: '10',
      name: 'Kiran Kumar',
      title: 'Talent Acquisition Manager',
      company: 'LogiTech Solutions',
      email: 'kiran.kumar@logitech.in',
      phone: '+91 9876543219',
      location: 'Hyderabad, India',
      industry: 'Logistics Technology',
      linkedin: 'https://linkedin.com/in/kiran-kumar-ta',
      experience: '7+ years',
      verified: true,
      lastUpdated: new Date().toISOString(),
      companySize: '300-500',
      hiringFor: ['Supply Chain Analyst', 'Logistics Coordinator', 'Operations Engineer']
    }
  ];

  useEffect(() => {
    loadTodaysContacts();
  }, []);

  const loadTodaysContacts = async () => {
    setLoading(true);
    try {
      const allowed = await checkAndUseFeature('hrContactList');
      if (!allowed) {
        setLoading(false);
        return;
      }

      // Check if we need to refresh data (daily refresh)
      const today = new Date().toDateString();
      const storedDate = localStorage.getItem('hr-contacts-last-refresh');
      const storedContacts = localStorage.getItem('hr-contacts-today');

      if (storedDate === today && storedContacts) {
        // Use cached data
        setContacts(JSON.parse(storedContacts));
        setLastRefresh(new Date(storedDate));
      } else {
        // Generate new contacts for today
        const dailyContacts = generateDailyContacts();
        setContacts(dailyContacts);
        setLastRefresh(new Date());
        
        // Cache the data
        localStorage.setItem('hr-contacts-last-refresh', today);
        localStorage.setItem('hr-contacts-today', JSON.stringify(dailyContacts));
      }
    } catch (error) {
      console.error('Error loading HR contacts:', error);
      toast.error('Failed to load HR contacts');
    } finally {
      setLoading(false);
    }
  };

  const generateDailyContacts = () => {
    // Get user's plan to determine how many contacts to show
    const limit = 5; // This would be determined by subscription plan
    
    // Shuffle and select contacts for today
    const shuffled = [...sampleContacts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  };

  const handleContactClick = (contact: HrContact) => {
    // Track contact view
    toast.info(`Viewing ${contact.name}'s profile`);
  };

  const downloadContacts = () => {
    const contactsData = contacts.map(contact => ({
      Name: contact.name,
      Title: contact.title,
      Company: contact.company,
      Email: contact.email,
      Phone: contact.phone || 'N/A',
      Location: contact.location,
      Industry: contact.industry,
      LinkedIn: contact.linkedin || 'N/A',
      Experience: contact.experience,
      'Company Size': contact.companySize,
      'Hiring For': contact.hiringFor.join(', ')
    }));

    const csvContent = [
      Object.keys(contactsData[0]).join(','),
      ...contactsData.map(contact => Object.values(contact).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hr-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">HR Contact List</h1>
              <p className="text-gray-600">Fresh HR contacts updated daily</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {lastRefresh && (
              <div className="text-sm text-gray-500">
                <Calendar className="h-4 w-4 inline mr-1" />
                Updated: {lastRefresh.toLocaleDateString()}
              </div>
            )}
            <button
              onClick={downloadContacts}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleContactClick(contact)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{contact.name}</h3>
                    <p className="text-sm text-gray-600">{contact.title}</p>
                  </div>
                </div>
                {contact.verified && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-xs">Verified</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>{contact.company}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{contact.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="break-all">{contact.email}</span>
                </div>
                {contact.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{contact.phone}</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Currently Hiring For:</div>
                <div className="flex flex-wrap gap-1">
                  {contact.hiringFor.slice(0, 2).map((role, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {role}
                    </span>
                  ))}
                  {contact.hiringFor.length > 2 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      +{contact.hiringFor.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  <span className="font-medium">{contact.experience}</span> • {contact.companySize} employees
                </div>
                {contact.linkedin && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {contacts.length === 0 && (
          <div className="relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-80" />
            
            {/* Content */}
            <div className="relative text-center py-16 px-8">
              {/* Animated icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-8"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-full">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Main headline */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
              >
                🚀 Unlock Your Dream Job
              </motion.h2>
              
              {/* Subheadline */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed"
              >
                Get direct access to <span className="font-semibold text-blue-600">500+ verified HR contacts</span> from top companies,
                refreshed daily. Land interviews 10x faster!
              </motion.p>

              {/* Features grid */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Verified Contacts</h3>
                  <p className="text-sm text-gray-600">Real HR professionals with verified email addresses</p>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Top Companies</h3>
                  <p className="text-sm text-gray-600">Fortune 500 & fastest-growing startups</p>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Daily Updates</h3>
                  <p className="text-sm text-gray-600">Fresh contacts added every single day</p>
                </div>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-8"
              >
                <div className="flex items-center justify-center space-x-1 text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  <span className="font-semibold">2,847 job seekers</span> landed interviews using our HR contacts this month
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <span>💼 Google</span>
                  <span>🚀 Qualcomm</span>
                  <span>⚡ Cred</span>
                  <span>🎯 Microsoft</span>
                </div>
              </motion.div>

              {/* Urgency banner */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full inline-block mb-8 shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="font-semibold">⚡ Limited Time: Everyday new HR list gets refreshed</span>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <button
                  onClick={() => window.location.href = '/'}
                  className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>🚀 Upgrade Now - From Billing Section</span>
                    
                  </span>
                </button>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HrContactList;
