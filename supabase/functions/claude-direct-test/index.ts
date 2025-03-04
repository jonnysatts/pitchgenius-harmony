
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
  
  console.log('🧪 Claude direct test function called');
  
  try {
    // 1. Get API key and validate
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not found');
      return new Response(
        JSON.stringify({ 
          error: 'API key missing',
          success: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`✅ API key found: ${ANTHROPIC_API_KEY.substring(0, 7)}...`);
    
    // 2. Make a minimal Claude API call
    const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    const CLAUDE_API_VERSION = "2023-06-01";
    
    console.log('📡 Making direct API call to Claude...');
    
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': CLAUDE_API_VERSION
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",  // Using smallest/fastest model for testing
        max_tokens: 100,
        messages: [{ 
          role: 'user', 
          content: "Generate a simple JSON object with the key 'status' and value 'success'. Use this exact format: {\"status\": \"success\"}"
        }],
        temperature: 0
      })
    });
    
    console.log(`🔄 Claude API response status: ${response.status}`);
    
    // 3. Handle and log response details
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Claude API error:`, errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          status: response.status,
          error: errorText,
          apiKeyPrefix: ANTHROPIC_API_KEY.substring(0, 7) + "..."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 4. Process successful response
    const data = await response.json();
    console.log('✅ Claude API response received:', data);
    
    return new Response(
      JSON.stringify({
        success: true,
        response: data,
        rawContent: data.content?.[0]?.text || "No content",
        apiKeyPrefix: ANTHROPIC_API_KEY.substring(0, 7) + "..."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Error in Claude direct test:', error);
    
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
