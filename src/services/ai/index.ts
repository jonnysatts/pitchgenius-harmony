
/**
 * Export all AI services
 */
export { checkSupabaseConnection } from "./config";
export { generateInsights } from "./insightGenerator";
export { generateComprehensiveInsights } from "./mockGenerators/insightFactory";
export { getAIProcessingStatus, monitorAIProcessingProgress } from "./statusTracking";
export { calculateOverallConfidence, countInsightsNeedingReview } from "./insightAnalytics";
export { GAMING_SPECIALIST_PROMPT, generateWebsiteContext, generateWebsiteResearchPrompt } from "./promptEngineering";
export { analyzeClientWebsite as analyzeWebsite } from "./websiteAnalysis";
