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
import { UserSubscription, SubscriptionPlan } from '@/types/subscription';
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

      // In a real application, you would integrate with a payment gateway here
      // For demo purposes, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      await SubscriptionService.upgradePlan(user.id, planId as any);
      await loadSubscription();

      toast({
        title: "Success!",
        description: `You've been upgraded to the ${planId} plan`,
      });
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast({
        title: "Error",
        description: "Failed to process upgrade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const getUsagePercentage = (used: number, limit: number | 'unlimited'): number => {
    if (limit === 'unlimited') return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const formatFeatureLimit = (limit: number | 'unlimited'): string => {
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
          <p className="text-muted-foreground">Manage your plan and track your usage</p>
          <div className="mt-4 flex items-center gap-2 text-lg font-medium text-primary">
            <span>Your career</span>
            <span className="text-2xl font-bold">&gt;&gt;&gt;&gt;</span>
            <Pizza className="h-6 w-6" />
            <span>a pizza</span>
          </div>
        </div>

        {/* Current Plan Overview */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Your Current Plan: {currentPlan?.name}
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
                      {currentPlan?.price > 0 && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          {currentPlan.currency}{currentPlan.price}/month
                        </span>
                      )}
                    </div>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Usage Overview */}
        {currentSubscription && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Monthly Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(currentSubscription.usage).map(([feature, used]) => {
                if (feature === 'lastReset') return null;
                const limit = currentPlan?.features[feature as keyof typeof currentPlan.features];
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

        {/* Pricing Plans */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`relative h-full ${plan.popular ? 'border-2 border-primary' : ''}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center justify-between">
                      {plan.name}
                      {plan.id === 'pro' && <Zap className="h-5 w-5 text-yellow-500" />}
                      {plan.id === 'premium' && <Crown className="h-5 w-5 text-purple-500" />}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.currency}{plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
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
                      className="w-full"
                      variant={currentPlan?.id === plan.id ? "secondary" : "default"}
                      disabled={currentPlan?.id === plan.id || processingPayment !== null}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {processingPayment === plan.id ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Processing...
                        </div>
                      ) : currentPlan?.id === plan.id ? (
                        'Current Plan'
                      ) : (
                        'Upgrade Now'
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
