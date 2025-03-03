
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
      projectTitle
    } = requestData;
    
    // Check we have the minimum required data
    if (!projectId || !clientWebsite) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Analyzing website for project ${projectId}: ${clientWebsite}\n`);
    
    // Prepare a structured output format for Claude to follow
    const outputFormat = `
    You must structure your response as a JSON array of insights, with each insight following this format:
    {
      "id": "unique-id-for-insight",
      "category": "One of the following categories: ${websiteInsightCategories.join(', ')}",
      "confidence": 85, // A number between 60-95 representing how confident you are in this insight
      "needsReview": false, // Boolean, set to true for less certain insights
      "content": {
        "title": "A clear title for the insight",
        "summary": "A concise summary of the strategic insight",
        "details": "Detailed explanation of the insight, providing context and background",
        "recommendations": "Specific, actionable recommendations for gaming executives"
      }
    }
    
    IMPORTANT INSTRUCTIONS:
    1. Generate at least 6 insights, with at least one insight for each of these categories: ${websiteInsightCategories.join(', ')}
    2. Make the insights varied and diverse - do not all focus on the same aspect
    3. Ensure each insight has a unique ID that includes the category name
    4. Include specific details from the website in your insights
    5. Ensure all recommendations are gaming-related
    6. Focus on quality over quantity - each insight should be valuable for gaming strategy
    7. DO NOT reference other categories outside the ones listed above
    `;
    
    // Combine the system prompt with the output format
    const fullSystemPrompt = `${systemPrompt}\n\n${outputFormat}`;
    
    // Call Claude API with the prepared content and prompt
    const completion = await anthropic.completions.create({
      model: 'claude-2.1',
      max_tokens_to_sample: 4000,
      system: fullSystemPrompt,
      prompt: `\n\nHuman: I need strategic analysis of this website for a gaming client. Here's the website content:\n\n${websiteContent}\n\nPlease analyze this content and generate strategic insights that would be valuable for a gaming company considering a potential partnership with this business. Focus on identifying opportunities, challenges, and unique strategic positions.\n\nAssistant: I'll analyze this website content and generate strategic insights for your gaming client.`,
      temperature: 0.7
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
          summary: insight.content?.summary || `Strategic insight based on ${clientWebsite} website analysis.`,
          details: insight.content?.details || '',
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
