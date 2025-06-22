import React, { useState, useEffect } from 'react';
import { Mail, Upload, Users, BarChart, Settings, Send, Clock, CheckCircle, AlertTriangle, FileSpreadsheet, MessageSquare } from 'lucide-react';

// UI Components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-900">
    {children}
  </h3>
);

const Button = ({ 
  children, 
  onClick, 
  className = "", 
  variant = "primary",
  disabled = false 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ 
  placeholder, 
  value, 
  onChange, 
  type = "text",
  className = "" 
}: { 
  placeholder?: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
  />
);

const Textarea = ({ 
  placeholder, 
  value, 
  onChange, 
  className = "",
  rows = 4
}: { 
  placeholder?: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
}) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={rows}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${className}`}
  />
);

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  linkedinUrl?: string;
  status: 'pending' | 'sent' | 'opened' | 'replied' | 'bounced';
  sentAt?: string;
  openedAt?: string;
  repliedAt?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  personalized: boolean;
}

interface CampaignStats {
  totalContacts: number;
  emailsSent: number;
  openRate: number;
  replyRate: number;
  bounceRate: number;
}

export const ColdEmailOutreach: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [gmailUserInfo, setGmailUserInfo] = useState<{email: string; name: string} | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate>({
    id: '',
    name: '',
    subject: '',
    body: '',
    personalized: true
  });
  const [campaignStats, setCampaignStats] = useState<CampaignStats>({
    totalContacts: 0,
    emailsSent: 0,
    openRate: 0,
    replyRate: 0,
    bounceRate: 0
  });
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    experience: '',
    skills: '',
    targetRole: '',
    resume: ''
  });

  // Initialize with sample data and check Gmail connection
  useEffect(() => {
    // Check if Gmail is already connected
    const accessToken = localStorage.getItem('gmail_access_token');
    const userEmail = localStorage.getItem('gmail_user_email');
    const userName = localStorage.getItem('gmail_user_name');
    
    if (accessToken && userEmail) {
      setIsGmailConnected(true);
      setGmailUserInfo({ email: userEmail, name: userName || '' });
    }

    // Sample email templates
    const sampleTemplates: EmailTemplate[] = [
      {
        id: '1',
        name: 'Software Engineer Outreach',
        subject: 'Experienced {role} seeking opportunities at {company}',
        body: `Hi {name},

I hope this email finds you well. I'm {yourName}, a {experience} with expertise in {skills}.

I'm reaching out because I'm genuinely interested in opportunities at {company}. Your work in {industry} particularly resonates with me, and I believe my background in {skills} would be valuable to your team.

I'd love to discuss how I can contribute to {company}'s continued success. Would you be open to a brief conversation?

Best regards,
{yourName}
{contact}`,
        personalized: true
      },
      {
        id: '2',
        name: 'General Inquiry',
        subject: 'Exploring career opportunities',
        body: `Hello {name},

I'm {yourName}, and I'm actively exploring new career opportunities. I came across {company} and was impressed by your mission and growth.

I'd appreciate any insights you might have about potential openings that align with my background in {skills}.

Thank you for your time!

Best,
{yourName}`,
        personalized: true
      }
    ];
    setEmailTemplates(sampleTemplates);
    setCurrentTemplate(sampleTemplates[0]);
  }, []);

  // Handle Gmail Connection
  const handleGmailConnect = async () => {
    try {
      // Get authorization URL from our API
      const response = await fetch('/api/gmail-auth?action=authorize');
      const { authUrl } = await response.json();
      
      // Open OAuth popup
      const popup = window.open(authUrl, 'gmail-auth', 'width=500,height=600');
      
      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Check if we have tokens in localStorage
          const accessToken = localStorage.getItem('gmail_access_token');
          if (accessToken) {
            setIsGmailConnected(true);
            console.log('Gmail connected successfully!');
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
      alert('Failed to connect Gmail. Please try again.');
    }
  };

  // Handle Gmail Disconnection
  const handleGmailDisconnect = async () => {
    try {
      // Revoke access token
      await fetch('/api/gmail-auth?action=revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: localStorage.getItem('gmail_access_token') })
      });
      
      // Remove tokens from localStorage
      localStorage.removeItem('gmail_access_token');
      localStorage.removeItem('gmail_refresh_token');
      
      setIsGmailConnected(false);
      setGmailUserInfo(null);
      console.log('Gmail disconnected successfully!');
    } catch (error) {
      console.error('Failed to disconnect Gmail:', error);
      alert('Failed to disconnect Gmail. Please try again.');
    }
  };

  // Handle CSV Upload
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const newContacts: Contact[] = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          return {
            id: `contact-${index}`,
            name: values[0] || '',
            email: values[1] || '',
            company: values[2] || '',
            position: values[3] || '',
            linkedinUrl: values[4] || '',
            status: 'pending' as const
          };
        });

      setContacts(prev => [...prev, ...newContacts]);
      setCampaignStats(prev => ({
        ...prev,
        totalContacts: prev.totalContacts + newContacts.length
      }));
    };
    reader.readAsText(file);
  };

  // Generate AI-powered email
  const generatePersonalizedEmail = async (contact: Contact) => {
    setIsGeneratingEmail(true);
    try {
      // This would use OpenAI API in a real implementation
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: currentTemplate,
          contact,
          userProfile
        })
      });
      
      const { subject, body } = await response.json();
      return { subject, body };
    } catch (error) {
      console.error('Failed to generate email:', error);
      // Fallback to template replacement
      return {
        subject: currentTemplate.subject
          .replace('{company}', contact.company)
          .replace('{role}', userProfile.targetRole),
        body: currentTemplate.body
          .replace(/{name}/g, contact.name)
          .replace(/{company}/g, contact.company)
          .replace(/{yourName}/g, userProfile.name)
          .replace(/{experience}/g, userProfile.experience)
          .replace(/{skills}/g, userProfile.skills)
      };
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  // Send email campaign
  const sendEmailCampaign = async () => {
    const pendingContacts = contacts.filter(c => c.status === 'pending');
    const accessToken = localStorage.getItem('gmail_access_token');
    
    if (!accessToken) {
      alert('Please connect your Gmail account first');
      return;
    }
    
    for (const contact of pendingContacts) {
      try {
        const { subject, body } = await generatePersonalizedEmail(contact);
        
        // Send email via Gmail API
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            to: contact.email,
            subject,
            body,
            contactId: contact.id
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || 'Failed to send email');
        }

        // Update contact status
        setContacts(prev => prev.map(c => 
          c.id === contact.id 
            ? { ...c, status: 'sent' as const, sentAt: new Date().toISOString() }
            : c
        ));

        // Add delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to send email to ${contact.email}:`, error);
        
        // Update contact status to indicate failure
        setContacts(prev => prev.map(c => 
          c.id === contact.id 
            ? { ...c, status: 'bounced' as const }
            : c
        ));
        
        // If it's an auth error, disconnect Gmail
        if (error.message?.includes('authentication') || error.message?.includes('401')) {
          localStorage.removeItem('gmail_access_token');
          localStorage.removeItem('gmail_refresh_token');
          setIsGmailConnected(false);
          alert('Gmail authentication expired. Please reconnect your account.');
          break;
        }
      }
    }

    // Update stats
    const sentCount = contacts.filter(c => c.status === 'sent').length;
    setCampaignStats(prev => ({
      ...prev,
      emailsSent: sentCount
    }));
  };

  // Dashboard View
  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Cold Email Outreach Dashboard</h2>
      
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="text-blue-600" size={24} />
              <div>
                <h3 className="font-semibold">Gmail Integration</h3>
                <p className="text-sm text-gray-600">
                  {isGmailConnected ? `Connected as ${gmailUserInfo?.email}` : 'Connect your Gmail account to start sending'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleGmailConnect}
                variant={isGmailConnected ? "secondary" : "primary"}
                disabled={isGmailConnected}
              >
                {isGmailConnected ? 'Connected' : 'Connect Gmail'}
              </Button>
              {isGmailConnected && (
                <Button 
                  variant="danger" 
                  onClick={handleGmailDisconnect}
                >
                  Disconnect
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold">{campaignStats.totalContacts}</p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold">{campaignStats.emailsSent}</p>
              </div>
              <Send className="text-green-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold">{campaignStats.openRate}%</p>
              </div>
              <CheckCircle className="text-yellow-600" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reply Rate</p>
                <p className="text-2xl font-bold">{campaignStats.replyRate}%</p>
              </div>
              <MessageSquare className="text-purple-600" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <h3 className="font-semibold mb-2">Upload Contacts</h3>
                <p className="text-sm text-gray-600">Upload CSV with HR contacts</p>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <FileSpreadsheet className="mx-auto text-blue-600 mb-2" size={32} />
              <h3 className="font-semibold mb-2">Email Templates</h3>
              <p className="text-sm text-gray-600">Manage your email templates</p>
              <Button 
                className="mt-2" 
                variant="secondary" 
                onClick={() => setActiveTab('templates')}
              >
                Manage
              </Button>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <Send className="mx-auto text-green-600 mb-2" size={32} />
              <h3 className="font-semibold mb-2">Start Campaign</h3>
              <p className="text-sm text-gray-600">Send personalized emails</p>
              <Button 
                className="mt-2" 
                onClick={sendEmailCampaign}
                disabled={!isGmailConnected || contacts.filter(c => c.status === 'pending').length === 0}
              >
                Send Emails
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Contacts View
  const renderContacts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contact List</h2>
        <Button onClick={() => document.getElementById('csv-upload')?.click()}>
          <Upload size={16} className="mr-2" />
          Upload CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map(contact => (
                  <tr key={contact.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-500">{contact.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contact.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                        contact.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        contact.status === 'opened' ? 'bg-yellow-100 text-yellow-800' :
                        contact.status === 'replied' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button 
                        variant="secondary" 
                        className="text-xs"
                        disabled={contact.status !== 'pending'}
                      >
                        Send Email
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {contacts.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold mb-2">No Contacts Yet</h3>
              <p className="text-gray-600 mb-4">
                Upload a CSV file with HR contacts to get started
              </p>
              <Button onClick={() => document.getElementById('csv-upload')?.click()}>
                Upload CSV File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Email Templates View  
  const renderTemplates = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Email Templates</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Create/Edit Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
            <Input
              placeholder="e.g., Software Engineer Outreach"
              value={currentTemplate.name}
              onChange={(e) => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
            <Input
              placeholder="Use {company}, {role}, {name} for personalization"
              value={currentTemplate.subject}
              onChange={(e) => setCurrentTemplate(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
            <Textarea
              placeholder="Use {name}, {company}, {yourName}, {skills}, {experience} for personalization"
              value={currentTemplate.body}
              onChange={(e) => setCurrentTemplate(prev => ({ ...prev, body: e.target.value }))}
              rows={10}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => {
              if (currentTemplate.name && currentTemplate.subject && currentTemplate.body) {
                const newTemplate = { ...currentTemplate, id: Date.now().toString() };
                setEmailTemplates(prev => [...prev, newTemplate]);
                setCurrentTemplate({ id: '', name: '', subject: '', body: '', personalized: true });
              }
            }}>
              Save Template
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => generatePersonalizedEmail(contacts[0])}
              disabled={isGeneratingEmail || contacts.length === 0}
            >
              {isGeneratingEmail ? 'Generating...' : 'Test with AI'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emailTemplates.map(template => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      className="text-xs"
                      onClick={() => setCurrentTemplate(template)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      className="text-xs"
                      onClick={() => setEmailTemplates(prev => prev.filter(t => t.id !== template.id))}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Settings View
  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <Input
              placeholder="Your full name"
              value={userProfile.name}
              onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
            <Input
              placeholder="e.g., 5+ years in software development"
              value={userProfile.experience}
              onChange={(e) => setUserProfile(prev => ({ ...prev, experience: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Skills</label>
            <Input
              placeholder="e.g., React, Node.js, Python, AWS"
              value={userProfile.skills}
              onChange={(e) => setUserProfile(prev => ({ ...prev, skills: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
            <Input
              placeholder="e.g., Senior Software Engineer"
              value={userProfile.targetRole}
              onChange={(e) => setUserProfile(prev => ({ ...prev, targetRole: e.target.value }))}
            />
          </div>

          <Button>Save Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Best Practices</h4>
            <ul className="space-y-1 text-sm text-yellow-700 list-disc list-inside">
              <li>Keep daily email volume under 50 to avoid spam filters</li>
              <li>Personalize each email for better response rates</li>
              <li>Follow up after 1 week if no response</li>
              <li>Always provide value in your outreach</li>
              <li>Respect recipients' time and preferences</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cold Email Outreach</h1>
          <p className="text-lg text-gray-600">
            Reach out to HR and talent acquisition teams with personalized emails
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart },
              { id: 'contacts', label: 'Contacts', icon: Users },
              { id: 'templates', label: 'Templates', icon: FileSpreadsheet },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'contacts' && renderContacts()}
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'settings' && renderSettings()}

        {/* Hidden file input */}
        <input
          id="csv-upload"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleCSVUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};
