
/**
 * Service for analyzing client websites and generating preliminary insights
 */
import { Project, StrategicInsight } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { callClaudeApi, createTimeoutPromise } from "./apiClient";
import { generateWebsiteResearchPrompt } from "./promptEngineering";
import { generateComprehensiveInsights } from "./mockGenerators/insightFactory";
import { checkSupabaseConnection } from "./config";
import { prepareWebsiteContent } from "./promptUtils";

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
    
    // In production, this would call the Supabase Edge Function with the website URL
    // For now, we'll use the mock insights as a placeholder
    
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
          systemPrompt: websiteResearchPrompt
        }
      });
      
      if (error) {
        console.error('Error from Edge Function:', error);
        throw error;
      }
      
      if (!data || !data.insights || data.insights.length === 0) {
        throw new Error('No insights returned from website analysis');
      }
      
      return { insights: data.insights };
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
  // Generate a smaller set of mock insights (3-5)
  const websiteInsights = generateComprehensiveInsights(project, [])
    .filter((_, index) => index < 5) // Take only first 5 insights
    .map(insight => {
      // Create a modified insight with website analysis specific information
      return {
        ...insight,
        content: {
          ...insight.content,
          source: 'Website analysis',
          websiteUrl: project.clientWebsite,
          // Add a flag that this is preliminary research
          summary: insight.content.summary 
            ? '🌐 [Website-derived] ' + insight.content.summary 
            : insight.content.summary
        }
      };
    });
    
  return websiteInsights;
};

