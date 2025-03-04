import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from './utils/corsHandlers.ts';
import { fetchWebsiteContent } from './utils/websiteFetcher.ts';
import { fetchFirecrawlContent } from './utils/firecrawlFetcher.ts';
import { parseClaudeResponse, processInsights } from './utils/insightParser.ts';
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
      return new Response(JSON.stringify({ error: 'Missing website_url parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Analyzing website: ${websiteUrl}`);

    // Fetch website content
    let websiteContent = '';
    if (useFirecrawl) {
      websiteContent = await fetchFirecrawlContent(websiteUrl);
    } else {
      websiteContent = await fetchWebsiteContent(websiteUrl);
    }

    if (!websiteContent) {
      console.error('Failed to fetch website content');
      return new Response(JSON.stringify({ error: 'Failed to fetch website content' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyze website content with Anthropic
    const claudeResponse = await analyzeWebsiteWithAnthropic(websiteContent);

    if (!claudeResponse) {
      console.error('Failed to analyze website content with Anthropic');
      return new Response(JSON.stringify({ error: 'Failed to analyze website content with Anthropic' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse Claude's response into structured insights
    let insights = parseClaudeResponse(claudeResponse);

    // Process insights to ensure they have all required fields
    insights = processInsights(insights, websiteUrl, clientName || '');

    // Return the insights as JSON
    return new Response(JSON.stringify({ data: insights }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error during website analysis:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
