
/**
 * Export all AI services
 */
export { checkSupabaseConnection } from "./config";
export { generateInsights } from "./insightGenerator";
export { generateComprehensiveInsights } from "./mockGenerators/insightFactory";
export { getAIProcessingStatus, monitorAIProcessingProgress } from "./statusTracking";
export { calculateOverallConfidence, countInsightsNeedingReview } from "./insightAnalytics";
export { GAMING_SPECIALIST_PROMPT, generateWebsiteContext } from "./promptEngineering";

