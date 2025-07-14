import { SubscriptionTier, UserSubscription, UserUsage, SubscriptionPlan, PlanFeatures } from '@/types/subscription';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    currency: '₹',
    features: {
      resumes: 1,
      coverLetters: 1,
      mockInterviews: 1,
      quizGenerates: 1,
      quiz30MinEnabled: false,
      roadmapGenerator: 1,
      projectFeedback: 1,
      salaryGuide: 1,
      hrContactList: 0,
    }
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    currency: '₹',
    popular: true,
    features: {
      resumes: 3,
      coverLetters: 10,
      mockInterviews: 3,
      quizGenerates: 10,
      quiz30MinEnabled: false,
      roadmapGenerator: 3,
      projectFeedback: 10,
      salaryGuide: 15,
      hrContactList: 30, // 1 HR email per day for 30 days
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 69,
    currency: '₹',
    features: {
      resumes: 10,
      coverLetters: 50,
      mockInterviews: 15,
      quizGenerates: 50,
      quiz30MinEnabled: true,
      roadmapGenerator: 'unlimited',
      projectFeedback: 'unlimited',
      salaryGuide: 'unlimited',
      hrContactList: 150, // 5 HR emails per day for 30 days
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 109,
    currency: '₹',
    features: {
      resumes: 'unlimited',
      coverLetters: 'unlimited',
      mockInterviews: 'unlimited',
      quizGenerates: 'unlimited',
      quiz30MinEnabled: true,
      roadmapGenerator: 'unlimited',
      projectFeedback: 'unlimited',
      salaryGuide: 'unlimited',
      hrContactList: 300, // 10 HR emails per day for 30 days
    }
  }
];

export class SubscriptionService {
  private static STORAGE_KEY = 'career-dev-subscription';
  private static USAGE_KEY = 'career-dev-usage';

  static getDefaultSubscription(): UserSubscription {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    return {
      tier: 'free',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: false,
      usage: {
        resumes: 0,
        coverLetters: 0,
        mockInterviews: 0,
        quizGenerates: 0,
        roadmapGenerator: 0,
        projectFeedback: 0,
        salaryGuide: 0,
        hrContactList: 0,
        lastReset: now.toISOString(),
      }
    };
  }

  static async getUserSubscription(userId: string): Promise<UserSubscription> {
    // For now, we'll use localStorage. In production, this should be stored in Supabase
    const key = `${this.STORAGE_KEY}-${userId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      const subscription = JSON.parse(stored) as UserSubscription;
      // Check if we need to reset monthly usage
      this.checkAndResetMonthlyUsage(subscription, userId);
      return subscription;
    }

    const defaultSub = this.getDefaultSubscription();
    this.saveUserSubscription(userId, defaultSub);
    return defaultSub;
  }

  static async saveUserSubscription(userId: string, subscription: UserSubscription): Promise<void> {
    const key = `${this.STORAGE_KEY}-${userId}`;
    localStorage.setItem(key, JSON.stringify(subscription));
  }

  static checkAndResetMonthlyUsage(subscription: UserSubscription, userId: string): void {
    const lastReset = new Date(subscription.usage.lastReset);
    const now = new Date();
    const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));

    // Reset usage every 30 days
    if (daysSinceReset >= 30) {
      subscription.usage = {
        resumes: 0,
        coverLetters: 0,
        mockInterviews: 0,
        quizGenerates: 0,
        roadmapGenerator: 0,
        projectFeedback: 0,
        salaryGuide: 0,
        hrContactList: 0,
        lastReset: now.toISOString(),
      };
      this.saveUserSubscription(userId, subscription);
    }
  }

  static async canUseFeature(userId: string, feature: keyof UserUsage): Promise<{ allowed: boolean; reason?: string; limit?: number; used?: number }> {
    const subscription = await this.getUserSubscription(userId);
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.tier);
    
    if (!plan) {
      return { allowed: false, reason: 'Invalid subscription plan' };
    }

    const limit = plan.features[feature as keyof PlanFeatures];
    const used = subscription.usage[feature];

    // Special handling for quiz 30-min feature
    if (feature === 'quizGenerates' && !plan.features.quiz30MinEnabled) {
      // Check if trying to create a 30-min quiz (this would need to be passed as context)
      // For now, we'll handle this in the component
    }

    if (limit === 'unlimited') {
      return { allowed: true };
    }

    if (typeof limit === 'number' && typeof used === 'number' && used >= limit) {
      let upgradeMessage = '';
      
      if (subscription.tier === 'free') {
        upgradeMessage = `You've used your free trial for ${feature}! Upgrade to Starter (₹9/month) to continue using this feature.`;
      } else if (subscription.tier === 'starter') {
        upgradeMessage = `You've reached your monthly limit of ${limit} ${feature}. Upgrade to Pro (₹69/month) for more features!`;
      } else {
        upgradeMessage = `You've reached your monthly limit of ${limit} ${feature}. Upgrade to Premium (₹109/month) for unlimited access!`;
      }
      
      return { 
        allowed: false, 
        reason: upgradeMessage,
        limit,
        used
      };
    }

    return { allowed: true, limit: typeof limit === 'number' ? limit : undefined, used: used as number };
  }

  static async incrementUsage(userId: string, feature: keyof UserUsage): Promise<void> {
    const subscription = await this.getUserSubscription(userId);
    subscription.usage[feature]++;
    await this.saveUserSubscription(userId, subscription);
  }

  static async upgradePlan(userId: string, newTier: SubscriptionTier): Promise<void> {
    const subscription = await this.getUserSubscription(userId);
    subscription.tier = newTier;
    subscription.startDate = new Date().toISOString();
    
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    subscription.endDate = endDate.toISOString();
    
    await this.saveUserSubscription(userId, subscription);
  }

  static getPlanDetails(tier: SubscriptionTier): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === tier);
  }

  static getAllPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }
}
