const crypto = require('crypto');

/**
 * Generate PayU hash for status verification
 * Formula: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
function generateStatusHash(salt, status, txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5, key) {
  const hashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
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
    console.log('PayU Status Environment check:', {
      hasKey: !!process.env.PAYU_KEY,
      hasSalt: !!process.env.PAYU_SALT
    });

    const { transactionId, paymentData } = JSON.parse(event.body);

    // Validate environment variables
    if (!process.env.PAYU_KEY || !process.env.PAYU_SALT) {
      console.error('Missing PayU environment variables for status check');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'PayU configuration not found for status check',
          details: 'Missing PAYU_KEY or PAYU_SALT'
        })
      };
    }

    // Validate required fields
    if (!transactionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing required field: transactionId'
        })
      };
    }

    console.log('Checking PayU payment status for transaction:', transactionId);

    // PayU doesn't have a direct status API like PhonePe
    // Status is typically handled through callback/webhook
    // For now, we'll check based on stored transaction data or callback parameters
    
    if (paymentData) {
      // If payment data is provided (from callback), verify the hash
      const { status, txnid, amount, productinfo, firstname, email, hash, udf1, udf2, udf3, udf4, udf5 } = paymentData;
      
      // Generate expected hash for verification
      const expectedHash = generateStatusHash(
        process.env.PAYU_SALT,
        status,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        udf1,
        udf2,
        udf3,
        udf4,
        udf5,
        process.env.PAYU_KEY
      );

      const verified = hash === expectedHash;

      // Enhanced debugging logs
      console.log('=== PayU Status Verification Debug ===');
      console.log('Raw payment data received:', paymentData);
      console.log('Extracted values:', {
        status,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        udf1,
        udf2,
        udf3,
        udf4,
        udf5,
        hash
      });
      console.log('Hash verification:', {
        receivedHash: hash,
        expectedHash,
        verified,
        hashMatch: hash === expectedHash
      });
      console.log('Hash generation details:', {
        salt: process.env.PAYU_SALT ? 'Present' : 'Missing',
        key: process.env.PAYU_KEY ? 'Present' : 'Missing',
        formula: `${process.env.PAYU_SALT}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${process.env.PAYU_KEY}`
      });
      console.log('Final verification result:', {
        success: true,
        status: status === 'success' ? 'success' : 'failure',
        verified,
        willPassValidation: verified && status === 'success'
      });
      console.log('=== End Debug ===');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          status: status === 'success' ? 'success' : 'failure',
          transactionId: txnid,
          amount: parseFloat(amount),
          verified,
          paymentId: txnid
        })
      };
    } else {
      // If no payment data provided, return pending status
      // In a real implementation, you might query your database here
      console.log('No payment data provided, returning pending status');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          status: 'pending',
          transactionId,
          message: 'Payment status check requires callback data'
        })
      };
    }

  } catch (error) {
    console.error('PayU status check error:', error);
    
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
