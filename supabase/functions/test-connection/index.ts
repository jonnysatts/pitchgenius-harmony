
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
    
    console.log('Checking for environment variables...')
    
    for (const key of keys) {
      const value = Deno.env.get(key)
      const exists = !!value
      console.log(`Checking ${key}: ${exists ? 'Found' : 'Not found'}`)
      
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
    
    const responseData = {
      message: 'Connection test successful',
      timestamp: new Date().toISOString(),
      environmentChecks: results,
      allKeysFound
    }
    
    console.log('Sending response:', JSON.stringify({
      message: responseData.message,
      allKeysFound: responseData.allKeysFound,
      keysFound: Object.keys(results).filter(k => results[k].exists),
      keysMissing: Object.keys(results).filter(k => !results[k].exists)
    }))
    
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
