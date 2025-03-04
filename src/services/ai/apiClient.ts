
/**
 * Call the Supabase Edge Function that uses Anthropic API
 */
export const callClaudeApi = async (
  project: Project,
  documents: Document[],
  documentContents: any[]
): Promise<{ insights: StrategicInsight[], error?: string, insufficientContent?: boolean }> => {
  console.log('Making API call to Supabase Edge Function for Claude analysis...');
  
  // Prepare document IDs and website context
  const documentIds = documents.map(doc => doc.id);
  const websiteContext = project.clientWebsite ? generateWebsiteContext(project.clientWebsite) : '';
  
  try {
    // Call the proper edge function
    console.log("Calling generate-insights-with-anthropic with project:", project.id);
    const { data, error } = await supabase.functions.invoke('generate-insights-with-anthropic', {
      body: { 
        projectId: project.id, 
        documentIds,
        clientIndustry: project.clientIndustry || 'technology',
        clientWebsite: project.clientWebsite,
        projectTitle: project.title,
        documentContents,
        processingMode: 'comprehensive',
        includeComprehensiveDetails: true,
        maximumResponseTime: 110,
        systemPrompt: GAMING_SPECIALIST_PROMPT + websiteContext
      }
    });
    
    console.log("Edge Function response received:", data ? "data present" : "no data", error ? `error: ${error.message}` : "no error");
    
    if (error) {
      console.error('Error from Edge Function:', error);
      throw new Error(`Edge Function error: ${error.message || 'Unknown error'}`);
    }
    
    // Check for insufficient content flag
    if (data && data.insufficientContent === true) {
      console.log('Claude AI reported insufficient document content for meaningful insights');
      return {
        insights: [],
        insufficientContent: true,
        error: "Not enough information in documents to generate meaningful insights. Consider uploading more detailed documents or try website analysis."
      };
    }
    
    // Validate insights from API
    if (!data || !data.insights || data.insights.length === 0) {
      throw new Error('No insights returned from Claude AI');
    }
    
    // Add source marker to insights
    const markedInsights = data.insights.map((insight: StrategicInsight) => {
      return {
        ...insight,
        source: 'document' as 'document'
      };
    });
    
    console.log('Successfully received insights from Anthropic:', markedInsights.length);
    
    return { 
      insights: markedInsights,
      error: undefined,
      insufficientContent: false
    };
  } catch (apiError: any) {
    console.error('Error calling Anthropic API:', apiError);
    throw new Error(`Claude AI error: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
  }
};
