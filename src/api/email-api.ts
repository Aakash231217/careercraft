// Email API handlers for Gmail integration and OpenAI email generation

export interface EmailGenerationRequest {
  template: {
    subject: string;
    body: string;
  };
  contact: {
    name: string;
    email: string;
    company: string;
    position: string;
  };
  userProfile: {
    name: string;
    experience: string;
    skills: string;
    targetRole: string;
  };
}

export interface EmailSendRequest {
  to: string;
  subject: string;
  body: string;
  contactId: string;
}

// Generate personalized email using OpenAI
export const generatePersonalizedEmail = async (data: EmailGenerationRequest) => {
  try {
    const response = await fetch('/api/openai/generate-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        prompt: `Generate a personalized cold email for job outreach based on the following:

Template Subject: ${data.template.subject}
Template Body: ${data.template.body}

Contact Information:
- Name: ${data.contact.name}
- Company: ${data.contact.company}
- Position: ${data.contact.position}

Your Profile:
- Name: ${data.userProfile.name}
- Experience: ${data.userProfile.experience}
- Skills: ${data.userProfile.skills}
- Target Role: ${data.userProfile.targetRole}

Please personalize this email to be professional, engaging, and specific to the contact and company. Make it sound natural and human-written. Keep it concise but compelling.

Return the result as JSON with 'subject' and 'body' fields.`,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const result = await response.json();
    
    // Parse the AI response to extract subject and body
    try {
      const generated = JSON.parse(result.choices[0].message.content);
      return {
        subject: generated.subject || data.template.subject,
        body: generated.body || data.template.body
      };
    } catch (parseError) {
      // Fallback to template replacement if AI parsing fails
      return replaceTemplateVariables(data);
    }
  } catch (error) {
    console.error('OpenAI email generation failed:', error);
    // Fallback to template replacement
    return replaceTemplateVariables(data);
  }
};

// Fallback template variable replacement
const replaceTemplateVariables = (data: EmailGenerationRequest) => {
  const { template, contact, userProfile } = data;
  
  const subject = template.subject
    .replace(/{company}/g, contact.company)
    .replace(/{role}/g, userProfile.targetRole)
    .replace(/{name}/g, contact.name)
    .replace(/{yourName}/g, userProfile.name);

  const body = template.body
    .replace(/{name}/g, contact.name)
    .replace(/{company}/g, contact.company)
    .replace(/{position}/g, contact.position)
    .replace(/{yourName}/g, userProfile.name)
    .replace(/{experience}/g, userProfile.experience)
    .replace(/{skills}/g, userProfile.skills)
    .replace(/{targetRole}/g, userProfile.targetRole)
    .replace(/{contact}/g, userProfile.name); // Placeholder for contact info

  return { subject, body };
};

// Send email via Gmail API
export const sendEmail = async (data: EmailSendRequest) => {
  try {
    const response = await fetch('/api/gmail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getGmailAccessToken()}`
      },
      body: JSON.stringify({
        to: data.to,
        subject: data.subject,
        body: data.body,
        contactId: data.contactId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

// Gmail OAuth functions
export const initializeGmailAuth = () => {
  // Initialize Google OAuth for Gmail access
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/gmail/callback';
  
  const scope = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly';
  const authUrl = `https://accounts.google.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline`;
  
  window.open(authUrl, 'gmail-auth', 'width=500,height=600');
};

export const exchangeCodeForTokens = async (code: string) => {
  try {
    const response = await fetch('/api/gmail/exchange-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const tokens = await response.json();
    
    // Store tokens securely
    localStorage.setItem('gmail_access_token', tokens.access_token);
    localStorage.setItem('gmail_refresh_token', tokens.refresh_token);
    
    return tokens;
  } catch (error) {
    console.error('Token exchange failed:', error);
    throw error;
  }
};

export const getGmailAccessToken = (): string | null => {
  return localStorage.getItem('gmail_access_token');
};

export const refreshGmailToken = async () => {
  const refreshToken = localStorage.getItem('gmail_refresh_token');
  if (!refreshToken) throw new Error('No refresh token available');

  try {
    const response = await fetch('/api/gmail/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    const tokens = await response.json();
    localStorage.setItem('gmail_access_token', tokens.access_token);
    
    return tokens;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

// CSV parsing utility
export const parseContactsCSV = (csvContent: string) => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Expected headers: name, email, company, position, linkedin (optional)
  const expectedHeaders = ['name', 'email', 'company', 'position'];
  const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required CSV headers: ${missingHeaders.join(', ')}`);
  }

  const contacts = lines.slice(1)
    .filter(line => line.trim())
    .map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const contact: any = { id: `contact-${index}` };
      
      headers.forEach((header, idx) => {
        contact[header] = values[idx] || '';
      });

      contact.status = 'pending';
      return contact;
    })
    .filter(contact => contact.email && contact.name); // Filter out incomplete contacts

  return contacts;
};

// Email tracking utilities
export const trackEmailOpen = async (contactId: string) => {
  try {
    await fetch('/api/email/track-open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId })
    });
  } catch (error) {
    console.error('Failed to track email open:', error);
  }
};

export const trackEmailReply = async (contactId: string) => {
  try {
    await fetch('/api/email/track-reply', {
      method: 'POST',
      headers: { 'Content-Content': 'application/json' },
      body: JSON.stringify({ contactId })
    });
  } catch (error) {
    console.error('Failed to track email reply:', error);
  }
};

// Email validation
export const validateEmailAddress = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Rate limiting for email sending
export const rateLimitEmailSending = (() => {
  const sentTimes: number[] = [];
  const RATE_LIMIT = 50; // emails per hour
  const TIME_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

  return {
    canSendEmail: (): boolean => {
      const now = Date.now();
      const oneHourAgo = now - TIME_WINDOW;
      
      // Remove old entries
      while (sentTimes.length > 0 && sentTimes[0] < oneHourAgo) {
        sentTimes.shift();
      }
      
      return sentTimes.length < RATE_LIMIT;
    },
    
    recordEmailSent: (): void => {
      sentTimes.push(Date.now());
    },
    
    getEmailsRemainingThisHour: (): number => {
      const now = Date.now();
      const oneHourAgo = now - TIME_WINDOW;
      
      // Remove old entries
      while (sentTimes.length > 0 && sentTimes[0] < oneHourAgo) {
        sentTimes.shift();
      }
      
      return Math.max(0, RATE_LIMIT - sentTimes.length);
    }
  };
})();
