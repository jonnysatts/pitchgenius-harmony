
/**
 * Request handling service for website analysis
 */
import { WebsiteAnalysisParams } from '../types/websiteAnalysisTypes.ts';
import { corsHeaders } from '../utils/corsHandlers.ts';
import { fetchWebsiteContent } from '../services/websiteContentService.ts';
import { analyzeWebsiteWithAnthropic } from '../services/anthropicService.ts';
import { parseClaudeResponse, processInsights } from '../utils/insightParser.ts';
import { createErrorResponse } from '../services/errorHandler.ts';
import { generateFallbackInsights } from '../utils/defaultContentGenerators.ts';

/**
 * Handle the main website analysis request
 */
export async function handleWebsiteAnalysisRequest(req: Request): Promise<Response> {
  try {
    // Parse request parameters from body
    const requestParams: WebsiteAnalysisParams = await req.json();
    const {
      website_url: websiteUrl,
      client_name: clientName = '',
      client_industry: clientIndustry = 'technology',
      use_firecrawl: useFirecrawl = false,
      system_prompt: customSystemPrompt
    } = requestParams;

    console.log(`Analyzing website: ${websiteUrl}`);
    console.log(`Client: ${clientName}, Industry: ${clientIndustry}, Using Firecrawl: ${useFirecrawl}`);

    // Validate request parameters
    if (!websiteUrl) {
      console.error('Missing website_url parameter');
      
      // Return a proper error response with fallback insights
      const fallbackInsights = generateFallbackInsights(
        "unknown", 
        clientName, 
        clientIndustry
      );
      
      return new Response(JSON.stringify({ 
        error: 'Missing website_url parameter',
        data: fallbackInsights
      }), {
        status: 200, // Return 200 with fallback data
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch website content
    let websiteContent = '';
    let fetchError = null;
    
    try {
      websiteContent = await fetchWebsiteContent(websiteUrl, useFirecrawl);
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
      claudeResponse = await analyzeWebsiteWithAnthropic(
        websiteContent, 
        systemPrompt,
        clientName,
        clientIndustry
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
    let insights = parseClaudeResponse(claudeResponse);

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
}
