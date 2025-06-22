# 🚀 Cold Email Outreach Setup Guide

This guide will help you set up real Gmail integration for the Cold Email Outreach system.

## ✅ What You'll Need

1. **Google Cloud Project** (free)
2. **Gmail Account** (your existing one)
3. **OpenAI API Key** (you already have this)

## 📋 Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Name your project (e.g., "Cold Email Outreach")

### 2. Enable Gmail API

1. In Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Gmail API"
3. Click on it and press **"Enable"**

### 3. Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **"Create Credentials" > "OAuth client ID"**
3. Configure OAuth consent screen if prompted:
   - Choose "External" user type
   - Fill in app name: "Cold Email Outreach"
   - Add your email as test user
4. For Application type, select **"Web application"**
5. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/gmail-callback
   ```
6. Copy the **Client ID** and **Client Secret**

### 4. Update Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:
   ```env
   # Your OpenAI API key (you already have this)
   OPENAI_API_KEY=sk-your-openai-key

   # Google OAuth credentials (from step 3)
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail-callback
   ```

### 5. Install Dependencies

```bash
npm install googleapis openai
```

## 🎯 How to Use

### 1. Connect Gmail
- Open the Cold Email Outreach tool
- Click "Connect Gmail"
- Authorize the app in the popup
- You'll see "Connected as your-email@gmail.com"

### 2. Upload Contacts
- Prepare a CSV file with columns: `name, email, company, position`
- Example:
  ```csv
  name,email,company,position
  John Smith,john@techcorp.com,TechCorp,HR Manager
  Jane Doe,jane@startupinc.com,StartupInc,Talent Acquisition
  ```
- Click "Upload Contacts" and select your CSV

### 3. Customize Email Templates
- Go to "Templates" tab
- Edit the default templates or create new ones
- Use variables like `{name}`, `{company}`, `{yourName}`, `{skills}`

### 4. Set Your Profile
- Go to "Settings" tab
- Fill in your name, experience, skills, target role
- This info will be used for AI personalization

### 5. Send Emails
- Go to "Dashboard"
- Click "Send Emails" to start the campaign
- AI will personalize each email automatically
- Emails are sent with 2-second delays to avoid spam filters

## ⚠️ Important Notes

### Rate Limits
- Maximum 50 emails per hour (Gmail's limit)
- Built-in delays between emails
- App will warn you if you hit limits

### Best Practices
- Keep emails under 200 words
- Always personalize for the recipient
- Include a clear but soft call-to-action
- Follow up after 1 week if no response
- Respect unsubscribe requests

### Security
- Your Gmail credentials are stored locally only
- OAuth tokens expire and refresh automatically
- No emails are stored on our servers

## 🛠️ Troubleshooting

### "Gmail authentication failed"
- Check your Google Cloud credentials in `.env`
- Ensure redirect URI matches exactly
- Try disconnecting and reconnecting

### "Failed to send email"
- Check if you've hit Gmail's sending limits
- Verify recipient email addresses are valid
- Ensure your Gmail account has sending permissions

### OAuth popup blocked
- Allow popups for localhost in your browser
- Try using a different browser
- Check if antivirus software is blocking popups

## 📊 Analytics & Tracking

The system tracks:
- **Emails sent**: Total number of emails sent
- **Open rates**: When recipients open your emails
- **Reply rates**: When recipients respond
- **Bounce rates**: Invalid email addresses

## 🎨 Customization

You can customize:
- Email templates with AI enhancement
- Sending delays and rate limits
- User profile information
- Contact import formats

## 🔒 Privacy & Compliance

- All data stays on your device
- Complies with email marketing best practices
- No cold email spam (target specific contacts only)
- Respects recipient preferences

---

**Ready to start?** Follow the setup steps above and you'll be sending personalized cold emails in minutes! 🚀
