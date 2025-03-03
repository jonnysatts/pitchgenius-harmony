
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface WebsiteAnalysisRequest {
  projectId: string;
  clientIndustry: string;
  clientWebsite: string;
  projectTitle: string;
  websiteContent: string;
  systemPrompt: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    
    if (!anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set in the environment variables");
    }

    // Extract request data
    const requestData: WebsiteAnalysisRequest = await req.json();
    const { 
      projectId,
      clientIndustry, 
      clientWebsite, 
      projectTitle,
      websiteContent,
      systemPrompt 
    } = requestData;

    console.log(`Analyzing website for project ${projectId}: ${clientWebsite}`);

    // Prepare the prompt for the AI
    const userPrompt = `
Analyze the following website content for ${clientWebsite} in the ${clientIndustry} industry:

${websiteContent}

The client is: ${projectTitle}

Generate 3-5 strategic insights about how this client could leverage gaming and gamification in their business strategy.
Each insight should include:
1. A clear summary (1-2 sentences)
2. Supporting details with reasoning
3. Potential business impact
4. Implementation considerations

Format your response as JSON with this structure:
{
  "insights": [
    {
      "id": "string (random ID)",
      "content": {
        "summary": "string (concise insight description)",
        "details": "string (detailed explanation)",
        "businessImpact": "string (projected impact)",
        "implementation": "string (implementation guidance)",
        "confidence": number (0.0-1.0),
        "source": "Website analysis",
        "websiteUrl": "${clientWebsite}",
        "category": "string (e.g. 'Customer Engagement', 'Marketing Strategy', etc.)"
      }
    }
    // More insights...
  ]
}
`;

    // Call Anthropic's Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": anthropicApiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Anthropic API error:", errorData);
      throw new Error(`Anthropic API returned ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const claudeResponse = await response.json();
    console.log("Claude response received");

    // Extract the JSON response from Claude
    const textResponse = claudeResponse.content[0].text;
    
    // Find and extract the JSON part from Claude's response
    const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || 
                     textResponse.match(/\{[\s\S]*?\}/);
                     
    let parsedInsights;
    
    if (jsonMatch) {
      try {
        // Use the first match, which should be the entire JSON structure
        const jsonString = jsonMatch[1] || jsonMatch[0];
        parsedInsights = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("Error parsing JSON from Claude response:", parseError);
        throw new Error("Failed to parse Claude response as JSON");
      }
    } else {
      console.error("No JSON found in Claude response");
      throw new Error("Claude response did not contain valid JSON");
    }

    // Process the insights to add additional metadata
    const processedInsights = parsedInsights.insights.map((insight: any) => {
      // Generate random ID if not provided
      if (!insight.id) {
        insight.id = `ws_${Math.random().toString(36).substring(2, 11)}`;
      }
      
      // Add timestamp
      insight.createdAt = new Date().toISOString();
      
      // Add website-derived flag to the summary
      if (insight.content && insight.content.summary) {
        insight.content.summary = `🌐 [Website-derived] ${insight.content.summary}`;
      }
      
      return insight;
    });

    return new Response(
      JSON.stringify({ 
        insights: processedInsights,
        source: "claude-website-analysis"
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in website analysis function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred during website analysis",
        fallback: true
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
        status: 500
      }
    );
  }
});
