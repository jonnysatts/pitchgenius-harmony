
/**
 * Process raw insights from API responses
 */
import { StrategicInsight, Project, WebsiteInsightCategory } from "@/lib/types";
import { websiteInsightCategories } from "@/components/project/insights/constants";
import { normalizeWebsiteCategory, isValidWebsiteCategory } from "@/components/project/insights/utils/insightFormatters";
import { getCategoryTitle, getCategoryRecommendation, cleanTextContent } from "./insightContentUtils";

/**
 * Process and normalize raw insights from the API
 */
export const processWebsiteInsights = (rawInsights: any[], project: Project): StrategicInsight[] => {
  // Log the raw categories from API for debugging
  console.log('Raw categories from API:', rawInsights.map((i: any) => i.category));
  
  // Filter out any obviously malformed insights
  let validInsights = rawInsights.filter(insight => {
    // Check for valid content structure
    if (!insight.content || typeof insight.content !== 'object') {
      return false;
    }
    
    // Check for malformed content fields
    if (insight.content.title === ',' || 
        (insight.content.summary && insight.content.summary.includes('-1685557426')) ||
        (insight.content.details && insight.content.details.includes('-1685557426'))) {
      return false;
    }
    
    return true;
  });
  
  // If we filtered out too many, we might have a systemic issue
  if (validInsights.length < rawInsights.length * 0.5) {
    console.warn(`Filtered out ${rawInsights.length - validInsights.length} malformed insights`);
    // Use all insights but fix them during processing
  } else if (validInsights.length > 0) {
    // Use just the valid ones if we have enough
    rawInsights = validInsights;
  }
  
  // Ensure we have insights in all categories
  const availableCategories = new Set(rawInsights.map((i: any) => 
    normalizeWebsiteCategory(i.category || 'company_positioning')
  ));
  
  console.log('Available categories after normalization:', Array.from(availableCategories));
  
  // If we have fewer than 3 categories, we need to supplement with more varied insights
  if (availableCategories.size < 3) {
    console.log('Not enough varied categories, redistributing insights');
    
    // List all possible categories
    const allCategories: WebsiteInsightCategory[] = websiteInsightCategories.map(c => c.id as WebsiteInsightCategory);
    
    // Redistribute some insights to other categories to ensure variety
    rawInsights = rawInsights.map((insight: any, index: number) => {
      // Leave the first few insights as they are
      if (index < 3) return insight;
      
      // For others, assign to under-represented categories
      const targetCategory = allCategories[index % allCategories.length];
      if (!availableCategories.has(targetCategory)) {
        console.log(`Reassigning insight ${index} to category ${targetCategory}`);
        return {
          ...insight,
          category: targetCategory
        };
      }
      
      return insight;
    });
  }
  
  // Make sure all insights have the source field set to 'website'
  // and have proper category values
  const processedInsights = rawInsights.map((insight: any) => {
    // Normalize the category using our utility function
    const normalizedCategory = normalizeWebsiteCategory(insight.category || 'company_positioning');
    
    // Ensure the insight has a valid category
    if (!isValidWebsiteCategory(normalizedCategory)) {
      console.log(`Invalid category after normalization for insight: ${insight.id}, setting to default 'company_positioning'`);
    }
    
    // Fix any problematic title
    let title = insight.content?.title || '';
    if (!title || title === ',' || title === '.') {
      // Generate a title based on category
      title = getCategoryTitle(normalizedCategory);
    }
    
    // Clean up the summary to remove duplicate website-derived markers
    let summary = insight.content?.summary || '';
    summary = summary.replace(/\[Website-derived\]/g, '').trim();
    summary = summary.replace(/🌐\s*🌐/g, '🌐').trim();
    summary = summary.replace(/Website-derived/g, '').trim(); // Remove any remaining text mentions
    
    // Check for error patterns in summary
    if (summary.includes('-1685557426') || summary.includes('category') || summary === '.' || summary === '') {
      summary = `Analysis of ${project.clientName || 'client'}'s website for ${normalizedCategory.replace(/_/g, ' ')}`;
    }
    
    // Clean up details
    let details = insight.content?.details || '';
    if (details.includes('-1685557426') || details.includes('category') || details === '.' || details === '') {
      details = `Website analysis focused on ${normalizedCategory.replace(/_/g, ' ')}.`;
    }
    
    // Clean up recommendations and replace "A gaming company" with "Games Age"
    let recommendations = insight.content?.recommendations || '';
    if (!recommendations || recommendations.includes('-1685557426')) {
      recommendations = getCategoryRecommendation(normalizedCategory);
    }
    
    // Replace "A gaming company" with "Games Age" in recommendations
    recommendations = recommendations.replace(/A gaming company/g, 'Games Age');
    
    // Fix the type by explicitly setting source to 'website'
    return {
      ...insight,
      source: 'website' as 'website',
      category: normalizedCategory,
      content: {
        ...insight.content,
        title,
        summary: `🌐 ${summary}`, // Use only the globe icon without [Website-derived]
        details,
        recommendations,
        websiteUrl: project.clientWebsite,
        source: 'Website analysis'
      }
    } as StrategicInsight;
  });
  
  // Log the distributed categories after normalization
  const categoryDistribution = processedInsights.reduce((acc: Record<string, number>, insight) => {
    const category = String(insight.category);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  console.log('Website insights category distribution after normalization:', categoryDistribution);
  
  return processedInsights;
};
