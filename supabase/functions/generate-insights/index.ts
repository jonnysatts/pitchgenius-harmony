
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleRequest, corsHeaders } from "./handlers/requestHandler.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  return handleRequest(req);
});
