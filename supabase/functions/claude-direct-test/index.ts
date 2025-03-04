
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Enable detailed logging
const DEBUG_MODE = true;

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
    if (DEBUG_MODE) console.log('🔍 Claude Direct Test function received request');
    
    // Get Claude API key from environment
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not found in environment');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ANTHROPIC_API_KEY not found in environment'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Log the API key format without revealing the full key
    const apiKeyPrefix = ANTHROPIC_API_KEY.substring(0, 8) + '...';
    const isValidFormat = ANTHROPIC_API_KEY.startsWith('sk-ant-');
    if (DEBUG_MODE) {
      console.log(`Using API key with prefix: ${apiKeyPrefix}`);
      console.log(`API key has valid format: ${isValidFormat}`);
      console.log(`API key length: ${ANTHROPIC_API_KEY.length} characters`);
    }
    
    if (!isValidFormat) {
      console.warn('⚠️ API key does not have expected format (should start with sk-ant-)');
    }
    
    // Test with a very simple prompt
    if (DEBUG_MODE) console.log('📡 Sending test request to Claude API');
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 100,
          messages: [
            {
              role: 'user',
              content: 'Respond with a single word: "Working"'
            }
          ],
          temperature: 0
        })
      });
      
      if (DEBUG_MODE) {
        console.log(`📡 Claude API response status: ${response.status}`);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      }
      
      if (!response.ok) {
        // Try to extract detailed error information
        let errorText = '';
        let errorJson = null;
        
        try {
          // Try to parse as JSON first
          const bodyText = await response.text();
          errorText = bodyText;
          
          try {
            errorJson = JSON.parse(bodyText);
            console.error('❌ Claude API error response JSON:', errorJson);
          } catch {
            // Not JSON, just use as text
            console.error('❌ Claude API error response text:', bodyText);
          }
        } catch (readError) {
          console.error('❌ Could not read error response:', readError);
          errorText = 'Could not read error response body';
        }
        
        // Log detailed information about the error
        console.error('❌ API error details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText.substring(0, 1000), // Log first 1000 chars
        });
        
        return new Response(
          JSON.stringify({
            success: false,
            error: `Claude API returned ${response.status}: ${errorText}`,
            status: response.status,
            statusText: response.statusText,
            errorDetails: errorJson || errorText
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      const data = await response.json();
      
      if (DEBUG_MODE) {
        console.log('✅ Successfully received response from Claude API');
        console.log('📄 Response data:', JSON.stringify(data).substring(0, 200) + '...');
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Successfully connected to Claude API',
          rawContent: data,
          apiKeyPrefix,
          apiKeyFormatValid: isValidFormat
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (apiError) {
      console.error('❌ Error calling Claude API:', apiError);
      
      // Extract the most useful error information
      const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
      const errorStack = apiError instanceof Error ? apiError.stack : undefined;
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `Error calling Claude API: ${errorMessage}`,
          errorStack: errorStack,
          apiKeyPrefix,
          apiKeyFormatValid: isValidFormat
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('❌ Error in claude-direct-test:', error);
    
    // Create a detailed error response with all available information
    const errorDetail = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : String(error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        errorDetail,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
