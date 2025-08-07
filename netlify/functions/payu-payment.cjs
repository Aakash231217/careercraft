const crypto = require('crypto');

/**
 * Generate PayU hash for payment request
 * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
 */
function generatePayUHash(key, txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5, salt) {
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
}

/**
 * Generate unique transaction ID
 */
function generateTransactionId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `CAREER_${timestamp}_${random}`;
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

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
    console.log('PayU Environment check:', {
      hasKey: !!process.env.PAYU_KEY,
      hasSalt: !!process.env.PAYU_SALT,
      hasMode: !!process.env.PAYU_MODE,
      hasBaseUrl: !!process.env.PAYU_BASE_URL
    });

    const { amount, userId, planId, userEmail, userName } = JSON.parse(event.body);

    // Validate environment variables first
    if (!process.env.PAYU_KEY || !process.env.PAYU_SALT || !process.env.PAYU_BASE_URL) {
      console.error('Missing PayU environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'PayU configuration not found. Please check environment variables.',
          details: 'Missing PAYU_KEY, PAYU_SALT, or PAYU_BASE_URL'
        })
      };
    }

    // Validate required fields
    if (!amount || !userId || !planId || !userEmail) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: amount, userId, planId, userEmail'
        })
      };
    }

    // PayU configuration
    const PAYU_CONFIG = {
      key: process.env.PAYU_KEY,
      salt: process.env.PAYU_SALT,
      mode: process.env.PAYU_MODE || 'live',
      baseUrl: process.env.PAYU_BASE_URL
    };

    // Generate transaction ID
    const transactionId = generateTransactionId();
    
    // Get base URL and ensure it's for career-dev platform
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Payment details with platform-specific configuration
    const paymentData = {
      key: PAYU_CONFIG.key,
      txnid: transactionId,
      amount: amount.toString(), // PayU expects amount as string
      productinfo: `CareerDev-${planId}`, // Platform prefix to differentiate
      firstname: userName || 'User',
      email: userEmail,
      phone: '', // Optional
      surl: `${baseUrl}/.netlify/functions/payment-callback?status=success&platform=career-dev&txnid=${transactionId}`,
      furl: `${baseUrl}/.netlify/functions/payment-callback?status=failure&platform=career-dev&txnid=${transactionId}`,
      service_provider: 'payu_paisa',
      udf1: planId, // Store plan ID for callback
      udf2: userId, // Store user ID for callback
      udf3: 'career-dev', // Platform identifier
      udf4: transactionId, // Transaction reference
      udf5: 'subscription' // Transaction type
    };

    // Generate hash for payment security
    const hash = generatePayUHash(
      paymentData.key,
      paymentData.txnid,
      paymentData.amount,
      paymentData.productinfo,
      paymentData.firstname,
      paymentData.email,
      paymentData.udf1,
      paymentData.udf2,
      paymentData.udf3,
      paymentData.udf4,
      paymentData.udf5,
      PAYU_CONFIG.salt
    );

    paymentData.hash = hash;

    console.log('PayU Payment Request:', {
      transactionId,
      amount: paymentData.amount,
      planId,
      userId,
      email: userEmail
    });

    // For PayU, we create a form POST request URL
    // PayU uses form submission, not direct API calls like PhonePe
    const formData = Object.entries(paymentData)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    const paymentUrl = `${PAYU_CONFIG.baseUrl}?${formData}`;

    console.log('PayU Payment URL generated successfully');

    // Return response to frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          paymentUrl,
          transactionId,
          planId,
          amount,
          formData: paymentData // Include form data for frontend form submission
        },
        message: 'PayU payment initiated successfully'
      })
    };

  } catch (error) {
    console.error('PayU payment error:', error);
    
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
