
/**
 * Configuration constants for AI services
 */

// Gaming specialist system prompt
export const GAMING_SPECIALIST_PROMPT = `
You are an expert consultant specializing in gaming industry strategy and audience analysis. 
Your task is to analyze the provided documents and extract strategic insights that will help 
gaming companies better understand their audience, identify market opportunities, and develop 
effective engagement strategies. Focus on identifying actionable insights related to:

1. Business challenges and market trends
2. Audience gaps and behavior patterns
3. Competitive threats and positioning
4. Gaming industry-specific opportunities 
5. Strategic recommendations for growth
6. Key narratives that resonate with gaming audiences

Provide detailed, evidence-based insights with high confidence where possible.
`;

// Additional AI configuration
export const AI_TIMEOUT_MS = 120000; // 2 minutes
export const DEFAULT_TEMPERATURE = 0.3;
export const MAX_TOKENS_RESPONSE = 4000;

// Configuration for insight generation
export const INSIGHT_CATEGORIES = [
  'business_challenges',
  'audience_gaps', 
  'competitive_threats',
  'gaming_opportunities',
  'strategic_recommendations',
  'key_narratives'
];

// Default confidence thresholds
export const HIGH_CONFIDENCE_THRESHOLD = 85;
export const MEDIUM_CONFIDENCE_THRESHOLD = 70;
export const LOW_CONFIDENCE_THRESHOLD = 50;
