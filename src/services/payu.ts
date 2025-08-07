import crypto from 'crypto';

export interface PayUPaymentRequest {
  amount: number;
  userId: string;
  planId: string;
  userEmail: string;
  userName?: string;
}

export interface PayUPaymentResponse {
  success: boolean;
  data?: {
    paymentUrl: string;
    transactionId: string;
    planId: string;
    amount: number;
  };
  error?: string;
  message?: string;
}

export interface PayUStatusResponse {
  success: boolean;
  status: 'success' | 'failure' | 'pending';
  transactionId: string;
  amount?: number;
  paymentId?: string;
  error?: string;
}

export class PayUService {
  /**
   * Generate hash for PayU payment request
   * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
   */
  static generateHash(
    key: string,
    txnid: string,
    amount: string,
    productinfo: string,
    firstname: string,
    email: string,
    salt: string
  ): string {
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
  }

  /**
   * Initiate PayU payment by calling Netlify function
   */
  static async initiatePayment(paymentData: PayUPaymentRequest): Promise<PayUPaymentResponse> {
    try {
      const response = await fetch('/.netlify/functions/payu-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('PayU payment initiation error:', error);
      return {
        success: false,
        error: 'Failed to initiate payment',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check PayU payment status
   */
  static async checkPaymentStatus(transactionId: string): Promise<PayUStatusResponse> {
    try {
      const response = await fetch('/.netlify/functions/payu-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('PayU status check error:', error);
      return {
        success: false,
        status: 'failure',
        transactionId,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Handle PayU payment callback
   */
  static handlePaymentCallback(callbackData: any): { status: 'success' | 'failure', transactionId: string, verified: boolean } {
    try {
      const { status, txnid, amount, productinfo, firstname, email, hash, key, salt } = callbackData;
      
      // Generate expected hash for verification
      const expectedHash = this.generateHash(key, txnid, amount, productinfo, firstname, email, salt);
      
      // Verify hash to ensure payment authenticity
      const verified = hash === expectedHash;
      
      return {
        status: status === 'success' ? 'success' : 'failure',
        transactionId: txnid,
        verified
      };
    } catch (error) {
      console.error('PayU callback handling error:', error);
      return {
        status: 'failure',
        transactionId: '',
        verified: false
      };
    }
  }
}
