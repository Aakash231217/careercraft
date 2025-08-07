const crypto = require('crypto');

// PhonePe Configuration from environment variables
const PHONEPE_CONFIG = {
  clientId: process.env.PHONEPE_CLIENT_ID || 'SU2508041156201075329584',
  clientSecret: process.env.PHONEPE_CLIENT_SECRET || 'eadee2a1-44c3-4a6e-ab86-d899734eb44b',
  clientVersion: process.env.PHONEPE_CLIENT_VERSION || '1',
  merchantId: process.env.PHONEPE_MERCHANT_ID || 'ADAPTIUSONLINE',
  baseUrl: process.env.PHONEPE_LIVE_URL || 'https://api.phonepe.com/apis/hermes',
  saltKey: process.env.PHONEPE_CLIENT_SECRET || 'eadee2a1-44c3-4a6e-ab86-d899734eb44b',
  saltIndex: '1'
};

// Generate unique transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `CAREER_${timestamp}_${random}`;
};

// Generate checksum for PhonePe API
const generateChecksum = (payload, endpoint) => {
  const saltKey = PHONEPE_CONFIG.saltKey;
  const saltIndex = PHONEPE_CONFIG.saltIndex;
  const stringToHash = payload + endpoint + saltKey;
  const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
  return hash + '###' + saltIndex;
};

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Log environment check
    console.log('Environment check:', {
      hasClientId: !!process.env.PHONEPE_CLIENT_ID,
      hasClientSecret: !!process.env.PHONEPE_CLIENT_SECRET,
      hasMerchantId: !!process.env.PHONEPE_MERCHANT_ID,
      hasLiveUrl: !!process.env.PHONEPE_LIVE_URL
    });
    const { amount, userId, planId, userEmail, userName } = JSON.parse(event.body);

    // Validate environment variables first
    if (!process.env.PHONEPE_CLIENT_ID || !process.env.PHONEPE_CLIENT_SECRET || !process.env.PHONEPE_MERCHANT_ID) {
      console.error('Missing PhonePe environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'PhonePe configuration not found. Please check environment variables.',
          details: 'Missing PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, or PHONEPE_MERCHANT_ID'
        })
      };
    }

    // Validate required fields
    if (!amount || !userId || !planId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: amount, userId, planId'
        })
      };
    }

    // Validate amount (should be positive number)
    if (amount <= 0 || isNaN(amount)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Invalid amount' 
        })
      };
    }

    const transactionId = generateTransactionId();
    const callbackUrl = `${event.headers.origin || 'https://career-dev-platform.netlify.app'}/payment-callback`;
    
    // Create payment payload
    const paymentPayload = {
      merchantId: PHONEPE_CONFIG.merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: userId,
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      redirectUrl: callbackUrl,
      redirectMode: 'POST',
      callbackUrl: callbackUrl,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    // Encode payload to base64
    const encodedPayload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
    const endpoint = '/pg/v1/pay';
    const checksum = generateChecksum(encodedPayload, endpoint);

    console.log('PhonePe Payment Request:', {
      transactionId,
      amount: paymentPayload.amount,
      merchantId: PHONEPE_CONFIG.merchantId,
      userId
    });

    // Make API call to PhonePe
    const response = await fetch(`${PHONEPE_CONFIG.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-CLIENT-ID': PHONEPE_CONFIG.clientId,
        'X-CLIENT-SECRET': PHONEPE_CONFIG.clientSecret,
        'X-CLIENT-VERSION': PHONEPE_CONFIG.clientVersion
      },
      body: JSON.stringify({
        request: encodedPayload
      })
    });

    const result = await response.json();
    
    console.log('PhonePe API Response:', {
      success: result.success,
      code: result.code,
      message: result.message,
      transactionId
    });

    // Return response to frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: result.success,
        code: result.code,
        message: result.message,
        data: {
          ...result.data,
          transactionId,
          planId,
          amount
        }
      })
    };

  } catch (error) {
    console.error('PhonePe payment error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
