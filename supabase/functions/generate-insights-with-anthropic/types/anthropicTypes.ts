
/**
 * Type definitions for Anthropic API integration
 */

export interface AnthropicApiOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface DocumentContent {
  id?: string;
  title?: string;
  content: string;
  type?: string;
  fileName?: string;
}

export interface InsightContent {
  title: string;
  summary: string;
  details?: string;
  recommendations?: string;
  evidence?: string;
  impact?: string;
  dataPoints?: string[];
  sources?: string[];
}

export interface StrategicInsight {
  id: string;
  category: string;
  confidence: number;
  needsReview: boolean;
  content: InsightContent;
}

export interface GenerateInsightsRequest {
  projectId: string;
  documentIds?: string[];
  documentContents?: DocumentContent[];
  clientIndustry?: string;
  clientWebsite?: string;
  projectTitle?: string;
  processingMode?: 'comprehensive' | 'focused' | 'quick';
  systemPrompt?: string;
  includeComprehensiveDetails?: boolean;
  maximumResponseTime?: number;
}

export interface GenerateInsightsResponse {
  insights: StrategicInsight[];
  error?: string;
  insufficientContent?: boolean;
}
