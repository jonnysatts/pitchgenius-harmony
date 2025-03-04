
/**
 * Service for calling Claude API to analyze websites
 */
import { Project, StrategicInsight } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { generateWebsiteResearchPrompt } from "../promptEngineering";
import { prepareWebsiteContent } from "../promptUtils";
import { processWebsiteInsights } from "./websiteInsightProcessor";
import { generateFallbackInsights } from "./fallbackInsightGenerator";

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
          // Add the website insight categories to the request
          websiteInsightCategories: ["company_positioning", "competitive_landscape", "key_partnerships", 
                                     "public_announcements", "consumer_engagement", "product_service_fit"],
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
        console.error('No insights returned from website analysis');
        return { insights: generateFallbackInsights(project), error: 'No insights returned from website analysis' };
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
        // Generate fallback insights if too many are invalid
        if (invalidInsights.length > processedInsights.length * 0.5) {
          return { 
            insights: generateFallbackInsights(project), 
            error: 'The API returned mostly malformed insights'
          };
        }
      }
      
      return { insights: processedInsights };
    } catch (err) {
      console.error('Error calling Supabase Edge Function:', err);
      return { 
        insights: generateFallbackInsights(project), 
        error: `Error calling edge function: ${err instanceof Error ? err.message : String(err)}`
      };
    }
  } catch (error: any) {
    console.error('Error calling website analysis API:', error);
    return { 
      insights: generateFallbackInsights(project), 
      error: `Error in website analysis: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};
