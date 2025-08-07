import { useState, useEffect } from 'react';
import { SubscriptionService } from '@/services/subscriptionService';
import { UserSubscription, UserUsage } from '@/types/subscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const sub = await SubscriptionService.getUserSubscription(user.id);
        setSubscription(sub);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndUseFeature = async (
    feature: keyof UserUsage, 
    options?: { 
      quizDuration?: number;
      onSuccess?: () => void;
      onLimit?: () => void;
      onAutoRedirect?: () => void;
    }
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use this feature",
          variant: "destructive",
        });
        return false;
      }

      // Special handling for 30-minute quiz
      if (feature === 'quizGenerates' && options?.quizDuration === 30) {
        const sub = await SubscriptionService.getUserSubscription(user.id);
        const plan = SubscriptionService.getPlanDetails(sub.tier);
        
        if (!plan?.features.quiz30MinEnabled) {
          toast({
            title: "Upgrade Required",
            description: "30-minute quiz generation is available in Pro and Premium plans",
            variant: "destructive",
          });
          options?.onLimit?.();
          return false;
        }
      }

      const canUse = await SubscriptionService.canUseFeature(user.id, feature);
      
      if (!canUse.allowed) {
        toast({
          title: "Limit Reached",
          description: canUse.reason || "You've reached your usage limit for this feature",
          variant: "destructive",
        });
        options?.onLimit?.();
        
        // Auto-redirect to billing after 2 seconds
        if (options?.onAutoRedirect) {
          setTimeout(() => {
            options.onAutoRedirect?.();
          }, 2000);
        }
        
        return false;
      }

      // Increment usage
      await SubscriptionService.incrementUsage(user.id, feature);
      await loadSubscription(); // Reload to update UI
      
      // Show remaining uses if not unlimited
      if (canUse.limit && typeof canUse.limit === 'number' && canUse.used !== undefined) {
        const remaining = canUse.limit - (canUse.used + 1);
        if (remaining > 0 && remaining <= 3) {
          toast({
            title: "Usage Update",
            description: `You have ${remaining} ${feature} remaining this month`,
          });
        }
      }

      options?.onSuccess?.();
      return true;
    } catch (error) {
      console.error('Error checking feature usage:', error);
      toast({
        title: "Error",
        description: "Failed to verify subscription status",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    subscription,
    loading,
    checkAndUseFeature,
    reloadSubscription: loadSubscription,
  };
};
