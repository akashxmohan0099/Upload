// Core data models that match what would be stored in a database

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  userType: 'candidate' | 'recruiter';
  createdAt?: string;
  updatedAt?: string;
  
  // Profile completion flags
  personalProfileComplete?: boolean;
  professionalProfileComplete?: boolean;
  companyProfileComplete?: boolean;
  
  // References to related data
  personalProfileId?: string;
  professionalProfileId?: string;
  companyId?: string;
}

export interface PersonalProfile {
  id: string;
  userId: string;
  
  // Photos and media
  photos: string[];
  
  // Personal information
  interests: string[];
  availability: string[]; // Format: "Mon-AM", "Tue-PM", etc.
  location: string;
  transportation: string;
  hobbies: string[];
  quickFacts: string[];
  
  // Personality prompts
  prompts: Array<{
    prompt: string;
    answer: string;
  }>;
  
  // Additional fields that might be collected
  politicalBelief?: string;
  ethnicities?: string[];
  religiousBelief?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  
  // Basic professional info
  bio?: string;
  skills: string[];
  
  // Experience
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  
  // Education
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  
  // Professional links and documents
  resume?: string;
  portfolio?: string;
  linkedIn?: string;
  
  // Achievements and goals
  achievements: string[];
  careerGoals?: string;
  idealRole?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  recruiterId: string;
  
  // Basic company info
  name: string;
  logo?: string;
  industry: string;
  size: string; // e.g., "1-10", "11-50", "51-200", etc.
  website?: string;
  description?: string;
  
  // Location
  location: {
    address?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  
  // Additional details
  foundedYear?: string;
  founder?: {
    name: string;
    title: string;
  };
  mission?: string;
  culture?: string;
  perks?: string[];
  
  // Media
  workplacePhotos?: string[];
  
  createdAt?: string;
  updatedAt?: string;
}

export interface JobPosting {
  id: string;
  companyId: string;
  recruiterId: string;
  
  // Job details
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  
  // Employment details
  type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  schedule?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  
  // Location
  location: {
    city: string;
    state?: string;
    country: string;
    remote?: boolean;
  };
  
  // Application tracking
  applicants?: number;
  views?: number;
  status: 'draft' | 'active' | 'paused' | 'closed';
  
  createdAt?: string;
  updatedAt?: string;
  postedAt?: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  
  // Application details
  coverLetter?: string;
  resume?: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';
  
  // Communication
  messages?: Array<{
    senderId: string;
    content: string;
    timestamp: string;
  }>;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface SavedItem {
  id: string;
  userId: string;
  itemType: 'job' | 'candidate' | 'company';
  itemId: string;
  createdAt?: string;
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}