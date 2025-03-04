
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
export const processWebsiteInsights = (rawInsights: any[], project?: Project): StrategicInsight[] => {
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
  
  // Ensure we have insights in the new categories
  const validCategoryIds = new Set(["business_imperatives", "gaming_audience_opportunity", "strategic_activation_pathways"]);
  
  // Normalize categories to match our expected formats
  const processedInsights = rawInsights.map((insight: any) => {
    // Get the raw category or use default if not present
    const rawCategory = insight.category || 'business_imperatives';
    
    // Determine the correct category
    let normalizedCategory = rawCategory;
    if (!validCategoryIds.has(rawCategory)) {
      // Try to map to the closest matching category
      if (rawCategory.includes('business') || rawCategory.includes('imperative')) {
        normalizedCategory = 'business_imperatives';
      } else if (rawCategory.includes('audience') || rawCategory.includes('opportunity')) {
        normalizedCategory = 'gaming_audience_opportunity';
      } else if (rawCategory.includes('activation') || rawCategory.includes('pathways') || rawCategory.includes('strategic')) {
        normalizedCategory = 'strategic_activation_pathways';
      } else {
        // Default to business imperatives if can't match
        normalizedCategory = 'business_imperatives';
      }
      
      console.log(`Normalized category "${rawCategory}" to "${normalizedCategory}"`);
    }
    
    // Client name fallback
    const clientName = project?.clientName || 'the client';
    
    // Clean up titles and ensure they're not empty or just punctuation
    let title = insight.content?.title || '';
    if (!title || title === ',' || title === '.') {
      title = getCategoryTitle(normalizedCategory as WebsiteInsightCategory);
    }
    
    // Clean up summary
    let summary = insight.content?.summary || '';
    if (!summary || summary === ',' || summary === '.') {
      summary = `Strategic ${normalizedCategory.replace(/_/g, ' ')} for ${clientName}`;
    }
    
    // Clean up the summary to remove duplicate website-derived markers
    summary = summary.replace(/\[Website-derived\]/g, '').trim();
    summary = summary.replace(/🌐\s*🌐/g, '🌐').trim();
    summary = summary.replace(/Website-derived/g, '').trim();
    
    // Clean up details
    let details = insight.content?.details || '';
    if (!details || details === ',' || details === '.') {
      details = `Website analysis identified important ${normalizedCategory.replace(/_/g, ' ')} that could help drive business results through gaming audience engagement.`;
    }
    
    // Clean up recommendations
    let recommendations = insight.content?.recommendations || '';
    if (!recommendations || recommendations === ',' || recommendations === '.') {
      recommendations = getCategoryRecommendation(normalizedCategory as WebsiteInsightCategory);
    }
    
    // Replace generic company references with Games Age
    recommendations = recommendations.replace(/A gaming company/g, 'Games Age').replace(/The gaming company/g, 'Games Age');
    
    // Fix the type by explicitly setting source to 'website'
    return {
      ...insight,
      source: 'website' as 'website',
      category: normalizedCategory as WebsiteInsightCategory,
      content: {
        ...insight.content,
        title,
        summary: `🌐 ${summary}`, // Use only the globe icon
        details,
        recommendations,
        websiteUrl: project?.clientWebsite || '',
        source: 'Website analysis'
      }
    } as StrategicInsight;
  });
  
  // Log the processed insights
  console.log('Processed website insights:', processedInsights.map(i => ({
    id: i.id,
    category: i.category,
    title: i.content.title
  })));
  
  return processedInsights;
};
