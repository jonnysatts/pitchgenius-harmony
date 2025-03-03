
// Main entry point for website analysis using Claude/Anthropic
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsPreflightRequest } from './utils/corsHandlers.ts';
import { fetchWebsiteContentBasic } from './utils/websiteFetcher.ts';
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
    // Parse the request body
    const requestData = await req.json();
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
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Analyzing website for project ${projectId}: ${clientWebsite}\n`);
    
    // Fetch actual website content using basic fetch
    let contentToAnalyze = websiteContent;
    if (!contentToAnalyze || contentToAnalyze.includes("placeholder for actual website content")) {
      console.log("No valid content provided, attempting to fetch website content with basic fetch");
      contentToAnalyze = await fetchWebsiteContentBasic(clientWebsite);
    }
    
    // Call Claude to analyze the content
    const claudeResponse = await analyzeWebsiteWithAnthropic(
      contentToAnalyze,
      systemPrompt || "You are a strategic analyst helping a gaming agency identify opportunities for gaming partnerships and integrations.",
      clientName || "the client",
      clientIndustry || "general"
    );
    
    // Process the response to extract insights
    let insights;
    try {
      insights = parseClaudeResponse(claudeResponse);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse Claude response', 
          rawResponse: claudeResponse
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if we got valid insights
    if (!insights || !Array.isArray(insights) || insights.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No valid insights generated', 
          rawResponse: claudeResponse 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Log insights categories for debugging
    console.log('Generated insight categories:', insights.map(i => i.category));
    
    // Process insights to ensure they have all required fields
    const processedInsights = processInsights(insights);
    
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
