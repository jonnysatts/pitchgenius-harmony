
import { StrategicInsight, InsightCategory } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Extract strategic insights from analysis results
 * 
 * This function converts the raw analysis results from Claude into
 * properly structured StrategicInsight objects that can be used
 * throughout the application.
 */
export const extractInsightsFromAnalysis = (analysisResults: any[]): StrategicInsight[] | null => {
  try {
    console.log("Extracting insights from analysis results:", analysisResults);
    
    if (!analysisResults || !Array.isArray(analysisResults) || analysisResults.length === 0) {
      console.error("No valid analysis results to extract insights from");
      return null;
    }
    
    const insights: StrategicInsight[] = analysisResults.map(result => {
      // Determine the appropriate category
      const category = mapToInsightCategory(result.category || "gaming_opportunities");
      
      // Check if source is explicitly provided
      const sourceType = result.source || 'document';
      
      // Create a strategic insight with required fields
      const insight: StrategicInsight = {
        id: result.id || uuidv4(),
        category: category,
        confidence: result.confidence || Math.random() * 0.4 + 0.6, // Default to high confidence if not provided
        needsReview: result.needsReview !== false, // Default to requiring review
        source: sourceType,
        priorityLevel: result.priority || Math.floor(Math.random() * 3) + 1,
        content: {
          title: result.title || result.content?.title || "Untitled Insight",
          summary: result.summary || result.content?.summary || result.description || "No summary provided",
          details: result.details || result.content?.details || result.content || "",
          evidence: result.evidence || result.content?.evidence || "",
          recommendations: result.recommendations || result.content?.recommendations || "",
          dataPoints: result.dataPoints || result.content?.dataPoints || [],
          sources: result.sources || result.content?.sources || [],
          impact: result.impact || result.content?.impact || ""
        }
      };
      
      console.log(`Created insight: ${insight.content.title} (${insight.category}) from source: ${insight.source}`);
      return insight;
    });
    
    console.log(`Successfully extracted ${insights.length} insights from analysis results`);
    return insights;
  } catch (error) {
    console.error("Error extracting insights from analysis:", error);
    return null;
  }
};

/**
 * Map raw category strings to proper InsightCategory enum values
 */
const mapToInsightCategory = (rawCategory: string): InsightCategory => {
  const categoryMap: Record<string, InsightCategory> = {
    'business_challenges': 'business_challenges',
    'audience_gaps': 'audience_gaps',
    'competitive_threats': 'competitive_threats',
    'gaming_opportunities': 'gaming_opportunities',
    'strategic_recommendations': 'strategic_recommendations',
    'key_narratives': 'key_narratives',
    // Website-specific categories
    'company_positioning': 'business_challenges',
    'competitive_landscape': 'competitive_threats',
    'key_partnerships': 'business_challenges',
    'public_announcements': 'key_narratives',
    'consumer_engagement': 'audience_gaps',
    'product_service_fit': 'gaming_opportunities',
    // Add fallbacks for common variations
    'business': 'business_challenges',
    'audience': 'audience_gaps',
    'competitive': 'competitive_threats',
    'gaming': 'gaming_opportunities',
    'recommendations': 'strategic_recommendations',
    'narratives': 'key_narratives',
    'opportunities': 'gaming_opportunities',
    'strategy': 'strategic_recommendations',
    'challenges': 'business_challenges',
    'threats': 'competitive_threats',
    'gaps': 'audience_gaps'
  };
  
  const normalized = (rawCategory || '').toLowerCase().trim();
  
  // Try direct match first
  if (normalized in categoryMap) {
    return categoryMap[normalized];
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(categoryMap)) {
    if (normalized.includes(key)) {
      return value;
    }
  }
  
  // Default fallback
  console.warn(`Unknown insight category: ${rawCategory}, defaulting to gaming_opportunities`);
  return 'gaming_opportunities';
};
