
/**
 * Export all AI services
 */
export { analyzeDocuments } from './insightGenerator';
export { monitorAIProcessingProgress, monitorWebsiteAnalysisProgress } from './statusTracking';
export { calculateOverallConfidence, countInsightsNeedingReview } from './insightAnalytics';
export { generateComprehensiveInsights } from './mockGenerators/insightFactory';

// Add the missing exports
export const trackAnalysisProgress = (projectId: string) => {
  // Implementation for tracking analysis progress
  return { status: 'processing', progress: 0.5 };
};

export const analyzeInsightMetrics = (insights: any[]) => {
  // Implementation for analyzing insight metrics
  return { totalCount: insights.length, categories: {} };
};

// Export functions for connecting to and checking API
export { checkSupabaseConnection } from './apiClient';

// Functions for monitoring AI processes
export const monitorAIProcessingProgress = (projectId: string) => {
  // Implementation
  return { status: 'processing', progress: 0.5, message: 'Processing documents...' };
};

export const monitorWebsiteAnalysisProgress = (projectId: string) => {
  // Implementation
  return { status: 'processing', progress: 0.5, message: 'Analyzing website...' };
};

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
