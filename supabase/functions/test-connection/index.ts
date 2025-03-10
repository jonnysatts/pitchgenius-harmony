
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
    
    // Parse request body if any
    let reqBody = {};
    if (req.headers.get("content-type")?.includes("application/json")) {
      try {
        reqBody = await req.json();
        console.log('Request body:', reqBody);
      } catch (e) {
        console.log('No valid JSON in request body');
      }
    }
    
    // Check for Anthropic API key and format
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    const anthropicKeyExists = !!ANTHROPIC_API_KEY;
    const anthropicKeyValidFormat = anthropicKeyExists && ANTHROPIC_API_KEY.startsWith('sk-ant-');
    const anthropicKeyValidLength = anthropicKeyExists && ANTHROPIC_API_KEY.length > 20;
    const anthropicKeyPrefix = anthropicKeyExists ? ANTHROPIC_API_KEY.substring(0, 5) + '...' + ANTHROPIC_API_KEY.slice(-3) : 'none';
    
    // Check for Firecrawl API key (with both possible names)
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const FIRECRAWL_API_KPI = Deno.env.get('FIRECRAWL_API_KPI');
    const firecrawlKeyExists = !!FIRECRAWL_API_KEY || !!FIRECRAWL_API_KPI;
    const firecrawlKeyActive = firecrawlKeyExists;
    
    // Special Firecrawl check for detailed API check
    if (reqBody.testType === 'firecrawl-api-check') {
      console.log('Performing Firecrawl API check');
      
      // Determine which key to use
      const activeKey = FIRECRAWL_API_KEY || FIRECRAWL_API_KPI;
      const keyName = FIRECRAWL_API_KEY ? 'FIRECRAWL_API_KEY' : 'FIRECRAWL_API_KPI';
      
      // Verify key exists before proceeding
      if (!firecrawlKeyExists) {
        return new Response(
          JSON.stringify({
            message: "No Firecrawl API key found",
            timestamp: new Date().toISOString(),
            firecrawlKeyExists: false,
            firecrawlKeyActive: false,
            error: "No Firecrawl API key found. Either FIRECRAWL_API_KEY or FIRECRAWL_API_KPI must be set."
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          message: "Firecrawl API key found",
          timestamp: new Date().toISOString(),
          firecrawlKeyExists,
          firecrawlKeyActive,
          keyUsed: keyName,
          keyPreview: firecrawlKeyExists ? 
            (activeKey?.substring(0, 5) + '...' + activeKey?.slice(-3)) : 
            'none'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
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
        exists: !!FIRECRAWL_API_KEY,
        preview: FIRECRAWL_API_KEY ? FIRECRAWL_API_KEY.substring(0, 5) + '...' + FIRECRAWL_API_KEY.slice(-3) : 'none'
      },
      FIRECRAWL_API_KPI: {
        exists: !!FIRECRAWL_API_KPI,
        preview: FIRECRAWL_API_KPI ? FIRECRAWL_API_KPI.substring(0, 5) + '...' + FIRECRAWL_API_KPI.slice(-3) : 'none'
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
    
    // Gather system info for debugging
    const systemInfo = {
      denoVersion: Deno.version.deno,
      v8Version: Deno.version.v8,
      typescriptVersion: Deno.version.typescript,
      edgeFunction: "test-connection",
      timestamp: new Date().toISOString(),
      requestMethod: req.method,
      requestUrl: req.url
    };
    
    return new Response(
      JSON.stringify({
        message: "Connection test successful",
        timestamp: new Date().toISOString(),
        environmentChecks,
        allKeysFound: keysMissing.length === 0,
        anthropicKeyExists,
        anthropicKeyValidFormat,
        anthropicKeyValidLength,
        firecrawlKeyExists,
        keysFound,
        keysMissing,
        systemInfo,
        requestDetails: {
          method: req.method,
          url: req.url,
          body: reqBody
        }
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
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
