
export type UserRole = "admin" | "standard" | "viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Project {
  id: string;
  title: string;
  clientName: string;
  clientIndustry: "retail" | "finance" | "technology" | "entertainment" | "other";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  collaborators: string[];
  status: "draft" | "in_progress" | "completed";
  coverImage?: string;
}

export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
  priority?: number;
}

export interface StrategicInsight {
  id: string;
  category: "business_challenges" | "audience_gaps" | "competitive_threats" | 
    "gaming_opportunities" | "strategic_recommendations" | "key_narratives";
  content: Record<string, any>;
  confidence: number;
  needsReview: boolean;
}

export interface Slide {
  id: string;
  title: string;
  layout: string;
  content: Record<string, any>;
  order: number;
  section: "intro" | "context" | "landscape" | "insight" | "solution" | "vision" | "proof";
}

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
}

// New type for the 6-step narrative framework
export interface NarrativeFramework {
  gamingRevolution: string;
  currentLandscape: string;
  culturalInsight: string;
  strategicSolution: string;
  tangibleVision: string;
  proofOfConcept: string;
}

// Type for AI processing status
export interface AIProcessingStatus {
  status: "idle" | "processing" | "completed" | "error" | "finalizing";
  progress: number;
  message: string;
}
