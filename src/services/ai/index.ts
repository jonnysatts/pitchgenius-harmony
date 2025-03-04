
/**
 * Export all AI services
 */
export { analyzeDocuments } from './insightGenerator';
export { trackAnalysisProgress } from './statusTracking';
export { analyzeInsightMetrics } from './insightAnalytics';
export { generateComprehensiveInsights } from './mockGenerators/insightFactory';

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
  return { success: true };
};

// Website analysis
export * from './websiteAnalysis';
