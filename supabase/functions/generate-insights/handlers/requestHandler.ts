
/**
 * Handlers for Edge Function HTTP requests
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { callAnthropicAPI } from '../services/claudeService.ts'
import { chunkText, formatDocumentsForAnalysis, processDocumentContent } from '../utils/textProcessing.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export async function handleRequest(req: Request): Promise<Response> {
  try {
    const { projectId, documentIds, clientIndustry = 'technology' } = await req.json();
    
    if (!projectId || !documentIds || documentIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: projectId and documentIds' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing analysis request for project ${projectId} with ${documentIds.length} documents`);
    
    // Process documents to extract content
    const processedDocuments = await processDocumentContent(documentIds);
    
    // Format documents for analysis
    const formattedContent = formatDocumentsForAnalysis(processedDocuments, clientIndustry);
    
    // Split content into chunks if it exceeds Claude's context window
    const chunks = chunkText(formattedContent);
    console.log(`Split content into ${chunks.length} chunks`);
    
    // For now, we'll just use the first chunk to stay within Claude's context window
    // A more sophisticated approach would be to analyze each chunk and then synthesize
    const analysisResult = await callAnthropicAPI(chunks[0], clientIndustry);
    
    // Return the insights
    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in generate-insights function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error processing insights' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
