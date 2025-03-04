
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, createCorsPreflightResponse } from "./utils/corsUtils.ts";
import { formatDocumentSummaries, generateSystemPrompt, generateUserPrompt } from "./services/promptGenerator.ts";
import { callAnthropicAPI, verifyAnthropicApiKey } from "./services/anthropicService.ts";
import { parseClaudeResponse, processInsights } from "./services/responseParser.ts";
import { createErrorResponse, handleApiResponseError } from "./services/errorHandler.ts";
import { AnthropicRequestParams } from "./types/anthropicTypes.ts";

// Main handler function
serve(async (req) => {
  console.log("Edge function received request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return createCorsPreflightResponse();
  }
  
  try {
    // 1. Extract request parameters
    const requestParams: AnthropicRequestParams = await req.json();
    const { 
      projectId, 
      documentContents, 
      clientIndustry = 'technology', 
      projectTitle = 'Project Analysis',
      maximumResponseTime = 110,
      systemPrompt: customSystemPrompt
    } = requestParams;
    
    console.log(`Processing project ${projectId} with ${documentContents?.length || 0} documents`);
    console.log(`Industry: ${clientIndustry}, Project: ${projectTitle}`);
    
    // 2. Validate inputs
    if (!documentContents || documentContents.length === 0) {
      console.error("No document contents provided");
      return createErrorResponse(
        "No document contents provided", 
        corsHeaders, 
        400
      );
    }
    
    // 3. Verify API key
    if (!verifyAnthropicApiKey()) {
      console.error("ANTHROPIC_API_KEY not found in environment variables");
      return createErrorResponse(
        "Anthropic API key not configured", 
        corsHeaders, 
        500
      );
    }
    
    // 4. Prepare prompts
    const documentSummaries = formatDocumentSummaries(documentContents);
    console.log("Prepared document summaries for Claude");
    console.log(`Total documents being analyzed: ${documentContents.length}`);
    
    // Create system prompt (use custom if provided)
    const defaultSystemPrompt = generateSystemPrompt(
      clientIndustry,
      projectTitle,
      maximumResponseTime
    );
    
    const finalSystemPrompt = customSystemPrompt || defaultSystemPrompt;
    
    // Create user prompt with document content
    const userPrompt = generateUserPrompt(documentSummaries, documentContents.length);
    
    // 5. Call Anthropic API
    let response;
    try {
      response = await callAnthropicAPI(finalSystemPrompt, userPrompt);
      
      if (!response.ok) {
        await handleApiResponseError(response);
      }
    } catch (apiError) {
      return createErrorResponse(
        apiError, 
        corsHeaders, 
        500, 
        { details: "Error calling Anthropic API" }
      );
    }
    
    // 6. Process the response
    const anthropicData = await response.json();
    const messageContent = anthropicData.content?.[0]?.text || "";
    
    if (!messageContent) {
      return createErrorResponse(
        "Empty response from Anthropic API", 
        corsHeaders, 
        500
      );
    }
    
    // 7. Parse insights from Claude's response
    let insightsData;
    try {
      insightsData = parseClaudeResponse(messageContent);
    } catch (parseError) {
      return createErrorResponse(
        parseError, 
        corsHeaders, 
        500, 
        { 
          details: "Failed to parse AI-generated insights",
          rawResponse: messageContent.substring(0, 500) + "..." 
        }
      );
    }
    
    // 8. Process and return insights
    const insights = insightsData.insights || [];
    const finalInsights = processInsights(insights);
    
    console.log(`Successfully extracted ${finalInsights.length} insights`);
    
    return new Response(
      JSON.stringify({ insights: finalInsights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    return createErrorResponse(
      "An unexpected error occurred", 
      corsHeaders, 
      500, 
      { details: error.message }
    );
  }
});
