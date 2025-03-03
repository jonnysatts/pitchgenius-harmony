
// Analyze a website using Claude/Anthropic API
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Anthropic } from 'https://esm.sh/@anthropic-ai/sdk@0.6.2';
import { corsHeaders } from '../_shared/cors.ts';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY') || '',
});

// Define the supported website insight categories
const websiteInsightCategories = [
  'company_positioning',
  'competitive_landscape',
  'key_partnerships',
  'public_announcements',
  'consumer_engagement',
  'product_service_fit'
];

// Basic web content fetch function
async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    console.log(`Fetching content from ${url}`);
    
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StrategicAnalysisBot/1.0; +https://example.com)'
      }
    });
    
    if (!response.ok) {
      console.error(`Error fetching website: ${response.status} ${response.statusText}`);
      return `Error fetching website content: ${response.status} ${response.statusText}`;
    }
    
    const html = await response.text();
    console.log(`Successfully fetched ${html.length} bytes of content`);
    
    // Very basic HTML cleaning - extract text content
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Return the first 100,000 characters to avoid overwhelming Claude
    return textContent.slice(0, 100000);
  } catch (error) {
    console.error('Error fetching website content:', error);
    return `Error fetching website content: ${error.message || 'Unknown error'}`;
  }
}

// Handle CORS for preflight requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const requestData = await req.json();
    const { 
      projectId, 
      clientIndustry, 
      clientWebsite, 
      websiteContent,
      systemPrompt,
      projectTitle,
      clientName
    } = requestData;
    
    // Check we have the minimum required data
    if (!projectId || !clientWebsite) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Analyzing website for project ${projectId}: ${clientWebsite}\n`);
    
    // Fetch actual website content if not provided
    let contentToAnalyze = websiteContent;
    if (!contentToAnalyze || contentToAnalyze.includes("placeholder for actual website content")) {
      console.log("No valid content provided, attempting to fetch website content directly");
      contentToAnalyze = await fetchWebsiteContent(clientWebsite);
    }
    
    // Prepare a structured output format for Claude to follow
    const outputFormat = `
    Structure your response as a JSON array of insights, with exactly one insight for each of these categories:
    - company_positioning (how they present themselves to the market)
    - competitive_landscape (competitors and market position)
    - key_partnerships (specific partners mentioned)
    - public_announcements (specific news items, dates, announcements)
    - consumer_engagement (how they interact with customers)
    - product_service_fit (how their offerings relate to gaming)
    
    Each insight must follow this format:
    {
      "id": "website-[category]-[timestamp]",
      "category": "One of the six categories listed above",
      "confidence": A number between 60-95 representing how confident you are in this insight,
      "needsReview": true if specificity is low, false if highly specific,
      "content": {
        "title": "A specific title based on actual website content",
        "summary": "A concise summary with SPECIFIC details from the website",
        "details": "Detailed explanation with specific facts, numbers, names, or direct quotes from the website",
        "recommendations": "Gaming-specific recommendations based on the details"
      }
    }
    
    CRITICAL INSTRUCTIONS:
    1. ONLY include information actually present on the website - DO NOT HALLUCINATE or INVENT details
    2. If you cannot find specific information for a category, explicitly note this in the details
    3. Include direct quotes and specific details wherever possible
    4. For recommendations, be specific about gaming integrations
    5. If the content is insufficient, state so clearly in the details field
    6. Include DATES of announcements, NAMES of partners, and SPECIFIC products/services when available
    `;
    
    // Combine the system prompt with the output format
    const fullSystemPrompt = `${systemPrompt}\n\n${outputFormat}`;
    
    // Call Claude API with the prepared content and prompt
    const completion = await anthropic.completions.create({
      model: 'claude-2.1',
      max_tokens_to_sample: 4000,
      system: fullSystemPrompt,
      prompt: `\n\nHuman: I need to analyze this website for a gaming strategy project. The website belongs to ${clientName || "a company"} in the ${clientIndustry} industry. Here's the website content:\n\n${contentToAnalyze}\n\nPlease analyze this content and generate strategic insights that would be valuable for a gaming company considering a potential partnership. Focus on identifying specific opportunities, challenges, and unique strategic positions.\n\nAssistant: I'll analyze this website content and generate strategic insights with specific details for your gaming client.`,
      temperature: 0.3
    });
    
    // Process the response
    let insights;
    
    try {
      // Extract JSON from the response
      const jsonMatch = completion.completion.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        // Parse the JSON array
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract JSON array from response');
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      
      // Try a more lenient approach to find and parse JSON objects
      try {
        const text = completion.completion;
        const jsonStart = text.indexOf('[');
        const jsonEnd = text.lastIndexOf(']');
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonStr = text.substring(jsonStart, jsonEnd + 1);
          insights = JSON.parse(jsonStr);
        } else {
          throw new Error('Could not find JSON array in response');
        }
      } catch (fallbackError) {
        console.error('Fallback parsing also failed:', fallbackError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to parse Claude response', 
            rawResponse: completion.completion
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Check if we got valid insights
    if (!insights || !Array.isArray(insights) || insights.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No valid insights generated', 
          rawResponse: completion.completion 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Log insights categories for debugging
    console.log('Generated insight categories:', insights.map(i => i.category));
    
    // Process insights to ensure they have all required fields and validate categories
    const processedInsights = insights.map(insight => {
      // Generate an ID if one wasn't provided
      if (!insight.id) {
        const category = insight.category || 'general';
        insight.id = `website-${category}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
      
      // Set default values for missing fields
      return {
        ...insight,
        confidence: insight.confidence || 80,
        needsReview: insight.needsReview !== undefined ? insight.needsReview : true,
        content: {
          ...(insight.content || {}),
          title: insight.content?.title || `Website Analysis: ${insight.category}`,
          summary: insight.content?.summary || `Analysis of ${clientWebsite} website.`,
          details: insight.content?.details || 'No specific details found on the website.',
          recommendations: insight.content?.recommendations || 'Consider how this insight could be leveraged in gaming context.'
        }
      };
    });
    
    // Return the insights
    return new Response(
      JSON.stringify({ insights: processedInsights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in analyze-website-with-anthropic:', error);
    
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
