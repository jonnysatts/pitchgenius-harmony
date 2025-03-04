
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    console.log('Test connection function received request');
    
    // Check for Anthropic API key and format
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    const anthropicKeyExists = !!ANTHROPIC_API_KEY;
    const anthropicKeyValidFormat = anthropicKeyExists && ANTHROPIC_API_KEY.startsWith('sk-ant-');
    const anthropicKeyValidLength = anthropicKeyExists && ANTHROPIC_API_KEY.length > 20;
    const anthropicKeyPrefix = anthropicKeyExists ? ANTHROPIC_API_KEY.substring(0, 5) + '...' + ANTHROPIC_API_KEY.slice(-3) : 'none';
    
    // Check for other environment variables
    const environmentChecks = {
      ANTHROPIC_API_KEY: {
        exists: anthropicKeyExists,
        preview: anthropicKeyPrefix,
        startsWithPrefix: anthropicKeyValidFormat,
        validLength: anthropicKeyValidLength
      },
      OPEN_API_KEY: {
        exists: !!Deno.env.get('OPEN_API_KEY'),
        preview: Deno.env.get('OPEN_API_KEY') ? Deno.env.get('OPEN_API_KEY')?.substring(0, 5) + '...' + Deno.env.get('OPEN_API_KEY')?.slice(-3) : 'none'
      },
      SUPABASE_URL: {
        exists: !!Deno.env.get('SUPABASE_URL'),
        preview: Deno.env.get('SUPABASE_URL') ? Deno.env.get('SUPABASE_URL')?.substring(0, 7) + '...' + Deno.env.get('SUPABASE_URL')?.slice(-3) : 'none'
      },
      SUPABASE_ANON_KEY: {
        exists: !!Deno.env.get('SUPABASE_ANON_KEY'),
        preview: Deno.env.get('SUPABASE_ANON_KEY') ? Deno.env.get('SUPABASE_ANON_KEY')?.substring(0, 5) + '...' + Deno.env.get('SUPABASE_ANON_KEY')?.slice(-3) : 'none'
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        exists: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        preview: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.substring(0, 5) + '...' + Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.slice(-3) : 'none'
      },
      FIRECRAWL_API_KEY: {
        exists: !!Deno.env.get('FIRECRAWL_API_KEY')
      },
      FIRECRAWL_API_KPI: {
        exists: !!Deno.env.get('FIRECRAWL_API_KPI'),
        preview: Deno.env.get('FIRECRAWL_API_KPI') ? Deno.env.get('FIRECRAWL_API_KPI')?.substring(0, 5) + '...' + Deno.env.get('FIRECRAWL_API_KPI')?.slice(-3) : 'none'
      }
    };
    
    // Get all found keys
    const keysFound = Object.keys(environmentChecks).filter(key => 
      environmentChecks[key as keyof typeof environmentChecks].exists
    );
    
    // Get all missing keys
    const keysMissing = Object.keys(environmentChecks).filter(key => 
      !environmentChecks[key as keyof typeof environmentChecks].exists
    );
    
    return new Response(
      JSON.stringify({
        message: "Connection test successful",
        timestamp: new Date().toISOString(),
        environmentChecks,
        allKeysFound: keysMissing.length === 0,
        anthropicKeyExists,
        anthropicKeyValidFormat,
        anthropicKeyValidLength,
        keysFound,
        keysMissing
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in test-connection function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
