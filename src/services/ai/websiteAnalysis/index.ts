
/**
 * Export all website analysis services
 */

// Import first to make it available for backward compatibility export
import { analyzeClientWebsite, getWebsiteAnalysisStatus, extractInsightsFromWebsiteData } from './websiteAnalysisService';

// Re-export the service methods with correct names
export { 
  analyzeClientWebsite, 
  getWebsiteAnalysisStatus,
  extractInsightsFromWebsiteData
};

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
