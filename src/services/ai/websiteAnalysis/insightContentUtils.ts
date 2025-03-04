
/**
 * Utility functions for generating default insight content
 */
import { WebsiteInsightCategory } from "@/lib/types";

/**
 * Get a default title based on category
 */
export function getCategoryTitle(category: string): string {
  const titles: Record<string, string> = {
    company_positioning: "Company Positioning Analysis",
    competitive_landscape: "Competitive Landscape Overview",
    key_partnerships: "Strategic Partnerships Analysis",
    public_announcements: "Recent Public Announcements",
    consumer_engagement: "Consumer Engagement Opportunities",
    product_service_fit: "Product-Service Gaming Fit"
  };
  
  return titles[category] || "Website Analysis Insight";
}

/**
 * Get a default recommendation based on category
 */
export function getCategoryRecommendation(category: string): string {
  const recommendations: Record<string, string> = {
    company_positioning: "Align gaming initiatives with the company's brand positioning to ensure consistency and leverage existing brand equity.",
    competitive_landscape: "Identify gaps in competitors' gaming strategies to develop a distinctive positioning in the gaming space.",
    key_partnerships: "Explore gaming partnerships that complement existing strategic alliances and extend their value proposition.",
    public_announcements: "Time gaming initiatives to coincide with or follow major company announcements for maximum visibility.",
    consumer_engagement: "Develop gaming elements that enhance the existing customer journey and interaction points.",
    product_service_fit: "Integrate gaming mechanics that highlight and enhance the core value of existing products and services."
  };
  
  return recommendations[category] || 
         "Consider incorporating gaming elements that align with the company's strategic goals.";
}

/**
 * Format category ID into human-readable form
 */
export function formatCategoryName(category: WebsiteInsightCategory): string {
  return category
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Validate and clean text content
 */
export function cleanTextContent(text: string): string {
  if (!text) return '';
  
  // Remove anything that looks like JSON fragments
  let cleaned = text.replace(/"\w+":\s*"[^"]*"/g, "");
  
  // Remove error codes or strange numeric sequences
  cleaned = cleaned.replace(/-?\d{8,}/g, "");
  
  // Remove excess punctuation
  cleaned = cleaned.replace(/[{}\[\]",]+/g, " ");
  
  // Clean up whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  
  return cleaned || '';
}
