
/**
 * Export all website analysis services
 */

// Re-export the service methods with correct names
export { 
  analyzeClientWebsite, 
  getWebsiteAnalysisStatus,
  extractInsightsFromWebsiteData
} from './websiteAnalysisService';

// For backward compatibility
export const analyzeWebsite = analyzeClientWebsite;

// Export mock generators for testing
export { generateMockWebsiteInsights } from './mockGenerator';

// Export API service
export { callClaudeForWebsiteAnalysis, callWebsiteAnalysisApi } from './claudeApiService';

// Export fallback insight generation
export { generateFallbackWebsiteInsights } from './fallbackInsightGenerator';

// Export the processor
export { processWebsiteInsights } from './websiteInsightProcessor';
