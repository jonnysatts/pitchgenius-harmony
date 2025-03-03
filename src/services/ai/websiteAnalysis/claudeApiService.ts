
/**
 * Service for calling Claude API to analyze websites
 */
import { Project, StrategicInsight, WebsiteInsightCategory } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { generateWebsiteResearchPrompt } from "../promptEngineering";
import { prepareWebsiteContent } from "../promptUtils";
import { websiteInsightCategories } from "@/components/project/insights/constants";
import { normalizeWebsiteCategory, isValidWebsiteCategory } from "@/components/project/insights/utils/insightFormatters";

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
          websiteInsightCategories: websiteInsightCategories.map(cat => cat.id)
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
      
      return { insights: processWebsiteInsights(data.insights, project) };
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
    
    // Clean up the summary to remove duplicate website-derived markers
    let summary = insight.content?.summary || '';
    summary = summary.replace(/\[Website-derived\]\s*\[Website-derived\]/g, '[Website-derived]');
    
    // Ensure title is set
    if (!insight.content?.title || typeof insight.content.title !== 'string') {
      insight.content = insight.content || {};
      insight.content.title = `Website Insight for ${project.clientName}`;
    }
    
    // Ensure summary is set with website marker
    if (!summary || typeof summary !== 'string') {
      summary = `🌐 [Website-derived] Analysis of ${project.clientName}'s website.`;
    } else if (!summary.includes('[Website-derived]')) {
      summary = `🌐 [Website-derived] ${summary}`;
    }
    
    // Fix the type by explicitly setting source to 'website'
    return {
      ...insight,
      source: 'website' as 'website', // Use type assertion to match the expected literal type
      category: normalizedCategory,
      content: {
        ...insight.content,
        summary,
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
