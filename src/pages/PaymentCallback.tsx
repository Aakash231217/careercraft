import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionService } from '../services/subscriptionService';
import { SubscriptionTier } from '../types/subscription';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentCallbackProps {}

const PaymentCallback: React.FC<PaymentCallbackProps> = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);

  useEffect(() => {
    handlePaymentCallback();
  }, []);

  const handlePaymentCallback = async () => {
    try {
      // Get URL parameters from PayU callback
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('status'); // 'success' or 'failure'
      const platform = urlParams.get('platform'); // Platform identifier
      
      // Verify this is a career-dev platform transaction
      if (platform !== 'career-dev') {
        setStatus('failed');
        toast({
          title: "Invalid Transaction",
          description: "This transaction is not for the Career Dev platform.",
          variant: "destructive",
        });
        return;
      }

      // Wait a moment for authentication to stabilize after redirect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get PayU response data from URL or form POST
      const payuData = {
        status: urlParams.get('status'), // PayU returns 'success' or 'failure'
        txnid: urlParams.get('txnid'),
        amount: urlParams.get('amount'),
        productinfo: urlParams.get('productinfo'),
        firstname: urlParams.get('firstname'),
        email: urlParams.get('email'),
        hash: urlParams.get('hash'),
        udf1: urlParams.get('udf1'), // planId
        udf2: urlParams.get('udf2'), // userId
        udf3: urlParams.get('udf3'), // platform (career-dev)
        udf4: urlParams.get('udf4'), // transaction reference
        udf5: urlParams.get('udf5'), // transaction type
        mihpayid: urlParams.get('mihpayid'), // PayU payment ID (only present on success)
        payuMoneyId: urlParams.get('payuMoneyId'), // PayU payment ID alternative
        error: urlParams.get('error'),
        error_Message: urlParams.get('error_Message'),
        verified: urlParams.get('verified') === 'true' // Hash verification from Netlify function
      };

      // Get transaction data from localStorage
      const transactionData = localStorage.getItem('pendingTransaction');
      if (!transactionData) {
        setStatus('failed');
        toast({
          title: "Transaction Error",
          description: "No pending transaction found. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const transaction = JSON.parse(transactionData);
      setTransactionDetails(transaction);

      // Check if we have PayU response data
      if (payuData.txnid) {
        // Add detailed logging for debugging
        console.log('PayU callback data received:', payuData);
        console.log('Payment status from PayU:', payuData.status);
        console.log('Transaction ID:', payuData.txnid);
        
        // Verify payment with PayU status function
        const statusResponse = await fetch('/.netlify/functions/payu-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            transactionId: payuData.txnid,
            paymentData: payuData 
          }),
        });

        const statusResult = await statusResponse.json();
        console.log('PayU status verification response:', statusResult);
        console.log('Verification details:', {
          statusResultSuccess: statusResult.success,
          statusResultStatus: statusResult.status,
          payuDataStatus: payuData.status,
          statusResultVerified: statusResult.verified,
          overallSuccess: statusResult.success && (statusResult.status === 'success' || payuData.status === 'success') && statusResult.verified
        });

        // Enhanced debugging for PayU verification failure
        console.log('=== PayU Payment Callback Debug ===');
        console.log('Individual condition checks:');
        console.log('1. statusResult.success:', statusResult.success);
        console.log('2. statusResult.status === "success":', statusResult.status === 'success');
        console.log('3. payuData.status === "success":', payuData.status === 'success');
        console.log('4. Either status success:', (statusResult.status === 'success' || payuData.status === 'success'));
        console.log('5. statusResult.verified:', statusResult.verified);
        console.log('Final result will be:', statusResult.success && (statusResult.status === 'success' || payuData.status === 'success') && statusResult.verified);
        
        if (!statusResult.verified) {
          console.error('❌ HASH VERIFICATION FAILED - This is likely why payment shows as failed');
          console.error('Check PayU environment variables (PAYU_KEY, PAYU_SALT) and hash calculation');
        }
        if (!statusResult.success) {
          console.error('❌ STATUS RESULT NOT SUCCESS - Check PayU status function');
        }
        if (!(statusResult.status === 'success' || payuData.status === 'success')) {
          console.error('❌ NEITHER STATUS SHOWS SUCCESS - Payment may have actually failed');
        }
        console.log('=== End PayU Debug ===');

        if (statusResult.success && (statusResult.status === 'success' || payuData.status === 'success') && statusResult.verified) {
          // Payment successful and verified - update user subscription
          try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (user && payuData.udf1) {
              // Validate that udf1 is a valid subscription tier
              const validTiers: SubscriptionTier[] = ['free', 'starter', 'pro', 'premium'];
              const newTier = payuData.udf1 as SubscriptionTier;
              
              if (validTiers.includes(newTier)) {
                // Update user subscription on successful payment
                await SubscriptionService.upgradePlan(user.id, newTier);
              } else {
                console.error('Invalid subscription tier:', payuData.udf1);
                toast({
                  title: "Payment Error",
                  description: "Invalid subscription plan. Please contact support.",
                  variant: "destructive",
                });
                return;
              }
            } else if (error || !user) {
              // User not authenticated - store success info and redirect to login
              localStorage.setItem('paymentSuccess', JSON.stringify({
                transactionId: payuData.txnid,
                planId: payuData.udf1,
                amount: payuData.amount,
                timestamp: Date.now()
              }));
              
              // Redirect to home page which will handle login
              window.location.href = '/?payment=success&login=required';
              return;
            }
          } catch (authError) {
            console.error('Authentication error in callback:', authError);
            // Store payment success and redirect
            localStorage.setItem('paymentSuccess', JSON.stringify({
              transactionId: payuData.txnid,
              planId: payuData.udf1,
              amount: payuData.amount,
              timestamp: Date.now()
            }));
            window.location.href = '/?payment=success&login=required';
            return;
          }

          setStatus('success');
          toast({
            title: "Payment Successful! ",
            description: `You have successfully upgraded to the ${payuData.udf1 || transaction.planId} plan.`,
            variant: "default",
          });

          // Clear pending transaction
          localStorage.removeItem('pendingTransaction');
        } else {
          setStatus('failed');
          toast({
            title: "Payment Failed",
            description: payuData.error_Message || statusResult.message || "Your payment could not be processed. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // No PayU callback data found, check URL status parameter
        if (paymentStatus === 'success' || urlParams.get('status') === 'success') {
          setStatus('success');
          toast({
            title: "Payment Successful! ",
            description: `You have successfully upgraded to the ${transaction.planId} plan.`,
            variant: "default",
          });
          localStorage.removeItem('pendingTransaction');
        } else {
          setStatus('failed');
          toast({
            title: "Payment Failed",
            description: "Your payment could not be processed. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Payment callback error:', error);
      setStatus('failed');
      toast({
        title: "Error",
        description: "An error occurred while processing your payment. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const retryPayment = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-600" />}
            {status === 'failed' && <XCircle className="h-6 w-6 text-red-600" />}
            
            {status === 'loading' && 'Processing Payment...'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
          </CardTitle>
          
          <CardDescription>
            {status === 'loading' && 'Please wait while we verify your payment with PayU.'}
            {status === 'success' && 'Your subscription has been successfully upgraded.'}
            {status === 'failed' && 'There was an issue processing your payment.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          {transactionDetails && (
            <div className="bg-gray-100 p-4 rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2 text-left">
                <span className="font-medium">Plan:</span>
                <span className="capitalize">{transactionDetails.planId}</span>
                <span className="font-medium">Amount:</span>
                <span>₹{transactionDetails.amount}</span>
                <span className="font-medium">Transaction ID:</span>
                <span className="font-mono text-xs">{transactionDetails.transactionId}</span>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Redirecting to homepage in a few seconds...
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Homepage
              </Button>
            </div>
          )}

          {status === 'failed' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Don't worry, no amount has been charged if the payment failed.
              </p>
              <div className="flex gap-2">
                <Button onClick={retryPayment} className="flex-1">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                  Go Home
                </Button>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="space-y-2">
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">
                This may take a few moments. Please don't close this page.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCallback;
