
// This file contains fallback insight generators for website analysis
import { WebsiteInsightCategory, StrategicInsight } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Get fallback insight templates based on industry
 */
function getFallbackInsightTemplatesByIndustry(industry: string): Record<WebsiteInsightCategory, StrategicInsight> {
  // Base templates that will be customized per industry
  const baseTemplates: Record<WebsiteInsightCategory, StrategicInsight> = {
    business_imperatives: {
      id: uuidv4(),
      category: "business_imperatives",
      confidence: 75,
      needsReview: true,
      source: "website",
      content: {
        title: "Digital Engagement Gap with Gaming-Native Audiences",
        summary: "Website content analysis suggests a significant opportunity to connect with gaming audiences",
        details: "The current digital strategy appears focused on traditional audiences, potentially missing engagement opportunities with gaming-native consumers who expect more interactive and culturally relevant experiences.",
        recommendations: "Develop a gaming audience engagement strategy that bridges this gap through authentic content and experiences."
      }
    },
    gaming_audience_opportunity: {
      id: uuidv4(),
      category: "gaming_audience_opportunity",
      confidence: 70,
      needsReview: true,
      source: "website",
      content: {
        title: "Mobile-First Casual Gaming Audience Alignment",
        summary: "The Australian casual mobile gaming community represents a strategic opportunity",
        details: "With over 5 million Australians identifying as casual mobile gamers, this audience segment represents a significant opportunity for brands looking to expand their demographic reach.",
        recommendations: "Develop mobile-first gaming activations that align with brand values while authentically connecting with this growing audience."
      }
    },
    strategic_activation_pathways: {
      id: uuidv4(),
      category: "strategic_activation_pathways",
      confidence: 68,
      needsReview: true,
      source: "website",
      content: {
        title: "Fortress Venue Experiential Marketing Opportunity",
        summary: "Australia's premier gaming venue network offers unique brand activation opportunities",
        details: "Fortress venues across Australia provide access to highly engaged gaming audiences in premium environments, offering brands the opportunity to create memorable physical experiences.",
        recommendations: "Develop a Fortress venue activation strategy with branded experiences that naturally integrate products/services with gaming culture."
      }
    }
  } as Record<WebsiteInsightCategory, StrategicInsight>;
  
  // Return the base templates - in a more complex implementation, 
  // we would customize these based on the industry
  return baseTemplates;
}

/**
 * Generate fallback insights when we can't analyze the website content
 * This ensures users always get some insights even if the API or crawling fails
 */
export function generateFallbackWebsiteInsights(
  websiteUrl: string, 
  clientName: string, 
  clientIndustry: string
): StrategicInsight[] {
  // Get the templates for this industry
  const templates = getFallbackInsightTemplatesByIndustry(clientIndustry);
  
  // Create a copy of each template and customize for this client
  const insights: StrategicInsight[] = Object.values(templates).map(template => {
    const insight: StrategicInsight = {
      ...template,
      id: uuidv4()
    };
    
    // Add client name to content where appropriate
    insight.content = {
      ...template.content,
      title: template.content.title.replace("[CLIENT]", clientName),
      summary: template.content.summary.replace("[CLIENT]", clientName).replace("[INDUSTRY]", clientIndustry),
      details: template.content.details?.replace("[CLIENT]", clientName).replace("[INDUSTRY]", clientIndustry),
      recommendations: template.content.recommendations?.replace("[CLIENT]", clientName)
    };
    
    return insight;
  });
  
  return insights;
}

/**
 * Generate custom fallback insights for a specific website category
 */
export function generateCategoryFallbackInsight(
  category: WebsiteInsightCategory,
  websiteUrl: string,
  clientName: string,
  clientIndustry: string
): StrategicInsight {
  // Get the templates and select the one for this category
  const templates = getFallbackInsightTemplatesByIndustry(clientIndustry);
  const template = templates[category as WebsiteInsightCategory];
  
  if (!template) {
    // If the category doesn't exist in our templates, default to business_imperatives
    return generateCategoryFallbackInsight("business_imperatives", websiteUrl, clientName, clientIndustry);
  }
  
  // Create a copy and customize for this client
  const insight: StrategicInsight = {
    ...template,
    id: uuidv4()
  };
  
  // Add client name to content where appropriate
  insight.content = {
    ...template.content,
    title: template.content.title.replace("[CLIENT]", clientName),
    summary: template.content.summary.replace("[CLIENT]", clientName).replace("[INDUSTRY]", clientIndustry),
    details: template.content.details?.replace("[CLIENT]", clientName).replace("[INDUSTRY]", clientIndustry),
    recommendations: template.content.recommendations?.replace("[CLIENT]", clientName)
  };
  
  return insight;
}
