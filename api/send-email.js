// API endpoint for sending emails via Gmail API
import { google } from 'googleapis';

const gmail = google.gmail('v1');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, body, contactId } = req.body;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' });
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ access_token: accessToken });

    // Create email message
    const emailMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ].join('\n');

    // Encode email message
    const encodedMessage = Buffer.from(emailMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    const result = await gmail.users.messages.send({
      auth: oauth2Client,
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    // Log successful send
    console.log(`Email sent to ${to} for contact ${contactId}`);

    // You could also save to database here for tracking
    // await saveEmailToDatabase({
    //   contactId,
    //   to,
    //   subject,
    //   body,
    //   sentAt: new Date(),
    //   messageId: result.data.id
    // });

    res.status(200).json({
      success: true,
      messageId: result.data.id,
      contactId
    });

  } catch (error) {
    console.error('Send email error:', error);
    
    // Handle specific Gmail API errors
    if (error.code === 401) {
      res.status(401).json({ 
        error: 'Gmail authentication failed',
        details: 'Please reconnect your Gmail account'
      });
    } else if (error.code === 403) {
      res.status(403).json({ 
        error: 'Gmail API quota exceeded',
        details: 'Please try again later'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send email',
        details: error.message 
      });
    }
  }
}
