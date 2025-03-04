
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from './utils/corsHandlers.ts';
import { fetchWebsiteContent } from './utils/websiteFetcher.ts';
import { fetchFirecrawlContent } from './utils/firecrawlFetcher.ts';
import { parseClaudeResponse, processInsights, generateFallbackInsights } from './utils/insightParser.ts';
import { analyzeWebsiteWithAnthropic } from './services/anthropicService.ts';

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const websiteUrl = url.searchParams.get('website_url');
    const clientName = url.searchParams.get('client_name');
    const clientIndustry = url.searchParams.get('client_industry');
    const useFirecrawl = url.searchParams.get('use_firecrawl') === 'true';

    if (!websiteUrl) {
      console.error('Missing website_url parameter');
      
      // Return a proper error response with some fallback insights
      const fallbackInsights = generateFallbackInsights(
        "unknown", 
        clientName || "", 
        clientIndustry || "technology"
      );
      
      return new Response(JSON.stringify({ 
        error: 'Missing website_url parameter',
        data: fallbackInsights
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Analyzing website: ${websiteUrl}`);

    // Fetch website content
    let websiteContent = '';
    let fetchError = null;
    
    try {
      if (useFirecrawl) {
        websiteContent = await fetchFirecrawlContent(websiteUrl);
      } else {
        websiteContent = await fetchWebsiteContent(websiteUrl);
      }
    } catch (error) {
      fetchError = error;
      console.error('Error fetching website content:', error);
    }

    if (!websiteContent) {
      console.error('Failed to fetch website content');
      
      // Generate fallback insights when fetching fails
      const fallbackInsights = generateFallbackInsights(
        websiteUrl, 
        clientName || "", 
        clientIndustry || "technology"
      );
      
      return new Response(JSON.stringify({ 
        error: fetchError ? `Failed to fetch website content: ${fetchError.message}` : 'Failed to fetch website content',
        data: fallbackInsights
      }), {
        status: 200, // Return 200 with fallback data instead of 500
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyze website content with Anthropic
    let claudeResponse = '';
    let claudeError = null;
    
    try {
      // Get the system prompt
      const systemPrompt = "You are a strategic gaming audience specialist analyzing websites for Games Age, a gaming activation company that helps brands connect with gaming audiences through events, content, partnerships, and Fortress venues.";
      
      claudeResponse = await analyzeWebsiteWithAnthropic(
        websiteContent, 
        systemPrompt,
        clientName || '',
        clientIndustry || 'technology'
      );
    } catch (error) {
      claudeError = error;
      console.error('Claude analysis error:', error);
    }

    if (!claudeResponse) {
      console.error('Failed to analyze website content with Anthropic');
      
      // Generate fallback insights when Claude analysis fails
      const fallbackInsights = generateFallbackInsights(
        websiteUrl, 
        clientName || "", 
        clientIndustry || "technology"
      );
      
      return new Response(JSON.stringify({ 
        error: claudeError ? `Claude analysis failed: ${claudeError.message}` : 'Failed to analyze website content with Anthropic',
        data: fallbackInsights
      }), {
        status: 200, // Return 200 with fallback data instead of 500
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse Claude's response into structured insights
    let insights = parseClaudeResponse(claudeResponse);

    // If parsing returned no insights, generate fallbacks
    if (!insights || insights.length === 0) {
      console.warn('No insights parsed from Claude response, using fallbacks');
      insights = generateFallbackInsights(
        websiteUrl, 
        clientName || "", 
        clientIndustry || "technology"
      );
    }

    // Process insights to ensure they have all required fields
    insights = processInsights(insights, websiteUrl, clientName || '');

    // Return the insights as JSON
    return new Response(JSON.stringify({ data: insights }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error during website analysis:', error);
    
    // Generate fallback insights for any unhandled errors
    const fallbackInsights = generateFallbackInsights("unknown", "", "technology");
    
    return new Response(JSON.stringify({ 
      error: error.message, 
      data: fallbackInsights 
    }), {
      status: 200, // Return 200 with fallback data
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
