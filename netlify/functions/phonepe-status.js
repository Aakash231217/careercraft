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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get transaction ID from query parameters
    const { transactionId } = event.queryStringParameters || {};

    if (!transactionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Transaction ID is required' 
        })
      };
    }

    const endpoint = `/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${transactionId}`;
    const checksum = generateChecksum('', endpoint);

    console.log('Checking PhonePe payment status for transaction:', transactionId);

    // Make API call to PhonePe to check status
    const response = await fetch(`${PHONEPE_CONFIG.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-CLIENT-ID': PHONEPE_CONFIG.clientId,
        'X-CLIENT-SECRET': PHONEPE_CONFIG.clientSecret,
        'X-CLIENT-VERSION': PHONEPE_CONFIG.clientVersion
      }
    });

    const result = await response.json();
    
    console.log('PhonePe Status Response:', {
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
        data: result.data,
        transactionId
      })
    };

  } catch (error) {
    console.error('PhonePe status check error:', error);
    
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
