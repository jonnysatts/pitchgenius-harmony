
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create preflight response for CORS
function createCorsPreflightResponse() {
  return new Response(null, {
    headers: corsHeaders,
  });
}

serve(async (req) => {
  console.log('Website analysis edge function received request');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return createCorsPreflightResponse();
  }

  try {
    // Parse request parameters from body
    const requestData = await req.json();
    const {
      website_url: websiteUrl,
      client_name: clientName = '',
      client_industry: clientIndustry = 'technology',
      use_firecrawl: useFirecrawl = false,
      system_prompt: customSystemPrompt
    } = requestData;

    console.log(`Analyzing website: ${websiteUrl}`);
    console.log(`Client: ${clientName}, Industry: ${clientIndustry}, Using Firecrawl: ${useFirecrawl}`);

    // Check for required parameters
    if (!websiteUrl) {
      console.error('Missing website_url parameter');
      return new Response(JSON.stringify({ 
        error: 'Missing website_url parameter',
        data: [] // Empty array since no analysis was performed
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Import required modules
    const { fetchWebsiteContent } = await import('./services/websiteContentService.ts');
    const { analyzeWebsiteWithAnthropic } = await import('./services/anthropicService.ts');
    const { parseClaudeResponse, processInsights } = await import('./utils/insightParser.ts');
    const { generateFallbackInsights } = await import('./utils/defaultContentGenerators.ts');

    // Fetch website content
    let websiteContent = '';
    let fetchError = null;
    
    try {
      console.log(`Fetching content for: ${websiteUrl}`);
      websiteContent = await fetchWebsiteContent(websiteUrl, useFirecrawl);
      console.log(`Content fetched successfully, length: ${websiteContent.length} characters`);
    } catch (error) {
      fetchError = error;
      console.error('Error fetching website content:', error);
    }

    if (!websiteContent) {
      console.error('Failed to fetch website content');
      
      // Generate fallback insights when fetching fails
      const fallbackInsights = generateFallbackInsights(
        websiteUrl, 
        clientName, 
        clientIndustry
      );
      
      return new Response(JSON.stringify({ 
        error: fetchError ? `Failed to fetch website content: ${fetchError.message}` : 'Failed to fetch website content',
        data: fallbackInsights
      }), {
        status: 200, // Return 200 with fallback data
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default system prompt if none provided
    const systemPrompt = customSystemPrompt || 
      "You are a strategic gaming audience specialist analyzing websites for Games Age, a gaming activation company that helps brands connect with gaming audiences through events, content, partnerships, and Fortress venues.";

    // Analyze website content with Anthropic
    let claudeResponse = '';
    let claudeError = null;
    
    try {
      console.log('Calling Anthropic API for website analysis...');
      claudeResponse = await analyzeWebsiteWithAnthropic(
        websiteContent, 
        systemPrompt,
        clientName,
        clientIndustry
      );
      console.log('Claude analysis complete');
    } catch (error) {
      claudeError = error;
      console.error('Claude analysis error:', error);
    }

    if (!claudeResponse) {
      console.error('Failed to analyze website content with Anthropic');
      
      // Generate fallback insights when Claude analysis fails
      const fallbackInsights = generateFallbackInsights(
        websiteUrl, 
        clientName, 
        clientIndustry
      );
      
      return new Response(JSON.stringify({ 
        error: claudeError ? `Claude analysis failed: ${claudeError.message}` : 'Failed to analyze website content with Anthropic',
        data: fallbackInsights
      }), {
        status: 200, // Return 200 with fallback data
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse Claude's response into structured insights
    console.log('Parsing Claude response...');
    let insights = parseClaudeResponse(claudeResponse);
    console.log(`Parsed ${insights.length} insights from Claude response`);

    // If parsing returned no insights, generate fallbacks
    if (!insights || insights.length === 0) {
      console.warn('No insights parsed from Claude response, using fallbacks');
      insights = generateFallbackInsights(
        websiteUrl, 
        clientName, 
        clientIndustry
      );
    }

    // Process insights to ensure they have all required fields
    insights = processInsights(insights, websiteUrl, clientName);
    console.log(`Returning ${insights.length} processed insights`);

    // Return the insights as JSON
    return new Response(JSON.stringify({ data: insights }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unhandled error during website analysis:', error);
    
    // Generate fallback insights for any unhandled errors
    const { generateFallbackInsights } = await import('./utils/defaultContentGenerators.ts');
    const fallbackInsights = generateFallbackInsights("unknown", "", "technology");
    
    return new Response(JSON.stringify({ 
      error: `Edge function error: ${error.message}`, 
      data: fallbackInsights 
    }), {
      status: 200, // Return 200 with fallback data
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
