import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Crown, 
  Zap, 
  TrendingUp,
  CreditCard,
  Calendar,
  AlertCircle,
  Pizza
} from 'lucide-react';
import { SubscriptionService, SUBSCRIPTION_PLANS } from '@/services/subscriptionService';
import { UserSubscription, SubscriptionPlan, PlanFeatures } from '@/types/subscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';


const Billing = () => {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const subscription = await SubscriptionService.getUserSubscription(user.id);
        setCurrentSubscription(subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setProcessingPayment(planId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upgrade your plan",
          variant: "destructive",
        });
        return;
      }

      // Get plan details
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      if (plan.price === 0) {
        toast({
          title: "Free Plan",
          description: "You're already on the free plan.",
          variant: "default"
        });
        setProcessingPayment(null);
        return;
      }

      const planDetails = SubscriptionService.getPlanDetails(planId as any);
      if (!planDetails) {
        throw new Error('Plan not found');
      }

      // Store transaction details for callback verification
      const transactionData = {
        planId,
        amount: planDetails.price,
        userId: user.id,
        userEmail: user.email,
        userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
      };

      // Initiate PayU payment
      const response = await fetch('/.netlify/functions/payu-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      // Enhanced error handling for JSON parsing
      if (!response.ok) {
        console.error('PayU payment response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Payment initiation failed: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('PayU payment response:', responseText);
      
      if (!responseText.trim()) {
        console.error('Empty response from PayU payment function');
        throw new Error('Empty response from payment service');
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text that failed to parse:', responseText);
        throw new Error('Invalid response format from payment service');
      }

      if (result.success && result.data?.formData) {
        // Store transaction details in localStorage for callback verification
        localStorage.setItem('pendingTransaction', JSON.stringify({
          transactionId: result.data.transactionId,
          planId,
          amount: planDetails.price,
          timestamp: Date.now()
        }));

        // Create and submit PayU form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = result.data.formData.key ? 'https://secure.payu.in/_payment' : result.data.paymentUrl;
        
        // Add all PayU form fields
        Object.entries(result.data.formData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error(result.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process upgrade. Please try again.",
        variant: "destructive",
      });
      setProcessingPayment(null);
    }
  };

  const getUsagePercentage = (used: number, limit: number | 'unlimited'): number => {
    if (limit === 'unlimited') return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const formatFeatureLimit = (limit: number | 'unlimited' | undefined): string => {
    if (limit === undefined || limit === null) return 'N/A';
    return limit === 'unlimited' ? 'Unlimited' : limit.toString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlan = currentSubscription ? 
    SUBSCRIPTION_PLANS.find(p => p.id === currentSubscription.tier) : 
    SUBSCRIPTION_PLANS[0];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground">Start with 1 free trial per tool, then upgrade to continue your career growth</p>
          <div className="mt-4 flex items-center gap-2 text-lg font-medium text-primary">
            <span>Your career</span>
            <span className="text-2xl font-bold">&gt;&gt;&gt;&gt;</span>
            <Pizza className="h-6 w-6" />
            <span>a pizza</span>
          </div>
        </div>

        {/* Free Trial Usage Tracking */}
        {currentSubscription?.tier === 'free' && (
          <Card className="mb-8 border-2 border-orange-500/30 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <AlertCircle className="h-5 w-5" />
                Free Trial Usage
              </CardTitle>
              <CardDescription className="text-orange-600 dark:text-orange-400">
                You're using the free trial. Upgrade to Starter (₹9/month) to continue after your trials are exhausted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    currentSubscription.usage.resumes >= 1 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {currentSubscription.usage.resumes}/1
                  </div>
                  <div className="text-sm text-muted-foreground">Resumes</div>
                  <Progress 
                    value={currentSubscription.usage.resumes * 100} 
                    className="mt-2" 
                  />
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    currentSubscription.usage.coverLetters >= 1 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {currentSubscription.usage.coverLetters}/1
                  </div>
                  <div className="text-sm text-muted-foreground">Cover Letters</div>
                  <Progress 
                    value={currentSubscription.usage.coverLetters * 100} 
                    className="mt-2" 
                  />
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    currentSubscription.usage.mockInterviews >= 1 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {currentSubscription.usage.mockInterviews}/1
                  </div>
                  <div className="text-sm text-muted-foreground">Mock Interviews</div>
                  <Progress 
                    value={currentSubscription.usage.mockInterviews * 100} 
                    className="mt-2" 
                  />
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    currentSubscription.usage.roadmapGenerator >= 1 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {currentSubscription.usage.roadmapGenerator}/1
                  </div>
                  <div className="text-sm text-muted-foreground">Roadmaps</div>
                  <Progress 
                    value={currentSubscription.usage.roadmapGenerator * 100} 
                    className="mt-2" 
                  />
                </div>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={() => handleUpgrade('starter')}
                  disabled={processingPayment !== null}
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3"
                >
                  {processingPayment === 'starter' ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <>Continue with Starter Plan - ₹9/month</>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Get 5 resumes, 10 cover letters, 3 roadmaps and more every month
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Plan Overview for Paid Users */}
        {currentSubscription?.tier !== 'free' && (
          <>
            <Card className="mb-8 border-2 border-primary/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      Your Current Plan: {currentPlan?.name}
                      {currentPlan?.id === 'starter' && <TrendingUp className="h-5 w-5 text-green-500" />}
                      {currentPlan?.id === 'pro' && <Zap className="h-5 w-5 text-yellow-500" />}
                      {currentPlan?.id === 'premium' && <Crown className="h-5 w-5 text-purple-500" />}
                    </CardTitle>
                    <CardDescription>
                      {currentSubscription && (
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Next renewal: {new Date(currentSubscription.endDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            {currentPlan?.currency}{currentPlan?.price}/month
                          </span>
                        </div>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Usage Overview for Paid Plans */}
            {currentSubscription && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Monthly Usage</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(currentSubscription.usage).map(([feature, used]) => {
                    if (feature === 'lastReset') return null;
                    const limit = currentPlan?.features[feature as keyof PlanFeatures];
                    // Skip features that don't exist in current plan
                    if (limit === undefined) return null;
                    const percentage = getUsagePercentage(used as number, limit as any);
                    
                    return (
                      <Card key={feature} className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium capitalize">
                              {feature.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {used} / {formatFeatureLimit(limit as any)}
                            </span>
                          </div>
                          {limit !== 'unlimited' && (
                            <Progress value={percentage} className="h-2" />
                          )}
                          {percentage >= 80 && limit !== 'unlimited' && (
                            <div className="flex items-center gap-1 text-xs text-orange-500">
                              <AlertCircle className="h-3 w-3" />
                              Approaching limit
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Pricing Plans */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            {currentSubscription?.tier === 'free' ? 'Upgrade Plans' : 'Available Plans'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.filter(plan => plan.id !== 'free').map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <Card className={`h-full ${currentPlan?.id === plan.id ? 'ring-2 ring-primary' : ''} ${plan.popular ? 'border-primary' : ''}`}>
                  <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r rounded-t-lg ${
                    plan.id === 'free' ? 'from-gray-400 to-gray-500' :
                    plan.id === 'starter' ? 'from-green-400 to-green-500' :
                    plan.id === 'pro' ? 'from-blue-500 to-purple-500' :
                    'from-purple-500 to-pink-500'
                  }`} />
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
                        {plan.id === 'starter' ? 'Best Value' : 'Most Popular'}
                      </Badge>
                    </div>
                  )}
                  {plan.id === 'free' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gray-500 text-white px-3 py-1 text-sm font-medium">
                        Try Free
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center justify-between">
                      {plan.name}
                      {plan.id === 'starter' && <TrendingUp className="h-5 w-5 text-green-500" />}
                      {plan.id === 'pro' && <Zap className="h-5 w-5 text-yellow-500" />}
                      {plan.id === 'premium' && <Crown className="h-5 w-5 text-purple-500" />}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.currency}{plan.price}</span>
                      <span className="text-muted-foreground">{plan.price === 0 ? ' - No payment required' : '/month'}</span>
                    </div>
                    {plan.id === 'starter' && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Ideal for regular job seekers and students
                      </p>
                    )}
                    {plan.id === 'pro' && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Perfect for active job seekers and professionals
                      </p>
                    )}
                    {plan.id === 'premium' && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Unlimited access for career coaches and recruiters
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{formatFeatureLimit(plan.features.resumes)} Resumes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{formatFeatureLimit(plan.features.coverLetters)} Cover Letters</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{formatFeatureLimit(plan.features.mockInterviews)} Mock Interviews</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{formatFeatureLimit(plan.features.quizGenerates)} Quiz Generations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {plan.features.quiz30MinEnabled ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span>30-minute Quiz Mode</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{formatFeatureLimit(plan.features.roadmapGenerator)} Roadmap Generators</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{formatFeatureLimit(plan.features.projectFeedback)} Project Feedback</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{formatFeatureLimit(plan.features.salaryGuide)} Salary Guides</span>
                      </li>
                    </ul>

                    <Button
                      className={`w-full ${
                        plan.id === 'free' ? 'bg-gray-500 hover:bg-gray-600' :
                        plan.id === 'starter' ? 'bg-green-500 hover:bg-green-600' :
                        plan.id === 'pro' ? 'bg-blue-500 hover:bg-blue-600' :
                        'bg-purple-500 hover:bg-purple-600'
                      } text-white`}
                      variant={currentPlan?.id === plan.id ? "secondary" : "default"}
                      disabled={currentPlan?.id === plan.id || processingPayment !== null || plan.id === 'free'}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {processingPayment === plan.id ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Processing...
                        </div>
                      ) : currentPlan?.id === plan.id ? (
                        'Current Plan'
                      ) : plan.id === 'free' ? (
                        'Automatic on Sign Up'
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Billing;
