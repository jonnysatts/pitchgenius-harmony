
import { Project, Document, StrategicInsight, InsightCategory } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { mockApiResponse } from './mockData';
import { createTimeoutPromise } from './utils/timeoutUtils';
import { processInsights } from './utils/insightProcessing';

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
      return handleApiError(response.error);
    }
    
    // Check if we got valid insights
    if (response.data?.insights && response.data.insights.length > 0) {
      console.log(`✅ Received ${response.data.insights.length} insights from Claude`);
      return {
        insights: processInsights(response.data.insights)
      };
    } else if (response.data?.error || response.data?.rawResponse) {
      return handleContentError(response.data);
    }
    
    // If we got here, there's some unexpected issue
    return {
      insights: processInsights(mockApiResponse.insights),
      error: 'Unexpected API response format. Using generated sample insights instead.',
      insufficientContent: false
    };
  } catch (error) {
    return handleCatchError(error);
  }
};

/**
 * Handle API errors and return appropriate fallback responses
 */
function handleApiError(error: any): { 
  insights: StrategicInsight[]; 
  error: string; 
  insufficientContent: boolean;
} {
  console.error('❌ Error from Edge Function:', error);
      
  // Check for insufficient content error
  if (error.message?.includes('insufficient') || 
      error.message?.includes('content too short') ||
      error.message?.includes('No documents provided')) {
    return {
      insights: [],
      error: 'Insufficient document content for analysis. Please upload more detailed documents.',
      insufficientContent: true
    };
  }
  
  // If error contains "Invalid URL" or "blob", it's likely a document extraction issue
  if (error.message?.includes('Invalid URL') || 
      error.message?.includes('blob') ||
      error.message?.includes('inaccessible')) {
    return {
      insights: processInsights(mockApiResponse.insights),
      error: 'Document content extraction failed. Using generated sample insights instead. In production, please upload actual text content.',
      insufficientContent: false
    };
  }
  
  // Fall back to mock insights for any other errors
  return {
    insights: processInsights(mockApiResponse.insights),
    error: `API Error: ${error.message || 'Unknown error'}. Using generated sample insights instead.`,
    insufficientContent: false
  };
}

/**
 * Handle errors with content processing
 */
function handleContentError(data: any): { 
  insights: StrategicInsight[]; 
  error: string; 
  insufficientContent: boolean;
} {
  console.error('❌ Claude failed to generate insights:', 
              data?.error || data?.rawResponse?.substring(0, 100));
  
  // Check if it's an insufficient content error from Claude
  if (data?.rawResponse?.toLowerCase().includes('insufficient') ||
      data?.rawResponse?.toLowerCase().includes('too short') ||
      data?.rawResponse?.toLowerCase().includes('not enough information')) {
    return {
      insights: [],
      error: 'Insufficient document content for meaningful analysis. Please upload more detailed documents.',
      insufficientContent: true
    };
  }
  
  // If Claude couldn't access the content, use mocks
  return {
    insights: processInsights(mockApiResponse.insights),
    error: 'Claude could not process document content. Using generated sample insights instead. In production, please upload actual text content.',
    insufficientContent: false
  };
}

/**
 * Handle caught exceptions
 */
function handleCatchError(error: any): { 
  insights: StrategicInsight[]; 
  error: string; 
  insufficientContent: boolean;
} {
  console.error('❌ Error calling Claude API:', error);
  
  // Handle timeout errors specifically
  if ((error as Error).message?.includes('timed out')) {
    return {
      insights: processInsights(mockApiResponse.insights),
      error: 'API request timed out. Using generated sample insights as fallback.',
      insufficientContent: false
    };
  }
  
  // For any other error, return mock data with error info
  return {
    insights: processInsights(mockApiResponse.insights),
    error: `Error calling API: ${(error as Error).message}. Using generated sample insights instead.`,
    insufficientContent: false
  };
}

// Re-export functions from utility modules for backward compatibility
export { createTimeoutPromise } from './utils/timeoutUtils';
export { checkSupabaseConnection } from './utils/supabaseUtils';
export { generateWebsiteContext } from './utils/websiteUtils';
