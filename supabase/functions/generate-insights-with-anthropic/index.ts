
/**
 * Edge Function for generating strategic insights using Anthropic's Claude AI
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Enable debug mode for detailed logging
const DEBUG_MODE = true;

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
    if (DEBUG_MODE) console.log('🔍 Generate insights function received request');
    
    // Parse the request body
    let requestData;
    try {
      requestData = await req.json();
      if (DEBUG_MODE) {
        console.log('📄 Request data received:', JSON.stringify({
          projectId: requestData.projectId,
          documentCount: requestData.documentContents?.length || 0,
          contentChars: requestData.documentContents?.reduce((acc, doc) => acc + (doc.content?.length || 0), 0) || 0,
          clientIndustry: requestData.clientIndustry,
          clientWebsite: requestData.clientWebsite ? (requestData.clientWebsite.substring(0, 30) + '...') : 'none',
          systemPromptLength: requestData.systemPrompt?.length || 0
        }));
      }
    } catch (jsonError) {
      console.error('❌ Failed to parse request JSON:', jsonError);
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
    
    if (DEBUG_MODE) {
      console.log(`🔄 Processing analysis for project ${projectId} with ${documentContents.length} documents in ${clientIndustry} industry`);
    }
    
    // Import required modules
    const { validateDocumentContent } = await import('./services/errorHandler.ts');
    const { generatePrompt, generateSystemPrompt } = await import('./services/promptGenerator.ts');
    const { callAnthropicAPI } = await import('./services/anthropicService.ts');
    const { parseClaudeResponse } = await import('./services/responseParser.ts');
    const { createErrorResponse } = await import('./services/errorHandler.ts');
    
    // Validate the request parameters
    if (!projectId) {
      console.error('❌ Missing required parameter: projectId');
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
      if (DEBUG_MODE) {
        console.log('❌ Document content validation failed:', contentValidation.message);
        console.log('📄 Content validation details:', JSON.stringify(contentValidation));
      }
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
    if (DEBUG_MODE) {
      console.log(`📊 Total content length: ${contentValidation.contentLength || 'unknown'} characters`);
    }
    
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
    
    if (DEBUG_MODE) {
      console.log('📝 Generated prompts:');
      console.log(`  System prompt length: ${finalSystemPrompt.length} chars`);
      console.log(`  User prompt length: ${userPrompt.length} chars`);
      console.log(`  System prompt preview: ${finalSystemPrompt.substring(0, 100)}...`);
      console.log(`  User prompt preview: ${userPrompt.substring(0, 100)}...`);
    }
    
    // Call the Anthropic API with proper timeout
    if (DEBUG_MODE) console.log('🔄 Calling Anthropic API...');
    const startTime = Date.now();
    
    try {
      const claudeResponse = await callAnthropicAPI(userPrompt, finalSystemPrompt, {
        timeoutMs: 90000, // 90 second timeout
        temperature: 0.3,  // Lower temperature for more focused responses
        maxTokens: 4000    // Reasonable token limit for insights
      });
      
      const endTime = Date.now();
      if (DEBUG_MODE) {
        console.log(`✅ Claude API call completed in ${(endTime - startTime) / 1000} seconds`);
        console.log(`📄 Response length: ${claudeResponse.length} chars`);
        console.log(`📄 Response preview: ${claudeResponse.substring(0, 150)}...`);
      }
      
      // Parse Claude's response
      if (DEBUG_MODE) console.log('🔄 Parsing Claude response...');
      const insights = parseClaudeResponse(claudeResponse);
      
      if (!insights || insights.length === 0) {
        console.warn('⚠️ No insights extracted from Claude response');
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
      
      if (DEBUG_MODE) console.log(`✅ Successfully extracted ${insights.length} insights from Claude response`);
      
      // Return the insights
      return new Response(
        JSON.stringify({ 
          insights,
          count: insights.length,
          processingTimeMs: endTime - startTime
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      const endTime = Date.now();
      console.error('❌ Error calling Anthropic API:', apiError);
      console.error('⏱️ Failed after', (endTime - startTime) / 1000, 'seconds');
      
      if (DEBUG_MODE && apiError instanceof Error) {
        console.error('❌ Error details:', {
          name: apiError.name,
          message: apiError.message,
          stack: apiError.stack
        });
      }
      
      return new Response(
        JSON.stringify({ 
          error: apiError instanceof Error ? apiError.message : String(apiError),
          errorType: apiError instanceof Error ? apiError.name : 'Unknown',
          insights: [] 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('❌ Error in generate-insights-with-anthropic:', error);
    
    // Import error handling module using dynamic import
    try {
      const { createErrorResponse } = await import('./services/errorHandler.ts');
      return createErrorResponse(error);
    } catch (importError) {
      // If even the error handler can't be imported, return a basic error response
      console.error('❌ Failed to import error handler:', importError);
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
