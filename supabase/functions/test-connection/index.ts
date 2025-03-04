
/**
 * Test Connection Edge Function
 * Provides diagnostic information about the Supabase environment
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    if (DEBUG_MODE) console.log('🔍 Test connection function received request');
    
    // Parse request body
    let requestData = { testType: 'basic', debugMode: false };
    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestData = JSON.parse(bodyText);
      }
    } catch (e) {
      // If parsing fails, use default values
      console.log('⚠️ Failed to parse request body, using defaults');
    }
    
    // Extract request options
    const { testType, debugMode = false } = requestData;
    
    // Override DEBUG_MODE if specified in request
    const useDebugMode = debugMode || DEBUG_MODE;
    
    if (useDebugMode) console.log(`🔄 Processing ${testType} test`);
    
    // Check for environment variables and their values (showing first few chars only)
    const keys = ['ANTHROPIC_API_KEY', 'OPEN_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'FIRECRAWL_API_KEY', 'FIRECRAWL_API_KPI'];
    const environmentChecks = {};
    let anthropicKeyExists = false;
    
    for (const key of keys) {
      const value = Deno.env.get(key);
      if (value) {
        const preview = value.substring(0, 3) + '...' + value.substring(value.length - 3);
        environmentChecks[key] = {
          exists: true,
          preview
        };
        
        // Check ANTHROPIC_API_KEY format if it exists
        if (key === 'ANTHROPIC_API_KEY') {
          anthropicKeyExists = true;
          environmentChecks[key].startsWithPrefix = value.startsWith('sk-ant-');
          environmentChecks[key].validLength = value.length > 20;
          
          if (useDebugMode) {
            console.log(`🔑 ANTHROPIC_API_KEY check:`, {
              exists: true, 
              prefix: value.substring(0, 7) + '...', 
              validPrefix: value.startsWith('sk-ant-'),
              length: value.length,
              validLength: value.length > 20
            });
          }
        }
      } else {
        environmentChecks[key] = { exists: false };
      }
    }
    
    const keysFound = Object.keys(environmentChecks).filter(key => environmentChecks[key].exists);
    const keysMissing = Object.keys(environmentChecks).filter(key => !environmentChecks[key].exists);
    const allKeysFound = keysMissing.length === 0;
    
    if (useDebugMode) {
      console.log('📊 Environment check result:', {
        keysFound: keysFound.length,
        keysMissing: keysMissing.length,
        anthropicKeyExists,
        anthropicKeyValid: anthropicKeyExists && environmentChecks['ANTHROPIC_API_KEY']?.startsWithPrefix
      });
    }
    
    // For anthropic-key-check type, perform extra tests
    if (testType === 'anthropic-key-check') {
      const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
      const anthropicKeyValid = anthropicKey && anthropicKey.startsWith('sk-ant-') && anthropicKey.length > 20;
      
      if (useDebugMode) {
        console.log('🔑 Anthropic API Key detailed check:', {
          exists: !!anthropicKey,
          prefix: anthropicKey ? anthropicKey.substring(0, 7) + '...' : 'N/A',
          length: anthropicKey ? anthropicKey.length : 0,
          validFormat: anthropicKeyValid
        });
      }
      
      return new Response(
        JSON.stringify({
          message: "Connection test successful",
          timestamp: new Date().toISOString(),
          environmentChecks,
          allKeysFound,
          anthropicKeyExists,
          anthropicKeyValidFormat: anthropicKey ? anthropicKey.startsWith('sk-ant-') : false,
          anthropicKeyValidLength: anthropicKey ? anthropicKey.length > 20 : false,
          keysFound,
          keysMissing
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Basic connection test
    return new Response(
      JSON.stringify({
        message: "Connection test successful",
        timestamp: new Date().toISOString(),
        environmentChecks,
        allKeysFound,
        anthropicKeyExists,
        keysFound,
        keysMissing
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('❌ Error in test-connection function:', error);
    
    return new Response(
      JSON.stringify({
        error: `Test connection failed: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
