import crypto from 'crypto';

// PhonePe Configuration
const PHONEPE_CONFIG = {
  clientId: 'SU2508041156201075329584',
  clientSecret: 'eadee2a1-44c3-4a6e-ab86-d899734eb44b',
  clientVersion: '1',
  merchantId: 'ADAPTIUSONLINE',
  baseUrl: 'https://api.phonepe.com/apis/hermes',
  saltKey: 'eadee2a1-44c3-4a6e-ab86-d899734eb44b', // Using client secret as salt key
  saltIndex: '1'
};

export interface PaymentRequest {
  amount: number;
  userId: string;
  planId: string;
  userEmail: string;
  userName: string;
}

export interface PhonePePaymentResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantId: string;
    merchantTransactionId: string;
    instrumentResponse?: {
      type: string;
      redirectInfo?: {
        url: string;
        method: string;
      };
    };
  };
}

// Generate unique transaction ID
const generateTransactionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `TXN_${timestamp}_${random}`;
};

// Generate checksum for PhonePe API
const generateChecksum = (payload: string, endpoint: string): string => {
  const saltKey = PHONEPE_CONFIG.saltKey;
  const saltIndex = PHONEPE_CONFIG.saltIndex;
  const stringToHash = payload + endpoint + saltKey;
  const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
  return hash + '###' + saltIndex;
};

// Create payment request
export const initiatePayment = async (paymentRequest: PaymentRequest): Promise<PhonePePaymentResponse> => {
  try {
    const transactionId = generateTransactionId();
    const callbackUrl = `${window.location.origin}/payment-callback`;
    
    // Create payment payload
    const paymentPayload = {
      merchantId: PHONEPE_CONFIG.merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: paymentRequest.userId,
      amount: paymentRequest.amount * 100, // Convert to paise
      redirectUrl: callbackUrl,
      redirectMode: 'POST',
      callbackUrl: callbackUrl,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    // Encode payload
    const encodedPayload = btoa(JSON.stringify(paymentPayload));
    const endpoint = '/pg/v1/pay';
    const checksum = generateChecksum(encodedPayload, endpoint);

    // Make API call
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
    
    // Store transaction details in localStorage for callback handling
    localStorage.setItem('phonepe_transaction', JSON.stringify({
      transactionId,
      planId: paymentRequest.planId,
      amount: paymentRequest.amount,
      userId: paymentRequest.userId,
      timestamp: Date.now()
    }));

    return result;
  } catch (error) {
    console.error('PhonePe payment initiation error:', error);
    throw new Error('Failed to initiate payment. Please try again.');
  }
};

// Check payment status
export const checkPaymentStatus = async (transactionId: string): Promise<PhonePePaymentResponse> => {
  try {
    const endpoint = `/pg/v1/status/${PHONEPE_CONFIG.merchantId}/${transactionId}`;
    const checksum = generateChecksum('', endpoint);

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

    return await response.json();
  } catch (error) {
    console.error('PhonePe status check error:', error);
    throw new Error('Failed to check payment status.');
  }
};

// Handle payment callback
export const handlePaymentCallback = async (callbackData: any) => {
  try {
    // Get stored transaction details
    const storedTransaction = localStorage.getItem('phonepe_transaction');
    if (!storedTransaction) {
      throw new Error('Transaction details not found');
    }

    const transactionDetails = JSON.parse(storedTransaction);
    
    // Verify payment status
    const statusResponse = await checkPaymentStatus(transactionDetails.transactionId);
    
    if (statusResponse.success && statusResponse.code === 'PAYMENT_SUCCESS') {
      // Payment successful - update user subscription
      // This would typically involve calling your backend API
      console.log('Payment successful:', statusResponse);
      
      // Clear stored transaction
      localStorage.removeItem('phonepe_transaction');
      
      return {
        success: true,
        transactionId: transactionDetails.transactionId,
        planId: transactionDetails.planId,
        amount: transactionDetails.amount
      };
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    throw error;
  }
};
