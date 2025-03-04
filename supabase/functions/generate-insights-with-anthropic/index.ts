
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
    const requestData = await req.json();
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
    
    console.log(`Processing analysis for project ${projectId} with ${documentContents.length} documents`);
    
    // Import required modules
    const { validateDocumentContent } = await import('./services/errorHandler.ts');
    const { generatePrompt } = await import('./services/promptGenerator.ts');
    const { callAnthropicAPI } = await import('./services/anthropicService.ts');
    const { parseClaudeResponse } = await import('./services/responseParser.ts');
    const { createErrorResponse } = await import('./services/errorHandler.ts');
    
    // Validate the request parameters
    if (!projectId) {
      throw new Error('Missing required parameter: projectId');
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
    
    // Generate the prompt for Claude
    const prompt = generatePrompt(
      documentContents,
      clientIndustry,
      clientWebsite,
      projectTitle,
      processingMode
    );
    
    // Call the Anthropic API
    console.log('Calling Anthropic API...');
    const claudeResponse = await callAnthropicAPI(prompt, systemPrompt || '');
    
    // Parse Claude's response
    console.log('Parsing Claude response...');
    const insights = parseClaudeResponse(claudeResponse);
    
    // Return the insights
    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in generate-insights-with-anthropic:', error);
    
    // Import error handling module using dynamic import
    const { createErrorResponse } = await import('./services/errorHandler.ts');
    return createErrorResponse(error);
  }
});
