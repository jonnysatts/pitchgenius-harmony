
/**
 * Generate mock insights based on website analysis
 * This is used when we can't call the real API
 */
import { Project, StrategicInsight, WebsiteInsightCategory } from "@/lib/types";
import { websiteInsightCategories } from "@/components/project/insights/constants";

/**
 * Generate mock insights based on website analysis
 */
export const generateWebsiteMockInsights = (project: Project): StrategicInsight[] => {
  // Create a more even distribution of mock insights across website categories
  // instead of just using the category IDs, we'll make a balanced distribution
  const balancedDistribution: WebsiteInsightCategory[] = [
    'company_positioning',
    'competitive_landscape',
    'key_partnerships',
    'public_announcements',
    'consumer_engagement',
    'product_service_fit'
  ];
  
  // Generate a set of mock insights (one for each category)
  const websiteInsights = balancedDistribution.map((category, index) => {
    const categoryInfo = websiteInsightCategories.find(cat => cat.id === category);
    
    // Generate a unique ID with timestamp to prevent duplicates
    const timestamp = Date.now() + index; // Add index to ensure uniqueness
    const uniqueId = `website-insight-${index + 1}-${timestamp}`;
    
    return {
      id: uniqueId,
      category: category,
      source: 'website' as 'website',
      confidence: 70 + Math.floor(Math.random() * 25), // Random confidence between 70-95
      needsReview: Math.random() > 0.5, // 50% chance of needing review
      content: {
        title: `${categoryInfo?.label || 'Website Insight'} for ${project.clientName}`,
        summary: `🌐 [Website-derived] Analysis of ${project.clientName}'s ${categoryInfo?.label.toLowerCase()} based on their website.`,
        details: `This insight was generated from analyzing ${project.clientWebsite} to understand ${categoryInfo?.description.toLowerCase()}.`,
        recommendations: `Consider how the ${categoryInfo?.label.toLowerCase()} could be leveraged in a gaming context.`,
        source: 'Website analysis',
        websiteUrl: project.clientWebsite
      }
    };
  });
  
  console.log(`Generated ${websiteInsights.length} mock website insights:`, 
    websiteInsights.map(i => `${i.id}: ${i.category}`));
    
  return websiteInsights;
};
