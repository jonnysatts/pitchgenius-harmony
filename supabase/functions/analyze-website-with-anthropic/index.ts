
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { fetchWebsiteContentWithFirecrawl } from "./utils/firecrawlFetcher.ts";
import { analyzeWebsiteWithAnthropic, verifyAnthropicApiKey } from "./services/anthropicService.ts";
import { parseClaudeResponse, processInsights, generateFallbackInsights } from "./utils/insightProcessor.ts";
import { corsHeaders } from "./utils/corsHandlers.ts";

// Execute the API call
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Verify the Anthropic API key is present before proceeding
    if (!verifyAnthropicApiKey()) {
      console.error("Missing or invalid ANTHROPIC_API_KEY");
      return new Response(
        JSON.stringify({
          error: "Claude API key not found or invalid. Please add it to your Supabase secrets.",
          insights: generateFallbackMockResponse("example.com", "Example Company", "Technology")
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const startTime = Date.now();
    console.log(`Website analysis started at ${new Date().toISOString()}`);
    
    // Parse the request body
    const requestData = await req.json();
    
    // Extract and validate fields
    const {
      clientWebsite,
      clientName = "Client",
      clientIndustry = "Technology",
      projectId,
      debugInfo = false
    } = requestData;
    
    // Validate input
    if (!clientWebsite) {
      console.error("Missing website URL in request");
      return new Response(
        JSON.stringify({ error: "Missing website URL in request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Analyzing website for ${clientName} (${clientIndustry}): ${clientWebsite}`);
    console.log(`Project ID: ${projectId}, Debug mode: ${debugInfo}`);
    
    // Start fetching the website content
    console.log(`Fetching content for ${clientWebsite}`);
    let websiteContent;
    
    try {
      // Try to fetch website content with Firecrawl first
      websiteContent = await fetchWebsiteContentWithFirecrawl(clientWebsite);
      console.log(`Fetched ${websiteContent.length} characters of content`);
      
      // If content is too short, return an error
      if (websiteContent.length < 200) {
        console.error("Website content too short for meaningful analysis");
        throw new Error("Could not fetch sufficient website content for analysis");
      }
    } catch (fetchError) {
      console.error("Error fetching website content:", fetchError);
      
      // Return fallback insights with the error
      return new Response(
        JSON.stringify({
          error: `Failed to fetch website content: ${fetchError.message}`,
          insights: generateFallbackMockResponse(clientWebsite, clientName, clientIndustry)
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Prepare the system prompt
    const systemPrompt = `You are a strategic analyst for a gaming agency, helping to identify opportunities for gaming partnerships and integrations. Your task is to analyze website content and identify strategic insights that would be valuable for a gaming company considering a potential partnership.`;
    
    // Call the Claude API to analyze the website content
    try {
      console.log("Calling Claude API to analyze website content");
      const analysisResult = await analyzeWebsiteWithAnthropic(
        websiteContent,
        systemPrompt,
        clientName,
        clientIndustry
      );
      
      console.log(`Claude API returned ${analysisResult.length} characters of analysis`);
      
      // Parse the Claude response to extract insights
      const rawInsights = parseClaudeResponse(analysisResult);
      console.log(`Parsed ${rawInsights.length} insights from Claude's response`);
      
      // Process the insights to ensure they are properly formatted
      const processedInsights = processInsights(rawInsights, clientWebsite, clientName);
      
      // Log completion time
      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;
      console.log(`Website analysis completed in ${processingTime.toFixed(2)} seconds`);
      
      // Return the insights
      return new Response(
        JSON.stringify({ insights: processedInsights }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (analysisError) {
      console.error("Error analyzing website content:", analysisError);
      
      // Generate fallback insights
      const fallbackInsights = generateFallbackInsights(clientWebsite, clientName, clientIndustry);
      
      // Return the fallback insights with the error
      return new Response(
        JSON.stringify({
          error: `Error calling Claude API: ${analysisError.message}`,
          insights: fallbackInsights
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unhandled error in website analysis:", error);
    
    // Return a generic error response
    return new Response(
      JSON.stringify({
        error: `Unhandled error in website analysis: ${error.message}`,
        insights: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Generate mock insights when all else fails
 */
function generateFallbackMockResponse(websiteUrl: string, clientName: string, clientIndustry: string) {
  console.log(`Generating emergency fallback mock insights for ${websiteUrl}`);
  
  return generateFallbackInsights(websiteUrl, clientName, clientIndustry);
}
