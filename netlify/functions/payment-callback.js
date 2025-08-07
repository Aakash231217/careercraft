const crypto = require('crypto');

/**
 * Verify PayU hash for callback
 * Formula for reverse hash: sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
function verifyPayUHash(key, txnid, amount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5, status, salt, hash) {
  const reverseHashString = `${salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const calculatedHash = crypto.createHash('sha512').update(reverseHashString).digest('hex');
  return calculatedHash === hash;
}

exports.handler = async (event, context) => {
  console.log('Payment callback received:', {
    method: event.httpMethod,
    query: event.queryStringParameters,
    body: event.body,
    headers: event.headers
  });

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'text/html'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    let paymentData = {};
    
    // Handle both POST (form data) and GET (query params) requests
    if (event.httpMethod === 'POST' && event.body) {
      // Parse form data from PayU POST callback
      const formData = new URLSearchParams(event.body);
      for (const [key, value] of formData.entries()) {
        paymentData[key] = value;
      }
    } else if (event.queryStringParameters) {
      // Handle GET request with query parameters
      paymentData = event.queryStringParameters;
    }

    console.log('Parsed payment data:', paymentData);

    // Extract payment information
    const {
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      status,
      hash,
      udf1, // planId
      udf2, // userId
      udf3, // platform
      udf4, // transactionId
      udf5, // transaction type
      mihpayid,
      payuMoneyId,
      error,
      error_Message
    } = paymentData;

    // Verify hash if we have all required fields
    let verified = false;
    if (hash && txnid && amount && productinfo && firstname && email && status) {
      const PAYU_CONFIG = {
        key: process.env.PAYU_KEY,
        salt: process.env.PAYU_SALT
      };

      verified = verifyPayUHash(
        PAYU_CONFIG.key,
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
        status,
        PAYU_CONFIG.salt,
        hash
      );
    }

    console.log('Hash verification result:', { verified, status });

    // Get base URL for redirect
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8888';
    
    // Create redirect URL with ALL payment data needed for verification
    const params = new URLSearchParams({
      status: status || 'unknown',
      txnid: txnid || '',
      amount: amount || '',
      productinfo: productinfo || '',
      firstname: firstname || '',
      email: email || '',
      hash: hash || '',
      udf1: udf1 || '', // planId
      udf2: udf2 || '', // userId
      udf3: udf3 || 'career-dev', // platform
      udf4: udf4 || '', // transaction reference
      udf5: udf5 || '', // transaction type
      mihpayid: mihpayid || '',
      payuMoneyId: payuMoneyId || '',
      error: error || '',
      error_Message: error_Message || '',
      verified: verified.toString(),
      // Pass the original values for re-verification if needed
      planId: udf1 || '',
      userId: udf2 || '',
      platform: udf3 || 'career-dev'
    });

    const redirectUrl = `${baseUrl}/payment-callback?${params.toString()}`;

    console.log('Redirecting to:', redirectUrl);

    // Return HTML that redirects to the React route
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Payment Processing</title>
    <meta http-equiv="refresh" content="0;url=${redirectUrl}">
</head>
<body>
    <p>Processing payment... Redirecting...</p>
    <script>
        window.location.href = '${redirectUrl}';
    </script>
</body>
</html>
    `;

    return {
      statusCode: 200,
      headers,
      body: html
    };

  } catch (error) {
    console.error('Payment callback error:', error);
    
    // Redirect to error page
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8888';
    const errorUrl = `${baseUrl}/payment-callback?status=error&error=${encodeURIComponent(error.message)}`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Payment Error</title>
    <meta http-equiv="refresh" content="0;url=${errorUrl}">
</head>
<body>
    <p>Payment processing error... Redirecting...</p>
    <script>
        window.location.href = '${errorUrl}';
    </script>
</body>
</html>
    `;

    return {
      statusCode: 200,
      headers,
      body: html
    };
  }
};
