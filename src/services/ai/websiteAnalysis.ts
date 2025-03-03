
/**
 * Service for analyzing client websites and generating preliminary insights
 */
import { Project, StrategicInsight, WebsiteInsightCategory } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { callClaudeApi, createTimeoutPromise } from "./apiClient";
import { generateWebsiteResearchPrompt } from "./promptEngineering";
import { generateComprehensiveInsights } from "./mockGenerators/insightFactory";
import { checkSupabaseConnection } from "./config";
import { prepareWebsiteContent } from "./promptUtils";
import { websiteInsightCategories } from "@/components/project/insights/constants";
import { normalizeWebsiteCategory, isValidWebsiteCategory } from "@/components/project/insights/utils/insightFormatters";

/**
 * Analyze a client website to generate preliminary insights
 */
export const analyzeClientWebsite = async (
  project: Project
): Promise<{ insights: StrategicInsight[], error?: string }> => {
  try {
    // Skip if no website URL is provided
    if (!project.clientWebsite) {
      return { 
        insights: [],
        error: "No client website URL provided for analysis" 
      };
    }

    console.log(`Analyzing client website: ${project.clientWebsite}`);
    
    // Check if we can use the real API
    const useRealApi = await checkSupabaseConnection();
    
    if (!useRealApi) {
      console.log('Supabase connection not available, using mock website insights');
      const websiteMockInsights = generateWebsiteMockInsights(project);
      return { 
        insights: websiteMockInsights,
        error: "Using sample website insights - no Supabase connection available"
      };
    }
    
    console.log('Using Anthropic API via Supabase Edge Function to analyze website');
    
    // Create a timeout promise - 90 seconds (1.5 minutes)
    const timeoutPromise = createTimeoutPromise(project, [], 90000);
    
    try {
      // Race between the actual API call and the timeout
      return await Promise.race([
        callWebsiteAnalysisApi(project),
        timeoutPromise
      ]);
    } catch (apiError: any) {
      console.log('Falling back to mock website insights due to API error');
      const mockInsights = generateWebsiteMockInsights(project);
      return { 
        insights: mockInsights,
        error: "Claude AI error during website analysis - using generated sample insights instead. Error: " + (apiError.message || String(apiError))
      };
    }
  } catch (err: any) {
    console.error('Error analyzing website:', err);
    const mockInsights = generateWebsiteMockInsights(project);
    return { 
      insights: mockInsights,
      error: "Using generated sample website insights due to an error: " + (err.message || 'An unexpected error occurred while analyzing the website')
    };
  }
};

/**
 * Call the Claude API to analyze a website
 */
const callWebsiteAnalysisApi = async (project: Project): Promise<{ insights: StrategicInsight[], error?: string }> => {
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
          websiteContent,
          systemPrompt: websiteResearchPrompt,
          // Add the website insight categories to the request
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
      
      // Log the raw categories from API for debugging
      console.log('Raw categories from API:', data.insights.map((i: any) => i.category));
      
      // Make sure all insights have the source field set to 'website'
      // and have proper category values
      const processedInsights = data.insights.map((insight: StrategicInsight) => {
        // Normalize the category using our utility function
        const normalizedCategory = normalizeWebsiteCategory(insight.category || 'company_positioning');
        
        // Ensure the insight has a valid category
        if (!isValidWebsiteCategory(normalizedCategory)) {
          console.log(`Invalid category after normalization for insight: ${insight.id}, setting to default 'company_positioning'`);
        }
        
        // Ensure title is set
        if (!insight.content?.title || typeof insight.content.title !== 'string') {
          insight.content = insight.content || {};
          insight.content.title = `Website Insight for ${project.clientName}`;
        }
        
        // Ensure summary is set
        if (!insight.content?.summary || typeof insight.content.summary !== 'string') {
          insight.content = insight.content || {};
          insight.content.summary = `🌐 [Website-derived] Analysis of ${project.clientName}'s website.`;
        }
        
        return {
          ...insight,
          source: 'website',
          category: normalizedCategory,
          content: {
            ...insight.content,
            websiteUrl: project.clientWebsite,
            source: 'Website analysis'
          }
        };
      });
      
      // Log the distributed categories after normalization
      const categoryDistribution = processedInsights.reduce((acc: Record<string, number>, insight) => {
        const category = String(insight.category);
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Website insights category distribution after normalization:', categoryDistribution);
      console.log('Website insights categories:', processedInsights.map(i => i.category));
      
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
 * Generate mock insights based on website analysis
 * This is used when we can't call the real API
 */
const generateWebsiteMockInsights = (project: Project): StrategicInsight[] => {
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
