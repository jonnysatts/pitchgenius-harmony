
/**
 * Types for the Website Analysis API
 */
export interface WebsiteAnalysisParams {
  website_url: string;
  client_name?: string;
  client_industry?: string;
  use_firecrawl?: boolean;
  system_prompt?: string;
}

export interface WebsiteInsight {
  id: string;
  category: string;
  confidence: number;
  needsReview: boolean;
  content: {
    title: string;
    summary: string;
    details: string;
    recommendations: string;
  };
}

export interface WebsiteAnalysisResponse {
  data: WebsiteInsight[];
  error?: string;
}
