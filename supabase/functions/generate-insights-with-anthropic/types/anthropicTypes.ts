
/**
 * Types for the Anthropic API
 */
export interface AnthropicRequestParams {
  projectId: string;
  documentContents: any[];
  clientIndustry?: string;
  clientWebsite?: string; 
  projectTitle?: string;
  processingMode?: string;
  includeComprehensiveDetails?: boolean;
  maximumResponseTime?: number;
  systemPrompt?: string;
}

export interface DocumentContent {
  name: string;
  type: string;
  size: string;
  priority: number;
  content: string;
  index: number;
}
