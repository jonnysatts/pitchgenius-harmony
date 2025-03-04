
import { WebsiteInsight } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Calls the Claude API to analyze a website URL
 * @param websiteUrl The URL to analyze
 * @param clientName The client name for context
 * @param clientIndustry The client industry for context
 */
export const analyzeWebsiteWithAnthropic = async (
  websiteUrl: string,
  clientName: string = "",
  clientIndustry: string = "retail"
): Promise<WebsiteInsight[]> => {
  try {
    console.log(`Analyzing website ${websiteUrl} for ${clientName} in ${clientIndustry} industry`);
    
    // In a real implementation, this would make an API call to Claude
    // For now, return mock data after a delay to simulate API call
    return await simulateApiCall(websiteUrl, clientName, clientIndustry);
  } catch (error) {
    console.error("Error calling Claude API:", error);
    throw new Error("Failed to analyze website with Claude");
  }
};

const simulateApiCall = async (
  websiteUrl: string,
  clientName: string,
  clientIndustry: string
): Promise<WebsiteInsight[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock insights
  return generateMockInsights(websiteUrl, clientName, clientIndustry);
};

const generateMockInsights = (
  websiteUrl: string,
  clientName: string,
  clientIndustry: string
): WebsiteInsight[] => {
  // Generate 3-5 mock insights based on website URL
  const count = 3 + Math.floor(Math.random() * 3);
  const insights: WebsiteInsight[] = [];
  
  for (let i = 0; i < count; i++) {
    insights.push({
      id: `website-insight-${uuidv4().substring(0, 8)}`,
      category: getCategoryForIndex(i),
      confidence: 70 + Math.floor(Math.random() * 25),
      needsReview: Math.random() > 0.7,
      content: {
        title: `Insight ${i+1} for ${clientName}`,
        summary: `Summary of insight ${i+1} for ${websiteUrl}`,
        details: `Detailed analysis of insight ${i+1} for ${websiteUrl}`,
        recommendations: `Recommendation for insight ${i+1}`
      }
    });
  }
  
  return insights;
};

const getCategoryForIndex = (index: number): string => {
  const categories = [
    'business_imperatives',
    'gaming_audience_opportunity',
    'strategic_activation_pathways'
  ];
  
  return categories[index % categories.length];
};
