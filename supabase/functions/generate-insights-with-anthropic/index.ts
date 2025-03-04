
/**
 * Edge Function for generating strategic insights using Anthropic's Claude AI
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

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
    console.log('Generate insights function received request');
    
    // Parse the request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (jsonError) {
      console.error('Failed to parse request JSON:', jsonError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          insights: [] 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { 
      projectId, 
      documentIds, 
      documentContents = [],
      clientIndustry = 'technology',
      clientWebsite = '',
      projectTitle = '',
      processingMode = 'comprehensive',
      systemPrompt = ''
    } = requestData;
    
    console.log(`Processing analysis for project ${projectId} with ${documentContents.length} documents in ${clientIndustry} industry`);
    
    // Import required modules
    const { validateDocumentContent } = await import('./services/errorHandler.ts');
    const { generatePrompt, generateSystemPrompt } = await import('./services/promptGenerator.ts');
    const { callAnthropicAPI } = await import('./services/anthropicService.ts');
    const { parseClaudeResponse } = await import('./services/responseParser.ts');
    const { createErrorResponse } = await import('./services/errorHandler.ts');
    
    // Validate the request parameters
    if (!projectId) {
      console.error('Missing required parameter: projectId');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameter: projectId',
          insights: [] 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Validate document content
    const contentValidation = validateDocumentContent(documentContents);
    if (!contentValidation.valid) {
      console.log('Document content validation failed:', contentValidation.message);
      return new Response(
        JSON.stringify({ 
          error: contentValidation.message,
          insufficientContent: true,
          insights: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Log content length for debugging
    console.log(`Total content length: ${contentValidation.contentLength || 'unknown'} characters`);
    
    // Generate the prompts for Claude
    const userPrompt = generatePrompt(
      documentContents,
      clientIndustry,
      clientWebsite,
      projectTitle,
      processingMode
    );
    
    const finalSystemPrompt = systemPrompt || generateSystemPrompt(
      clientIndustry,
      projectTitle
    );
    
    // Call the Anthropic API with proper timeout
    console.log('Calling Anthropic API...');
    const startTime = Date.now();
    
    const claudeResponse = await callAnthropicAPI(userPrompt, finalSystemPrompt, {
      timeoutMs: 90000, // 90 second timeout
      temperature: 0.3,  // Lower temperature for more focused responses
      maxTokens: 4000    // Reasonable token limit for insights
    });
    
    const endTime = Date.now();
    console.log(`Claude API call completed in ${(endTime - startTime) / 1000} seconds`);
    
    // Parse Claude's response
    console.log('Parsing Claude response...');
    const insights = parseClaudeResponse(claudeResponse);
    
    if (!insights || insights.length === 0) {
      console.warn('No insights extracted from Claude response');
      return new Response(
        JSON.stringify({ 
          error: 'Failed to extract insights from Claude response',
          rawResponse: claudeResponse.substring(0, 1000) + '...',
          insights: []
        }),
        { 
          status: 422, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Successfully extracted ${insights.length} insights from Claude response`);
    
    // Return the insights
    return new Response(
      JSON.stringify({ 
        insights,
        count: insights.length,
        processingTimeMs: endTime - startTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in generate-insights-with-anthropic:', error);
    
    // Import error handling module using dynamic import
    try {
      const { createErrorResponse } = await import('./services/errorHandler.ts');
      return createErrorResponse(error);
    } catch (importError) {
      // If even the error handler can't be imported, return a basic error response
      console.error('Failed to import error handler:', importError);
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : 'Unknown error processing insights',
          insights: [] 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  }
});
