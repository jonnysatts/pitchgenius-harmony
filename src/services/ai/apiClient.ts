
import { Project, Document, StrategicInsight, InsightCategory } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { prepareDocumentContents } from './promptUtils';
import { mockApiResponse } from './mockData';

/**
 * Create a Promise that rejects after a specified timeout
 */
export const createTimeoutPromise = (timeoutMs: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
  });
};

/**
 * Check Supabase connection and if Anthropic API key exists
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Checking Supabase connection and API keys...');
    const { data, error } = await supabase.functions.invoke('test-connection', {
      body: { 
        testType: 'anthropic-key-check',
        timestamp: new Date().toISOString(),
        debugMode: true
      }
    });
    
    if (error) {
      console.error('Error checking Supabase connection:', error);
      return false;
    }
    
    // Check if the API key exists in the response
    const anthropicKeyExists = data?.anthropicKeyExists === true;
    console.log(`Anthropic API key ${anthropicKeyExists ? 'exists' : 'does not exist'}`);
    
    return anthropicKeyExists;
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    return false;
  }
};

/**
 * Generate a context description from a website URL for AI analysis
 */
export const generateWebsiteContext = async (
  websiteUrl: string,
  projectId: string
): Promise<string> => {
  try {
    // Simple validation of the URL
    if (!websiteUrl || !websiteUrl.startsWith('http')) {
      return `Website URL (${websiteUrl}) is invalid or missing.`;
    }
    
    // This would typically call an API to extract content
    // For now, we'll return a simple description
    return `Website ${websiteUrl} for project ${projectId}. This appears to be a website related to gaming or internet services.`;
  } catch (error) {
    console.error('Error generating website context:', error);
    return `Error generating context for ${websiteUrl}: ${error instanceof Error ? error.message : String(error)}`;
  }
};

/**
 * Call Claude API via Supabase Edge Function with timeout
 */
