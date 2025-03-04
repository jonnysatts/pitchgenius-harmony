
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

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
    // Get Claude API key from environment
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!ANTHROPIC_API_KEY) {
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
    console.log(`Using API key with prefix: ${apiKeyPrefix}`);
    
    // Test with a very simple prompt
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
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API error: ${response.status} ${response.statusText}`, errorText);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: `Claude API returned ${response.status}: ${errorText}`,
          status: response.status,
          statusText: response.statusText
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully connected to Claude API',
        rawContent: data,
        apiKeyPrefix
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in claude-direct-test:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
