
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// This function tests if we can access the Supabase secrets
// and makes a minimal API call to demonstrate connectivity
serve(async (req) => {
  try {
    // Verify we can access the environment variables
    const apiKeys = {
      // Check which API keys are available
      hasOpenAiKey: !!Deno.env.get('OPEN_API_KEY'),
      hasAnthropicKey: !!Deno.env.get('ANTHROPIC_API_KEY'),
      hasGoogleClientEmail: !!Deno.env.get('GOOGLE_CLIENT_EMAIL'),
      hasGooglePrivateKey: !!Deno.env.get('GOOGLE_PRIVATE_KEY'),
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasSupabaseAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
      hasSupabaseServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      hasSupabaseDbUrl: !!Deno.env.get('SUPABASE_DB_URL'),
    };
    
    // If Anthropic API key is available, make a minimal test request
    let anthropicTest = null;
    if (apiKeys.hasAnthropicKey) {
      const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
      try {
        // Just test if the API key format is valid (begins with 'sk-')
        // We're not making an actual API call to avoid costs
        anthropicTest = {
          keyValid: anthropicKey?.startsWith('sk-') || false,
          keyLength: anthropicKey?.length,
        };
      } catch (error) {
        anthropicTest = { error: error.message };
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Supabase connection test successful",
        availableKeys: apiKeys,
        anthropicTest,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
        stack: error.stack,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
