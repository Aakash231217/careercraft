
export interface LinkedInAnalysis {
  overall_score: number;
  headline_score: number;
  summary_score: number;
  experience_score: number;
  skills_score: number;
  profile_photo_score: number;
  strengths: string[];
  improvements: string[];
  detailed_feedback: string;
  optimized_suggestions: {
    headline: string;
    summary: string;
    skills_to_add: string[];
    experience_tips: string[];
  };
}

export interface LinkedInProfile {
  url: string;
  name?: string;
  headline?: string;
  summary?: string;
  experience?: string;
  skills?: string[];
  has_photo?: boolean;
}
