
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
  clientWebsite?: string;
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

// Updated to reflect the strategic analysis categories
export type InsightCategory = 
  "business_challenges" | 
  "audience_gaps" | 
  "competitive_threats" | 
  "gaming_opportunities" | 
  "strategic_recommendations" | 
  "key_narratives";

// Enriched narrative section types
export type NarrativeSection = 
  "gaming_revolution" | 
  "client_landscape" | 
  "cultural_insight" | 
  "solution_path" | 
  "tangible_vision" | 
  "proof_of_concept";

export interface StrategicInsight {
  id: string;
  category: InsightCategory;
  narrativeSection?: NarrativeSection; // Which narrative section this insight belongs to
  content: Record<string, any>;
  confidence: number;
  needsReview: boolean;
  priorityLevel?: "high" | "medium" | "low"; // For business challenges and opportunities
  timeframe?: "short_term" | "medium_term" | "long_term"; // For recommendations
  audienceSegment?: "casual" | "regular" | "committed" | "creator"; // For audience insights
  engagementLevel?: "spectate" | "participate" | "create" | "advocate"; // For engagement strategy
  physicalDigitalIntegration?: boolean; // Whether this involves physical venue integration
  communityStrategy?: boolean; // Whether this involves community building
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

// Enhanced type for the strategic elements
export interface EnhancedStrategyElements {
  gamingAudiencePyramid?: {
    casual?: string;
    regular?: string;
    committed?: string;
    creator?: string;
  };
  engagementSpectrum?: {
    spectate?: string;
    participate?: string;
    create?: string;
    advocate?: string;
  };
  physicalDigitalIntegration?: {
    venueActivation?: string;
    digitalExtension?: string;
    omnichannel?: string;
  };
  communityStrategy?: {
    buildingApproach?: string;
    authenticityMarkers?: string;
    relationshipDevelopment?: string;
    valueExchange?: string;
  };
}

// Type for AI processing status
export interface AIProcessingStatus {
  status: "idle" | "processing" | "completed" | "error" | "finalizing";
  progress: number;
  message: string;
}
