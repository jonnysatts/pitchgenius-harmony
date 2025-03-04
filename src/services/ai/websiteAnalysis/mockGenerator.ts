
// This file contains mock generators for website insights
import { WebsiteInsightCategory, StrategicInsight } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a mock website insight with the given category
 */
export function generateMockWebsiteInsight(category: WebsiteInsightCategory, confidence: number): StrategicInsight {
  // Create the base insight structure
  const insight: StrategicInsight = {
    id: uuidv4(),
    category,
    confidence,
    needsReview: confidence < 80,
    source: "website",
    content: {
      title: "",
      summary: ""
    }
  };

  // Fill in content based on category
  switch (category) {
    case "business_imperatives":
      insight.content = {
        title: "Critical Digital Engagement Gap with Gen Z Audience",
        summary: "Website analytics reveal 72% of traffic is 35+ despite product relevance to younger demographics",
        details: "Based on website messaging and demographic target indicators, there's a significant gap between the company's stated demographic goals and their digital engagement reality. Content analysis shows corporate-focused messaging that fails to connect with gaming-native consumers.",
        recommendations: "Reposition digital assets to connect with gaming communities through authentic engagement strategies and culturally relevant content."
      };
      break;
      
    case "gaming_audience_opportunity":
      insight.content = {
        title: "Mobile-First Casual Gamers Align with Core Brand Values",
        summary: "5.2M Australian casual mobile gamers value accessibility and simplicity, matching brand positioning",
        details: "The website's emphasis on simplifying complex experiences shares core values with casual mobile gaming audiences. This demographic represents 68% of all Australian gamers yet is overlooked by competitors.",
        recommendations: "Create casual mobile gaming activations that position the brand as a 'complexity reducer' in both everyday life and gaming contexts."
      };
      break;
      
    case "strategic_activation_pathways":
      insight.content = {
        title: "Fortress Melbourne Gaming Event Partnership Opportunity",
        summary: "Creating branded engagement zones at Australia's premier gaming venue to reach 15K+ monthly visitors",
        details: "Based on the website's event calendar and sponsorship history, the brand invests in traditional marketing but misses the gaming crossover opportunity. Creating a persistent brand presence at Fortress venues would allow authentic engagement with gaming communities.",
        recommendations: "Develop a 3-month activation program at Fortress Melbourne with branded gaming stations and product integration points, estimated to generate 45K quality interactions."
      };
      break;
      
    default:
      insight.content = {
        title: "Untapped Gaming Community Engagement Opportunity",
        summary: "Website analysis reveals potential for strategic gaming audience connections",
        details: "Analysis of the website content and positioning indicates several potential connection points with gaming audiences that aren't currently being leveraged.",
        recommendations: "Explore targeted gaming community engagement strategies aligned with core brand values."
      };
  }

  return insight;
}

/**
 * Generate a set of mock website insights
 */
export function generateMockWebsiteInsights(websiteUrl: string): StrategicInsight[] {
  // Generate insights for each category
  const insights: StrategicInsight[] = [
    generateMockWebsiteInsight("business_imperatives", 87),
    generateMockWebsiteInsight("gaming_audience_opportunity", 82),
    generateMockWebsiteInsight("strategic_activation_pathways", 78)
  ];
  
  return insights;
}
