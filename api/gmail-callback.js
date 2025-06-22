// OAuth callback handler for Gmail authentication
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, error } = req.query;

    if (error) {
      return res.status(400).send(`
        <script>
          alert('Gmail authentication failed: ${error}');
          window.close();
        </script>
      `);
    }

    if (!code) {
      return res.status(400).send(`
        <script>
          alert('No authorization code received');
          window.close();
        </script>
      `);
    }

    // Exchange code for tokens
    const response = await fetch(`${req.headers.host}/api/gmail-auth?action=exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const tokens = await response.json();

    if (!response.ok) {
      throw new Error(tokens.error || 'Token exchange failed');
    }

    // Return success page that stores tokens and closes popup
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Gmail Connected Successfully</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
          }
          .success-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          h1 {
            margin-bottom: 1rem;
          }
          p {
            margin-bottom: 2rem;
            opacity: 0.9;
          }
          .auto-close {
            opacity: 0.7;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Gmail Connected Successfully!</h1>
          <p>Your Gmail account has been connected and you can now send cold emails.</p>
          <p class="auto-close">This window will close automatically...</p>
        </div>
        <script>
          // Store tokens in parent window's localStorage
          if (window.opener) {
            window.opener.localStorage.setItem('gmail_access_token', '${tokens.access_token}');
            window.opener.localStorage.setItem('gmail_refresh_token', '${tokens.refresh_token}');
            window.opener.localStorage.setItem('gmail_user_email', '${tokens.user?.email || ''}');
            window.opener.localStorage.setItem('gmail_user_name', '${tokens.user?.name || ''}');
          }
          
          // Close popup after 2 seconds
          setTimeout(() => {
            window.close();
          }, 2000);
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Gmail callback error:', error);
    res.status(500).send(`
      <script>
        alert('Gmail authentication failed: ${error.message}');
        window.close();
      </script>
    `);
  }
}
