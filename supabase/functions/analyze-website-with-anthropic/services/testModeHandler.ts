
import { corsHeaders } from '../utils/corsHandlers.ts';
import { generateFallbackInsights } from './fallbackGenerator.ts';

/**
 * Handle test mode requests with mock responses
 */
export async function handleTestModeRequest(requestData: any): Promise<Response> {
  console.log('Test mode detected, returning mock response');
  
  const mockResponse = {
    success: true,
    test_mode: true,
    message: "Website analysis test connection successful",
    insights: generateFallbackInsights(requestData.client_industry || "technology"),
    website_url: requestData.website_url || "test.com",
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(mockResponse), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