export const callClaudeApi = async (
  project: Project,
  documents: Document[],
  documentContents: any[]
): Promise<{ 
  insights: StrategicInsight[];
  error?: string;
  insufficientContent?: boolean;
}> => {
  try {
    console.log(`🔄 Making API call to Supabase Edge Function for Claude analysis...`);
    
    // Calculate total content size
    const contentSize = documentContents.reduce((sum, doc) => sum + (doc.content?.length || 0), 0);
    
    // Prepare the request payload
    const payload = {
      projectId: project.id,
      documentIds: documents.map(doc => doc.id),
      documentContents: documentContents,
      clientIndustry: project.clientIndustry || 'technology',
      clientWebsite: project.clientWebsite || '',
      projectTitle: project.title || '',
      processingMode: 'comprehensive',
      includeComprehensiveDetails: true,
      maximumResponseTime: 110, // Maximum seconds to wait for Claude
      systemPrompt: `
You are an expert consultant specializing in gaming industry strategy and audience analysis. 
Your task is to analyze the provided documents and extract strategic insights that will help 
gaming companies better understand their audience, identify market opportunities, and develop 
effective engagement strategies. Focus on identifying actionable insights related to:

1. Business challenges and market trends
2. Audience gaps and behavior patterns
3. Competitive threats and positioning
4. Gaming industry-specific opportunities 
5. Strategic recommendations for growth
6. Key narratives that resonate with gaming audiences

Provide detailed, evidence-based insights with high confidence where possible.
The client's website is ${project.clientWebsite || ''}. Please consider this when generating insights.`,
      debugMode: true
    };
    
    console.log(`🔄 Calling generate-insights-with-anthropic with project: ${project.id}`);
    console.log(`📡 Edge function request payload:`, {
      projectId: payload.projectId,
      documentCount: documents.length,
      contentSize,
      clientIndustry: payload.clientIndustry,
      clientWebsite: payload.clientWebsite,
      projectTitle: payload.projectTitle,
      debugMode: payload.debugMode
    });
    
    // Set timeout
    const timeout = 90000; // 90 seconds
    
    // Call the Edge Function with timeout
    // Fix the type for Promise.race by properly handling the response
    const responsePromise = supabase.functions.invoke('generate-insights-with-anthropic', {
      body: payload,
    });
    
    const response = await Promise.race([
      responsePromise,
      createTimeoutPromise(timeout)
    ]);
    
    console.log(`📡 Edge Function response received:`, {
      data: response?.data ? 'data present' : 'no data',
      error: response?.error || 'none'
    });
    
    if (response.error) {
      console.error('❌ Error from Edge Function:', response.error);
      
      // Check for insufficient content error
      if (response.error.message?.includes('insufficient') || 
          response.error.message?.includes('content too short') ||
          response.error.message?.includes('No documents provided')) {
        return {
          insights: [],
          error: 'Insufficient document content for analysis. Please upload more detailed documents.',
          insufficientContent: true
        };
      }
      
      // If error contains "Invalid URL" or "blob", it's likely a document extraction issue
      if (response.error.message?.includes('Invalid URL') || 
          response.error.message?.includes('blob') ||
          response.error.message?.includes('inaccessible')) {
        return {
          insights: mockApiResponse.insights,
          error: 'Document content extraction failed. Using generated sample insights instead. In production, please upload actual text content.',
          insufficientContent: false
        };
      }
      
      // Fall back to mock insights for any other errors
      return {
        insights: mockApiResponse.insights,
        error: `API Error: ${response.error.message || 'Unknown error'}. Using generated sample insights instead.`,
        insufficientContent: false
      };
    }
    
    // Check if we got valid insights
    if (response.data?.insights && response.data.insights.length > 0) {
      console.log(`✅ Received ${response.data.insights.length} insights from Claude`);
      
      // Make sure each insight has a valid category
      const typedInsights = response.data.insights.map((insight: any) => {
        // Ensure the category is a valid InsightCategory
        let category = insight.category;
        if (typeof category === 'string' && !Object.values(InsightCategory).includes(category as InsightCategory)) {
          // Default to a valid category if needed
          category = 'business_challenges' as InsightCategory;
        }
        
        return {
          ...insight,
          category,
          source: 'document'
        } as StrategicInsight;
      });
      
      return {
        insights: typedInsights
      };
    } else if (response.data?.error || response.data?.rawResponse) {
      console.error('❌ Claude failed to generate insights:', 
                  response.data?.error || response.data?.rawResponse?.substring(0, 100));
      
      // Check if it's an insufficient content error from Claude
      if (response.data?.rawResponse?.toLowerCase().includes('insufficient') ||
          response.data?.rawResponse?.toLowerCase().includes('too short') ||
          response.data?.rawResponse?.toLowerCase().includes('not enough information')) {
        return {
          insights: [],
          error: 'Insufficient document content for meaningful analysis. Please upload more detailed documents.',
          insufficientContent: true
        };
      }
      
      // If Claude couldn't access the content, use mocks
      return {
        insights: mockApiResponse.insights,
        error: 'Claude could not process document content. Using generated sample insights instead. In production, please upload actual text content.',
        insufficientContent: false
      };
    }
    
    // If we got here, there's some unexpected issue
    return {
      insights: mockApiResponse.insights,
      error: 'Unexpected API response format. Using generated sample insights instead.',
      insufficientContent: false
    };
  } catch (error) {
    console.error('❌ Error calling Claude API:', error);
    
    // Handle timeout errors specifically
    if ((error as Error).message?.includes('timed out')) {
      return {
        insights: mockApiResponse.insights,
        error: 'API request timed out. Using generated sample insights as fallback.',
        insufficientContent: false
      };
    }
    
    // For any other error, return mock data with error info
    return {
      insights: mockApiResponse.insights,
      error: `Error calling API: ${(error as Error).message}. Using generated sample insights instead.`,
      insufficientContent: false
    };
  }
};
