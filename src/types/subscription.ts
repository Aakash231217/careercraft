export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'premium';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  features: PlanFeatures;
  popular?: boolean;
}

export interface PlanFeatures {
  resumes: number | 'unlimited';
  coverLetters: number | 'unlimited';
  mockInterviews: number | 'unlimited';
  quizGenerates: number | 'unlimited';
  quiz30MinEnabled: boolean;
  roadmapGenerator: number | 'unlimited';
  projectFeedback: number | 'unlimited';
  salaryGuide: number | 'unlimited';
  hrContactList: number | 'unlimited';
}

export interface UserUsage {
  resumes: number;
  coverLetters: number;
  mockInterviews: number;
  quizGenerates: number;
  roadmapGenerator: number;
  projectFeedback: number;
  salaryGuide: number;
  hrContactList: number;
  lastReset: string;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  usage: UserUsage;
}
