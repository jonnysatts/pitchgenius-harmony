
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('Test connection function loaded')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Received test connection request', new Date().toISOString())
    
    // Parse the request body if present
    let requestData = {};
    try {
      const requestText = await req.text();
      if (requestText) {
        requestData = JSON.parse(requestText);
        console.log('Request data:', requestData);
      }
    } catch (parseError) {
      console.log('No valid JSON in request body or empty body');
    }
    
    // Check for environment variables
    const keys = [
      'ANTHROPIC_API_KEY',
      'OPEN_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'FIRECRAWL_API_KEY',
      'FIRECRAWL_API_KPI'
    ]
    
    const results = {}
    let allKeysFound = true
    let anthropicKeyFound = false
    let keysFound = []
    let keysMissing = []
    
    console.log('Checking for environment variables...')
    
    for (const key of keys) {
      const value = Deno.env.get(key)
      const exists = !!value
      console.log(`Checking ${key}: ${exists ? 'Found' : 'Not found'}`)
      
      if (exists) {
        keysFound.push(key)
        // For security, only show first few chars of the actual key
        results[key] = {
          exists,
          preview: `${value.substring(0, 3)}...${value.substring(value.length - 3)}`
        }
        
        // Check specifically for Anthropic API key
        if (key === 'ANTHROPIC_API_KEY') {
          anthropicKeyFound = true
          console.log('ANTHROPIC_API_KEY found!')
        }
      } else {
        keysMissing.push(key)
        results[key] = { exists: false }
        allKeysFound = false
        
        // Log if we're missing critical keys
        if (key === 'ANTHROPIC_API_KEY') {
          console.log('CRITICAL: ANTHROPIC_API_KEY is missing!')
        }
      }
    }
    
    console.log(`Keys check results: ${allKeysFound ? 'All keys found' : 'Some keys missing'}`)
    console.log(`Found keys: ${keysFound.join(', ')}`)
    console.log(`Missing keys: ${keysMissing.join(', ')}`)
    
    const responseData = {
      message: 'Connection test successful',
      timestamp: new Date().toISOString(),
      environmentChecks: results,
      allKeysFound,
      anthropicKeyExists: anthropicKeyFound,
      keysFound,
      keysMissing
    }
    
    console.log('Sending test-connection response')
    
    return new Response(
      JSON.stringify(responseData),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Error in test connection function:', error.message)
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
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
