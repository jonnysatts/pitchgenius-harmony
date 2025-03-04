
// Main entry point for website analysis using Claude/Anthropic
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './utils/corsHandlers.ts';
import { fetchWebsiteContentBasic } from './utils/websiteFetcher.ts';
import { fetchWebsiteContentWithFirecrawl } from './utils/firecrawlFetcher.ts';
import { analyzeWebsiteWithAnthropic, verifyAnthropicApiKey } from './services/anthropicService.ts';
import { parseClaudeResponse, generateFallbackInsights } from './utils/insightProcessor.ts';

// Handle CORS for preflight requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('Website analysis Edge Function starting...');
    
    // First, verify the Anthropic API key before processing anything else
    if (!verifyAnthropicApiKey()) {
      console.error('Anthropic API key validation failed');
      return new Response(
        JSON.stringify({ 
          error: 'Anthropic API key validation failed',
          details: 'Please check your ANTHROPIC_API_KEY in Supabase secrets - it should start with sk-ant-',
          insights: generateFallbackInsights("unknown", "the client", "general")
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse the request body
    let requestData;
    try {
      requestData = await req.json();
      console.log('Request data received:', {
        projectId: requestData.projectId,
        clientIndustry: requestData.clientIndustry,
        clientWebsite: requestData.clientWebsite,
        hasWebsiteContent: !!requestData.websiteContent,
        timestamp: requestData.timestamp
      });
    } catch (parseError) {
      console.error('Error parsing request JSON:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body', 
          details: parseError.message,
          insights: generateFallbackInsights("unknown", "the client", "general")
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { 
      projectId, 
      clientIndustry, 
      clientWebsite, 
      websiteContent,
      systemPrompt,
      clientName
    } = requestData;
    
    // Check we have the minimum required data
    if (!projectId || !clientWebsite) {
      console.error('Missing required fields in request:', JSON.stringify(requestData));
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          required: ['projectId', 'clientWebsite'],
          received: Object.keys(requestData),
          insights: generateFallbackInsights("unknown", "the client", "general")
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Analyzing website for project ${projectId}: ${clientWebsite}`);
    
    // Print current environment variables (securely)
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY') || Deno.env.get('FIRECRAWL_API_KPI');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    console.log(`Environment check: Firecrawl API Key exists: ${!!firecrawlKey} (${firecrawlKey ? firecrawlKey.substring(0, 3) + '...' : 'missing'})`);
    console.log(`Environment check: Anthropic API Key exists: ${!!anthropicKey} (${anthropicKey ? anthropicKey.substring(0, 3) + '...' : 'missing'})`);
    
    // Try to use provided content first, otherwise fetch it
    let contentToAnalyze = websiteContent;
    
    if (!contentToAnalyze || contentToAnalyze.includes("placeholder for actual website content")) {
      console.log("No valid content provided, attempting to fetch website content");
      
      try {
        // First try using Firecrawl for enhanced scraping if available
        if (firecrawlKey) {
          try {
            console.log(`Attempting to fetch content with Firecrawl for ${clientWebsite}...`);
            contentToAnalyze = await fetchWebsiteContentWithFirecrawl(clientWebsite);
            console.log(`Firecrawl returned ${contentToAnalyze.length} characters of content`);
          } catch (fetchError) {
            console.error("Error with Firecrawl, falling back to basic fetch:", fetchError);
            contentToAnalyze = await fetchWebsiteContentBasic(clientWebsite);
            console.log(`Basic fetch returned ${contentToAnalyze.length} characters of content`);
          }
        } else {
          console.log("No Firecrawl API key found, using basic fetch");
          contentToAnalyze = await fetchWebsiteContentBasic(clientWebsite);
          console.log(`Basic fetch returned ${contentToAnalyze.length} characters of content`);
        }
      } catch (fetchError) {
        console.error("Error fetching website content:", fetchError);
        
        // Generate fallback content description 
        contentToAnalyze = `The website at ${clientWebsite} could not be accessed or scraped properly. 
This could be due to the site using techniques that prevent scraping, being temporarily unavailable, 
or using technologies our scraper cannot interpret. Based on the URL, this appears to be 
${clientWebsite.includes('.com') ? 'a commercial website' : clientWebsite.includes('.org') ? 'an organization website' : 'a website'} 
likely in the ${clientIndustry || 'general'} industry.`;
        
        console.log("Using generated fallback content description");
      }
    }
    
    if (!contentToAnalyze || contentToAnalyze.length < 100) {
      console.error("Failed to fetch sufficient website content, using fallback insights");
      
      // Generate fallback insights instead of failing
      const fallbackInsights = generateFallbackInsights(clientWebsite, clientName || "the client", clientIndustry || "general");
      
      return new Response(
        JSON.stringify({ 
          insights: fallbackInsights,
          message: 'Using fallback insights due to insufficient website content',
          warning: 'Website content could not be scraped successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Call Claude to analyze the content
    console.log("Calling Claude API to analyze content...");
    try {
      const claudeResponse = await analyzeWebsiteWithAnthropic(
        contentToAnalyze,
        systemPrompt || "You are a strategic analyst helping a gaming agency identify opportunities for gaming partnerships and integrations.",
        clientName || "the client",
        clientIndustry || "general"
      );
      
      console.log(`Claude API response received (${claudeResponse.length} chars)`);
      
      // Process the response to extract insights
      let insights;
      try {
        console.log("Parsing Claude response into insights...");
        insights = parseClaudeResponse(claudeResponse);
        console.log(`Parsed ${insights.length} insights from Claude response`);
      } catch (parseError) {
        console.error('Failed to parse Claude response:', parseError);
        
        // Generate fallback insights instead of failing
        console.log("Using fallback insights due to parsing error");
        insights = generateFallbackInsights(clientWebsite, clientName || "the client", clientIndustry || "general");
      }
      
      // Check if we got valid insights
      if (!insights || !Array.isArray(insights) || insights.length === 0) {
        console.error('No valid insights generated from Claude response');
        
        // Generate fallback insights
        console.log("Using fallback insights due to no valid insights from Claude");
        insights = generateFallbackInsights(clientWebsite, clientName || "the client", clientIndustry || "general");
      }
      
      // Return the insights
      return new Response(
        JSON.stringify({ 
          insights,
          message: 'Successfully analyzed website and generated insights'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (claudeError) {
      console.error('Error calling Claude API:', claudeError);
      
      // Generate fallback insights instead of failing
      console.log("Using fallback insights due to Claude API error");
      const fallbackInsights = generateFallbackInsights(clientWebsite, clientName || "the client", clientIndustry || "general");
      
      return new Response(
        JSON.stringify({ 
          insights: fallbackInsights,
          message: 'Using fallback insights due to API error',
          error: `Error calling Claude API: ${claudeError.message || 'Unknown Claude API error'}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in analyze-website-with-anthropic:', error);
    
    return new Response(
      JSON.stringify({ 
        error: `Server error: ${error.message || 'Unknown error'}`,
        fallback: true,
        insights: generateFallbackInsights("unknown", "the client", "general")
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
