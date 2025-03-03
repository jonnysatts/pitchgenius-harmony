
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('Test connection function loaded')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Received test connection request')
    
    // Check for environment variables
    const keys = [
      'ANTHROPIC_API_KEY',
      'OPEN_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    const results = {}
    let allKeysFound = true
    
    for (const key of keys) {
      const value = Deno.env.get(key)
      const exists = !!value
      results[key] = {
        exists,
        // For security, only show first few chars of the actual key
        preview: exists ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : null
      }
      
      if (!exists) {
        allKeysFound = false
      }
    }
    
    console.log(`Keys check results: ${allKeysFound ? 'All keys found' : 'Some keys missing'}`)
    
    return new Response(
      JSON.stringify({
        message: 'Connection test successful',
        timestamp: new Date().toISOString(),
        environmentChecks: results,
        allKeysFound
      }),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Error in test connection function:', error.message)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
})
