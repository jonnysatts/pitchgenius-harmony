
/**
 * Generation of strategic insights using AI
 */
import { supabase } from "@/integrations/supabase/client";
import { Document, StrategicInsight, Project } from "@/lib/types";
import { checkSupabaseConnection } from "./config";
import { generateComprehensiveInsights } from "./mockGenerator";

/**
 * Generate strategic insights by processing documents with AI
 */
export const generateInsights = async (
  project: Project, 
  documents: Document[]
): Promise<{ insights: StrategicInsight[], error?: string }> => {
  try {
    // Process all documents without limiting
    const documentIds = documents.map(doc => doc.id);
    
    console.log(`Processing ${documents.length} documents for project ${project.id}`);
    
    // Extract text content from documents if possible
    // For a demo, we'll create mock content based on the document names and metadata
    const documentContents = documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      // In a real app, this would be the actual content extracted from the documents
      content: `This is ${doc.name}, a ${doc.type} document about ${project.clientIndustry} industry strategies. 
                It contains important information about market trends, customer engagement, and potential 
                gaming opportunities in the ${project.clientIndustry} sector.
                The document highlights challenges with customer retention and engagement,
                especially with younger demographics. Competitors are starting to implement
                gamification strategies that are showing promising results.
                Priority: ${doc.priority || 0}`
    }));

    // Check if we're in development mode without Supabase or if Supabase connection failed
    const useRealApi = await checkSupabaseConnection();
    
    if (!useRealApi) {
      console.log('Supabase connection not available, using mock insights generator');
      const mockInsights = generateComprehensiveInsights(project, documents);
      return { 
        insights: mockInsights,
        error: "Using sample insights - no Supabase connection available"
      };
    }
    
    console.log('Using Anthropic API via Supabase Edge Function to generate insights');
    
    // Create a timeout promise - increased from 15 to 30 seconds to give Claude more time
    const timeoutPromise = new Promise<{ insights: StrategicInsight[], error?: string }>((resolve) => {
      setTimeout(() => {
        console.log('API request taking too long, falling back to mock insights');
        const mockInsights = generateComprehensiveInsights(project, documents);
        resolve({ 
          insights: mockInsights, 
          error: "Claude AI timeout - using generated sample insights instead. If you want to try again with Claude AI, please use the Retry Analysis button." 
        });
      }, 30000); // 30 second timeout instead of 15
    });
    
    try {
      // Race between the actual API call and the timeout
      return await Promise.race([
        (async () => {
          // Call the Supabase Edge Function that uses Anthropic
          const { data, error } = await supabase.functions.invoke('generate-insights-with-anthropic', {
            body: { 
              projectId: project.id, 
              documentIds,
              clientIndustry: project.clientIndustry,
              projectTitle: project.title,
              documentContents,
              processingMode: 'quick', // Changed from 'thorough' to 'quick' to reduce processing time
              includeComprehensiveDetails: true
            }
          });
          
          if (error) {
            console.error('Error generating insights with Anthropic:', error);
            console.log('Falling back to mock insights generator due to API error');
            const mockInsights = generateComprehensiveInsights(project, documents);
            return { 
              insights: mockInsights,
              error: "Claude AI error - using generated sample insights instead. Error: " + error.message
            };
          }
          
          // Check if we received valid insights from the API
          if (!data || !data.insights || data.insights.length === 0) {
            console.log('No insights received from API, falling back to mock generator');
            const mockInsights = generateComprehensiveInsights(project, documents);
            return { 
              insights: mockInsights,
              error: "No insights returned from Claude AI - using generated sample insights instead" 
            };
          }
          
          console.log('Successfully received insights from Anthropic:', data);
          return { 
            insights: data.insights || [],
            error: undefined
          };
        })(),
        timeoutPromise
      ]);
    } catch (apiError: any) {
      console.error('Error calling Anthropic API:', apiError);
      console.log('Falling back to mock insights generator due to API error');
      const mockInsights = generateComprehensiveInsights(project, documents);
      return { 
        insights: mockInsights,
        error: "Claude AI error - using generated sample insights instead. Error: " + apiError.message
      };
    }
  } catch (err: any) {
    console.error('Error generating insights:', err);
    // Always return mock insights as a fallback
    const mockInsights = generateComprehensiveInsights(project, documents);
    return { 
      insights: mockInsights,
      error: "Using generated sample insights due to an error: " + (err.message || 'An unexpected error occurred while analyzing documents')
    };
  }
};
