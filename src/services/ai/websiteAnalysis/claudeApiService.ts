
/**
 * Service for calling Claude API to analyze websites
 */
import { Project, StrategicInsight, WebsiteInsightCategory } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { generateWebsiteResearchPrompt } from "../promptEngineering";
import { prepareWebsiteContent } from "../promptUtils";
import { websiteInsightCategories } from "@/components/project/insights/constants";
import { normalizeWebsiteCategory, isValidWebsiteCategory } from "@/components/project/insights/utils/insightFormatters";
import { useToast } from "@/hooks/use-toast";

/**
 * Call the Claude API to analyze a website
 */
export const callWebsiteAnalysisApi = async (project: Project): Promise<{ insights: StrategicInsight[], error?: string }> => {
  try {
    const websiteResearchPrompt = generateWebsiteResearchPrompt(
      project.clientWebsite || '',
      project.clientIndustry
    );
    
    const websiteContent = prepareWebsiteContent(project.clientWebsite || '', project);
    
    try {
      console.log('Calling analyze-website-with-anthropic edge function...');
      
      // Call the Supabase Edge Function that uses Anthropic
      const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
        body: { 
          projectId: project.id, 
          clientIndustry: project.clientIndustry,
          clientWebsite: project.clientWebsite,
          projectTitle: project.title,
          clientName: project.clientName,
          websiteContent,
          systemPrompt: websiteResearchPrompt,
          // Add the website insight categories to the request as explicit array
          websiteInsightCategories: websiteInsightCategories.map(cat => cat.id),
          // Add timestamp to prevent caching issues
          timestamp: new Date().toISOString(),
          // Add debug flag to get more detailed logs
          debugMode: true
        }
      });
      
      if (error) {
        console.error('Error from Edge Function:', error);
        throw error;
      }
      
      if (!data || !data.insights || data.insights.length === 0) {
        throw new Error('No insights returned from website analysis');
      }
      
      // Log raw insights data for debugging
      console.log("Raw insights from API:", JSON.stringify(data.insights.slice(0, 2)));
      
      // Process and validate the insights
      const processedInsights = processWebsiteInsights(data.insights, project);
      
      // Verify that the processed insights have proper content
      const invalidInsights = processedInsights.filter(insight => {
        return !insight.content?.title || 
               insight.content.title === ',' || 
               insight.content.summary?.includes('-1685557426') ||
               insight.content.details?.includes('-1685557426');
      });
      
      if (invalidInsights.length > 0) {
        console.error('Found invalid insights after processing:', invalidInsights.length);
        throw new Error('The API returned malformed insights');
      }
      
      return { insights: processedInsights };
    } catch (err) {
      console.error('Error calling Supabase Edge Function:', err);
      throw err;
    }
  } catch (error: any) {
    console.error('Error calling website analysis API:', error);
    throw error;
  }
};

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
    
    // Clean up the summary to remove duplicate website-derived markers and errors
    let summary = insight.content?.summary || '';
    summary = summary.replace(/\[Website-derived\]\s*\[Website-derived\]/g, '[Website-derived]');
    
    // Check for error patterns in summary
    if (summary.includes('-1685557426') || summary.includes('category') || summary === '.' || summary === '') {
      summary = `Analysis of ${project.clientName || 'client'}'s website for ${normalizedCategory.replace(/_/g, ' ')}`;
    }
    
    // Clean up details
    let details = insight.content?.details || '';
    if (details.includes('-1685557426') || details.includes('category') || details === '.' || details === '') {
      details = `Website analysis focused on ${normalizedCategory.replace(/_/g, ' ')}.`;
    }
    
    // Clean up recommendations
    let recommendations = insight.content?.recommendations || '';
    if (!recommendations || recommendations.includes('-1685557426')) {
      recommendations = getCategoryRecommendation(normalizedCategory);
    }
    
    // Fix the type by explicitly setting source to 'website'
    return {
      ...insight,
      source: 'website' as 'website', // Use type assertion to match the expected literal type
      category: normalizedCategory,
      content: {
        ...insight.content,
        title,
        summary: summary.includes('[Website-derived]') ? summary : `🌐 [Website-derived] ${summary}`,
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
  console.log('Website insights categories:', processedInsights.map(i => i.category));
  
  return processedInsights;
};

/**
 * Get a default title based on category
 */
function getCategoryTitle(category: string): string {
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
function getCategoryRecommendation(category: string): string {
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
