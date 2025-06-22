export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface Company {
  id: string;
  name: string;
  position: string;
  duration: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  text: string;
  avatar?: string;
}

export interface Contact {
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  github: string;
}

export interface PortfolioData {
  headline: string;
  bio: string;
  languages: string[];
  projects: Project[];
  companies: Company[];
  testimonials: Testimonial[];
  contact: Contact;
  customUrl: string;
}

export interface DeploymentInfo {
  id: string;
  url: string;
  createdAt: string;
  status: 'pending' | 'deploying' | 'deployed' | 'failed';
}
