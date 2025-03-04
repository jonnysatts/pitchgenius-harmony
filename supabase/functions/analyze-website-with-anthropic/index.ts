
// Main entry point for website analysis using Claude/Anthropic
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsPreflightRequest } from './utils/corsHandlers.ts';
import { fetchWebsiteContentBasic } from './utils/websiteFetcher.ts';
import { fetchWebsiteContentWithFirecrawl } from './utils/firecrawlFetcher.ts';
import { analyzeWebsiteWithAnthropic } from './services/anthropicService.ts';
import { parseClaudeResponse, processInsights } from './utils/insightProcessor.ts';

// Define the supported website insight categories
const websiteInsightCategories = [
  'company_positioning',
  'competitive_landscape',
  'key_partnerships',
  'public_announcements',
  'consumer_engagement',
  'product_service_fit'
];

// Handle CORS for preflight requests
serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;
  
  try {
    console.log('Website analysis Edge Function starting...');
    
    // Parse the request body
    const requestData = await req.json();
    console.log('Request data received:', {
      projectId: requestData.projectId,
      clientIndustry: requestData.clientIndustry,
      clientWebsite: requestData.clientWebsite,
      hasWebsiteContent: !!requestData.websiteContent
    });
    
    const { 
      projectId, 
      clientIndustry, 
      clientWebsite, 
      websiteContent,
      systemPrompt,
      projectTitle,
      clientName
    } = requestData;
    
    // Check we have the minimum required data
    if (!projectId || !clientWebsite) {
      console.error('Missing required fields in request');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Analyzing website for project ${projectId}: ${clientWebsite}`);
    
    // Print current environment variables (securely)
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY') || Deno.env.get('FIRECRAWL_API_KPI');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    console.log(`Environment check: Firecrawl API Key exists: ${!!firecrawlKey}, Anthropic API Key exists: ${!!anthropicKey}`);
    
    // Try to use provided content first, otherwise fetch it
    let contentToAnalyze = websiteContent;
    if (!contentToAnalyze || contentToAnalyze.includes("placeholder for actual website content")) {
      console.log("No valid content provided, attempting to fetch website content");
      
      try {
        // First try using Firecrawl for enhanced scraping
        console.log("Attempting to fetch content with Firecrawl...");
        contentToAnalyze = await fetchWebsiteContentWithFirecrawl(clientWebsite);
        console.log(`Firecrawl returned ${contentToAnalyze.length} characters of content`);
      } catch (fetchError) {
        console.error("Error with Firecrawl, falling back to basic fetch:", fetchError);
        contentToAnalyze = await fetchWebsiteContentBasic(clientWebsite);
        console.log(`Basic fetch returned ${contentToAnalyze.length} characters of content`);
      }
    }
    
    if (!contentToAnalyze || contentToAnalyze.length < 100) {
      console.error("Failed to fetch sufficient website content");
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch website content or content too short',
          content: contentToAnalyze
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Call Claude to analyze the content
    console.log("Calling Claude API to analyze content...");
    const claudeResponse = await analyzeWebsiteWithAnthropic(
      contentToAnalyze,
      systemPrompt || "You are a strategic analyst helping a gaming agency identify opportunities for gaming partnerships and integrations.",
      clientName || "the client",
      clientIndustry || "general"
    );
    
    console.log(`Claude API response received (${claudeResponse.length} chars)`);
    
    // Process the response to extract insights
    let insights;
    try {
      console.log("Parsing Claude response into insights...");
      insights = parseClaudeResponse(claudeResponse);
      console.log(`Parsed ${insights.length} insights from Claude response`);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse Claude response', 
          rawResponse: claudeResponse.substring(0, 1000) + "..." // Truncate for readability
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if we got valid insights
    if (!insights || !Array.isArray(insights) || insights.length === 0) {
      console.error('No valid insights generated from Claude response');
      return new Response(
        JSON.stringify({ 
          error: 'No valid insights generated', 
          rawResponse: claudeResponse.substring(0, 1000) + "..." // Truncate for readability
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Log insights categories for debugging
    console.log('Generated insight categories:', insights.map(i => i.category));
    
    // Process insights to ensure they have all required fields
    const processedInsights = processInsights(insights);
    console.log(`Processed ${processedInsights.length} insights, sending response`);
    
    // Return the insights
    return new Response(
      JSON.stringify({ insights: processedInsights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in analyze-website-with-anthropic:', error);
    
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
