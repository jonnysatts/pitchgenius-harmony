
export interface Project {
  id: string;
  title: string;
  clientName: string;
  clientIndustry: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  description: string;
  clientWebsite?: string;
  status?: 'draft' | 'in_progress' | 'completed';
  coverImage?: string;
  createdBy?: string;
  collaborators?: string[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  projectId: string;
  createdAt: Date;
  status?: 'uploading' | 'processing' | 'ready' | 'error';
  error?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  priority?: number;
}

export interface AIProcessingStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
}

export type InsightCategory = 
  | 'business_challenges'
  | 'audience_gaps'
  | 'competitive_threats'
  | 'gaming_opportunities'
  | 'strategic_recommendations'
  | 'key_narratives';

export type WebsiteInsightCategory = 
  | 'business_imperatives'
  | 'gaming_audience_opportunity'
  | 'strategic_activation_pathways'
  | 'company_positioning'
  | 'competitive_landscape'
  | 'key_partnerships'
  | 'public_announcements'
  | 'consumer_engagement'
  | 'product_service_fit';

export interface StrategicInsight {
  id: string;
  category: InsightCategory | WebsiteInsightCategory;
  confidence: number;
  needsReview: boolean;
  source?: 'document' | 'website';
  priorityLevel?: number;
  content: {
    title: string;
    summary: string;
    details?: string;
    evidence?: string;
    recommendations?: string;
    dataPoints?: string[];
    sources?: Array<{
      name: string;
      id: string;
    }>;
    impact?: string;
  };
}

export interface ProjectInsightsData {
  totalInsights: number;
  averageConfidence: number;
  categoryBreakdown: Record<string, number>;
  mostImpactfulInsight?: StrategicInsight;
}

export interface StoredInsightData {
  insights: StrategicInsight[];
  usingFallbackData: boolean;
  generationTimestamp: number;
  projectId?: string;
  timestamp?: string;
  usingFallbackInsights?: boolean;
}

export interface NarrativeSection {
  id: string;
  title: string;
  content: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
  avatar?: string;
}

export type UserRole = 'admin' | 'user' | 'guest' | 'standard';

// Add the missing WebsiteAnalysisStatus interface
export interface WebsiteAnalysisStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress: number;
  message: string;
  error: string | null;
}
