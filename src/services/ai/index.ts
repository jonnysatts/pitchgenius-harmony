
/**
 * Main AI service index file that exports all AI-related functionality
 */

// Export from config
export { checkSupabaseConnection } from './config';

// Export from insightGenerator
export { generateInsights } from './insightGenerator';

// Export from statusTracking
export { 
  getAIProcessingStatus,
  monitorAIProcessingProgress
} from './statusTracking';

// Export from insightAnalytics
export {
  calculateOverallConfidence,
  countInsightsNeedingReview
} from './insightAnalytics';
