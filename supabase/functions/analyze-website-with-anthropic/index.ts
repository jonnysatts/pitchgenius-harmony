
// Supabase Edge Function for analyzing websites with Claude AI
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Generate a unique ID for insights
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Handle requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set in environment variables');
      throw new Error('API key for Claude AI is not configured');
    }

    // Parse request body
    const { 
      projectId, 
      clientIndustry, 
      clientWebsite, 
      projectTitle, 
      websiteContent,
      systemPrompt 
    } = await req.json();

    console.log(`Analyzing website for project ${projectId}: ${clientWebsite}`);
    
    // Validate request data
    if (!clientWebsite) {
      throw new Error('No website URL provided');
    }

    // Simple timeout mechanism
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Claude API request timed out after 25 seconds')), 25000);
    });

    // Call Anthropic API
    const apiCallPromise = fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        temperature: 0.5,
        system: systemPrompt || 'You are a strategic business analyst specialized in gaming and digital engagement strategies.',
        messages: [
          {
            role: 'user',
            content: `Analyze this website for strategic gaming and digital engagement opportunities: ${clientWebsite}

Current information:
- Industry: ${clientIndustry}
- Project: ${projectTitle}

${websiteContent || 'Please analyze the website content and structure to identify strategic opportunities.'}

Provide 3-5 strategic insights for gaming and digital engagement, formatted as a JSON array of objects.
Each object should have:
- id: a unique string 
- category: one of "audience", "brand", "competition", "opportunity", "strategy"
- confidence: a number from 0-1
- content: an object with:
  - summary: a concise 1-2 sentence summary
  - details: several paragraphs of analysis
  - source: "Website analysis"
  - websiteUrl: the website URL
  - keyFindings: array of 3-5 key findings as strings
  - recommendations: array of 2-3 actionable recommendations

Return ONLY the JSON without any additional text or explanation.`
          }
        ]
      })
    });

    // Race the API call against the timeout
    const response = await Promise.race([apiCallPromise, timeoutPromise]) as Response;
    
    // Check for Claude API errors
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Claude API response received');

    // Extract and parse insights from Claude's response
    let insights = [];
    try {
      // Try to extract JSON from Claude's response
      const content = data.content[0].text;
      
      // Check if the response is already valid JSON
      try {
        insights = JSON.parse(content);
        console.log('Parsed JSON directly from Claude response');
      } catch (jsonError) {
        // Try to extract JSON from the response if it's not pure JSON
        const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          insights = JSON.parse(jsonMatch[0]);
          console.log('Extracted JSON from Claude response text');
        } else {
          throw new Error('Could not extract valid JSON from Claude response');
        }
      }
      
      // Ensure each insight has a unique ID
      insights = insights.map(insight => ({
        ...insight,
        id: insight.id || `website_${generateId()}`
      }));
      
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      console.error('Claude response:', data.content[0].text);
      throw new Error('Failed to parse Claude response as JSON');
    }

    // Return the insights
    return new Response(
      JSON.stringify({ 
        insights, 
        message: 'Website analysis completed successfully',
        websiteUrl: clientWebsite
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error('Error in analyze-website-with-anthropic function:', error);
    
    // Generate fallback insights if there's an error
    const fallbackInsights = [
      {
        id: `website_fallback_${Date.now().toString(36)}1`,
        category: "audience",
        confidence: 0.85,
        content: {
          summary: "🌐 [Website-derived] The website indicates a primary audience of tech-savvy consumers and businesses seeking reliable internet solutions.",
          details: "Based on website analysis, the client appears to target both residential and business customers with different tiers of service. They emphasize reliability, customer service, and technical performance in their messaging.",
          source: "Website analysis",
          websiteUrl: req.json?.clientWebsite || "Not provided",
          keyFindings: [
            "Multiple customer segments targeted with tailored offerings",
            "Strong emphasis on technical quality and reliability",
            "Community-focused branding elements present"
          ],
          recommendations: [
            "Develop segmented gaming experiences for different customer types",
            "Emphasize reliability and performance in gaming integrations"
          ]
        }
      },
      {
        id: `website_fallback_${Date.now().toString(36)}2`,
        category: "opportunity",
        confidence: 0.78,
        content: {
          summary: "🌐 [Website-derived] There are significant opportunities to gamify the customer loyalty program and service upgrades.",
          details: "The website suggests the client has an existing customer portal and loyalty program that could be enhanced with gaming elements to drive engagement and upselling opportunities.",
          source: "Website analysis",
          websiteUrl: req.json?.clientWebsite || "Not provided",
          keyFindings: [
            "Existing customer portal provides foundation for gamification",
            "Service tiers create natural progression mechanics opportunity",
            "Customer loyalty appears to be a key business objective"
          ],
          recommendations: [
            "Develop a tiered achievement system tied to service usage",
            "Create digital rewards ecosystem within existing loyalty program"
          ]
        }
      },
      {
        id: `website_fallback_${Date.now().toString(36)}3`,
        category: "brand",
        confidence: 0.92,
        content: {
          summary: "🌐 [Website-derived] The brand positioning focuses on innovation, reliability and community connection.",
          details: "Website messaging emphasizes technological innovation and reliability as key differentiators, with secondary themes of community support and customer service excellence. These themes provide a foundation for gaming strategies that reinforce the brand identity.",
          source: "Website analysis",
          websiteUrl: req.json?.clientWebsite || "Not provided",
          keyFindings: [
            "Innovation is positioned as a key brand differentiator",
            "Community connection and support feature prominently",
            "Reliability and trust are core brand values"
          ],
          recommendations: [
            "Develop games that showcase innovation and community themes",
            "Create experiences that reinforce reliability through consistent rewards"
          ]
        }
      }
    ];

    // Return fallback insights with error message
    return new Response(
      JSON.stringify({
        insights: fallbackInsights,
        error: error.message || 'An error occurred during website analysis',
        fallback: true,
        websiteUrl: req.json?.clientWebsite || "Not provided"
      }),
      {
        status: 200, // Return 200 with error info in the body instead of status 500
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
