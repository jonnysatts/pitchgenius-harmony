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

You're an expert in gaming industry trends, audience analysis, competitive positioning, and gaming opportunities for businesses.`;

    // Build the user prompt
    let userPrompt = "";
    
    if (conversationContext) {
      userPrompt = `Here's our conversation so far about refining this insight:
${conversationContext}

CURRENT INSIGHT CONTENT:
${insightContent}

USER'S LATEST QUESTION/REQUEST:
${prompt}`;
    } else {
      userPrompt = prompt;
    }
    
    // Call the Anthropic API (using the shared service from generate-insights-with-anthropic)
    const response = await callAnthropicAPI(userPrompt, systemPrompt, {
      temperature: 0.7,
      maxTokens: 1000
    });
    
    // Process the insight content to extract refinement suggestions
    const refinedContent = extractRefinedContent(response, insightContent);
    
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
 * Extract refined content from the AI response
 */
function extractRefinedContent(response: string, originalContent: string): string | null {
  // Look for sections indicating proposed content
  const contentMarkers = [
    "Here's the refined insight:",
    "Here's my suggestion:",
    "Refined version:",
    "Here's a revised version:",
    "Updated insight:"
  ];
  
  // Try to find any of the markers in the response
  for (const marker of contentMarkers) {
    if (response.includes(marker)) {
      const parts = response.split(marker);
      if (parts.length > 1) {
        // Extract the content after the marker
        let extracted = parts[1].trim();
        
        // If there's another section after, trim to that
        const endMarkers = ["Is this helpful?", "Does this work for you?", "What do you think?"];
        for (const endMarker of endMarkers) {
          if (extracted.includes(endMarker)) {
            extracted = extracted.split(endMarker)[0].trim();
          }
        }
        
        return extracted;
      }
    }
  }
  
  // If we can't find any markers, try to use regex to find quoted blocks
  const quotedBlockRegex = /```([\s\S]*?)```/;
  const quotedMatch = response.match(quotedBlockRegex);
  if (quotedMatch && quotedMatch[1]) {
    return quotedMatch[1].trim();
  }
  
  // If all else fails, return null to keep the original content
  return null;
}
