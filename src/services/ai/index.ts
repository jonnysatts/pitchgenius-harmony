
/**
 * Export all AI services
 */
export { analyzeDocuments } from './insightGenerator';
export { calculateOverallConfidence, countInsightsNeedingReview } from './insightAnalytics';
export { generateComprehensiveInsights } from './mockGenerators/insightFactory';
export { monitorAIProcessingProgress, monitorWebsiteAnalysisProgress } from './statusTracking';

// Add the missing exports for API connection checking
export { checkSupabaseConnection } from './apiClient';

// Generate insights function
export const generateInsights = () => {
  // Implementation
  return { 
    success: true, 
    insights: [], 
    error: null,
    insufficientContent: false
  };
};

// Website analysis
export * from './websiteAnalysis';
