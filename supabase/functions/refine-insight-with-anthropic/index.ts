
/**
 * Edge Function for refining insights using Anthropic's Claude API
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { callAnthropicAPI } from '../generate-insights-with-anthropic/services/anthropicService.ts';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { prompt, insightTitle, insightContent, conversationContext } = await req.json();
    
    console.log(`Refining insight: "${insightTitle}"`);
    
    // Generate a system prompt specifically for insight refinement
    const systemPrompt = `You are an expert strategic consultant from Games Age, a gaming consultancy that helps businesses integrate gaming into their strategy. 
Your job is to help refine strategic insights about gaming and make them more impactful, specific, and actionable.

When refining insights:
- Maintain the original intent but make it more valuable
- Add concrete examples and data points when relevant
- Make recommendations specific and actionable
- Keep the tone professional but conversational
- Provide clear rationale for your suggested changes
- Always maintain the structured format with title, summary, details, evidence, impact, and recommendations

Your analysis should be structured and maintain the original insight format. When you suggest changes, make sure to include the complete structured content in your response.

You're an expert in gaming industry trends, audience analysis, competitive positioning, and gaming opportunities for businesses.`;

    // Build the user prompt with instructions to maintain structure
    let userPrompt = "";
    
    if (conversationContext) {
      userPrompt = `Here's our conversation so far about refining this insight:
${conversationContext}

CURRENT INSIGHT CONTENT:
Title: ${insightContent.title || ""}
Summary: ${insightContent.summary || ""}
Details: ${insightContent.details || ""}
Evidence: ${insightContent.evidence || ""}
Impact: ${insightContent.impact || ""}
Recommendations: ${insightContent.recommendations || ""}

USER'S LATEST QUESTION/REQUEST:
${prompt}

Please respond to the request and if appropriate, suggest an updated version with all sections preserved.`;
    } else {
      userPrompt = `I need to refine the following insight about "${insightTitle}":

CURRENT INSIGHT CONTENT:
Title: ${insightContent.title || ""}
Summary: ${insightContent.summary || ""}
Details: ${insightContent.details || ""}
Evidence: ${insightContent.evidence || ""}
Impact: ${insightContent.impact || ""}
Recommendations: ${insightContent.recommendations || ""}

USER REQUEST:
${prompt}

Please help me improve this insight. First, respond to my request with helpful advice.
Then, provide a complete refined version with all sections (title, summary, details, evidence, impact, and recommendations) preserved.`;
    }
    
    console.log("Sending prompt to Claude API");
    
    // Call the Anthropic API (using the shared service from generate-insights-with-anthropic)
    const response = await callAnthropicAPI(userPrompt, systemPrompt, {
      temperature: 0.7,
      maxTokens: 1500
    });
    
    console.log("Received response from Claude API");
    
    // Process the insight content to extract refinement suggestions
    const refinedContent = extractStructuredContent(response, insightContent);
    
    // Return the response
    return new Response(
      JSON.stringify({ 
        response: response,
        refinedContent: refinedContent || insightContent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in refine-insight-with-anthropic:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        response: "I'm having trouble connecting to the AI service. You can continue editing the insight manually, or try again in a moment."
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Extract structured content from the AI response
 */
function extractStructuredContent(response: string, originalContent: Record<string, any>): Record<string, any> | null {
  // Create a copy of the original content
  const result = { ...originalContent };
  
  // Try to extract title
  const titleMatch = response.match(/Title:(.+?)(?=Summary:|$)/s);
  if (titleMatch && titleMatch[1].trim()) {
    result.title = titleMatch[1].trim();
  }
  
  // Try to extract summary
  const summaryMatch = response.match(/Summary:(.+?)(?=Details:|$)/s);
  if (summaryMatch && summaryMatch[1].trim()) {
    result.summary = summaryMatch[1].trim();
  }
  
  // Try to extract details
  const detailsMatch = response.match(/Details:(.+?)(?=Evidence:|Supporting Evidence:|$)/s);
  if (detailsMatch && detailsMatch[1].trim()) {
    result.details = detailsMatch[1].trim();
  }
  
  // Try to extract evidence - handle both "Evidence:" and "Supporting Evidence:" labels
  const evidenceMatch = response.match(/(?:Evidence|Supporting Evidence):(.+?)(?=Impact:|Business Impact:|$)/s);
  if (evidenceMatch && evidenceMatch[1].trim()) {
    result.evidence = evidenceMatch[1].trim();
  }
  
  // Try to extract impact - handle both "Impact:" and "Business Impact:" labels
  const impactMatch = response.match(/(?:Impact|Business Impact):(.+?)(?=Recommendations:|Strategic Recommendations:|$)/s);
  if (impactMatch && impactMatch[1].trim()) {
    result.impact = impactMatch[1].trim();
  }
  
  // Try to extract recommendations - handle both "Recommendations:" and "Strategic Recommendations:" labels
  const recommendationsMatch = response.match(/(?:Recommendations|Strategic Recommendations):(.+?)$/s);
  if (recommendationsMatch && recommendationsMatch[1].trim()) {
    result.recommendations = recommendationsMatch[1].trim();
  }
  
  // Check if we made any changes
  const hasChanges = Object.keys(result).some(key => 
    result[key] !== originalContent[key]
  );
  
  return hasChanges ? result : null;
}
