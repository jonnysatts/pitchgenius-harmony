
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Test connection function received request');
    
    // Check for Anthropic API key
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    const hasAnthropicKey = !!ANTHROPIC_API_KEY;
    
    // Prepare response with environment check details
    const environmentChecks = {
      ANTHROPIC_API_KEY: {
        exists: hasAnthropicKey,
        preview: hasAnthropicKey ? `${ANTHROPIC_API_KEY.substring(0, 3)}...${ANTHROPIC_API_KEY.substring(ANTHROPIC_API_KEY.length - 3)}` : undefined,
        startsWithPrefix: hasAnthropicKey ? ANTHROPIC_API_KEY.startsWith('sk-ant-') : false,
        validLength: hasAnthropicKey ? ANTHROPIC_API_KEY.length > 20 : false
      }
    };
    
    // Check other environment variables and add to checks
    const envVarsToCheck = [
      'OPEN_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'FIRECRAWL_API_KEY',
      'FIRECRAWL_API_KPI'
    ];
    
    const keysFound = ['ANTHROPIC_API_KEY'];
    const keysMissing = [];
    
    for (const varName of envVarsToCheck) {
      const value = Deno.env.get(varName);
      if (value) {
        environmentChecks[varName] = {
          exists: true,
          preview: `${value.substring(0, 3)}...${value.substring(value.length - 3)}`
        };
        keysFound.push(varName);
      } else {
        environmentChecks[varName] = {
          exists: false
        };
        keysMissing.push(varName);
      }
    }
    
    return new Response(
      JSON.stringify({
        message: 'Connection test successful',
        timestamp: new Date().toISOString(),
        environmentChecks,
        allKeysFound: keysMissing.length === 0,
        anthropicKeyExists: hasAnthropicKey,
        anthropicKeyValidFormat: hasAnthropicKey ? ANTHROPIC_API_KEY.startsWith('sk-ant-') : false,
        anthropicKeyValidLength: hasAnthropicKey ? ANTHROPIC_API_KEY.length > 20 : false,
        keysFound,
        keysMissing
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in test connection function:', error);
    
    return new Response(
      JSON.stringify({
        message: 'Error testing connection',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
