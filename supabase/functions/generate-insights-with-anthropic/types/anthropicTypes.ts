
/**
 * Type definitions for Anthropic Claude API
 */

/**
 * Options for Anthropic API calls
 */
export interface AnthropicApiOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  retries?: number;
}

/**
 * Structure for Anthropic API Request
 */
export interface AnthropicApiRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  system?: string;
  max_tokens: number;
  temperature: number;
  stream?: boolean;
}

/**
 * Structure for Anthropic API Response
 */
export interface AnthropicApiResponse {
  id: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  type: string;
  role: 'assistant';
  model: string;
  stop_reason: string;
  stop_sequence?: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Structure for Insight categories
 */
export type InsightCategory = 
  | 'business_challenges'
  | 'audience_gaps'
  | 'competitive_threats'
  | 'gaming_opportunities'
  | 'strategic_recommendations'
  | 'key_narratives'
  | 'business_imperatives';

/**
 * Structure for a strategic insight from Claude
 */
export interface RawInsight {
  id: string;
  category: InsightCategory;
  title: string;
  content: string;
  confidence: number;
}

/**
 * Error response from API
 */
export interface AnthropicErrorResponse {
  error: {
    type: string;
    message: string;
  };
}
