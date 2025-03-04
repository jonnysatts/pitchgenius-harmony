
// Export all the AI-related functions
export * from './apiClient';
export * from './config';
export * from './insightGenerator';
export * from './insightAnalytics';
export * from './statusTracking'; // This exports monitorWebsiteAnalysisProgress
export * from './promptUtils';
export * from './websiteAnalysis'; // Website analysis services

// Make sure these exports are available
export { monitorAIProcessingProgress, monitorWebsiteAnalysisProgress } from './statusTracking';
