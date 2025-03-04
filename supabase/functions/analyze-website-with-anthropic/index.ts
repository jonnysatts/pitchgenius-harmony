
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createCorsPreflightResponse } from './utils/corsHandlers.ts';
import { handleWebsiteAnalysisRequest } from './services/requestHandler.ts';

// Main handler function
serve(async (req) => {
  console.log('Website analysis edge function received request');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return createCorsPreflightResponse();
  }

  // Process website analysis request
  return await handleWebsiteAnalysisRequest(req);
});
