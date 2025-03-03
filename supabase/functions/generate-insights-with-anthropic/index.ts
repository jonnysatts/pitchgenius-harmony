
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

if (!ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set in environment variables");
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, documentIds, clientIndustry, projectTitle, documentContents } = await req.json();

    if (!projectId) {
      throw new Error("projectId is required");
    }

    console.log(`Processing project ${projectId} with ${documentIds?.length || 0} documents for ${clientIndustry} industry`);

    // When documents are sent from the frontend, they might not have their content
    // In a real application, you'd retrieve the document contents from a database or storage
    // For this example, we'll use the documentContents provided

    if (!documentContents || documentContents.length === 0) {
      console.log("No document contents provided, generating mock insights based on project details");
    } else {
      console.log(`Analyzing ${documentContents.length} document contents`);
    }

    // Format document contents for the prompt
    const documentSummary = documentContents
      ? documentContents.map((doc, index) => 
          `Document ${index + 1}: ${doc.name}\n${doc.content.substring(0, 1000)}${doc.content.length > 1000 ? '...' : ''}`
        ).join("\n\n")
      : "No document content provided for analysis.";

    // Create a prompt for Claude that explains what we want
    const prompt = `
You are a gaming strategy consultant specializing in helping companies implement gaming mechanics and strategies in non-gaming industries. You're analyzing documents for a project with the following details:

Industry: ${clientIndustry || "unknown"}
Project: ${projectTitle || "Strategic Gaming Implementation"}

Based on the following documents and information, generate strategic insights for gaming implementation opportunities:

${documentSummary}

Generate a set of strategic insights categorized as follows:
1. Business Challenges: What core business problems could gaming solutions address?
2. Audience Gaps: Where is the client failing to engage their audience effectively?
3. Competitive Threats: How are competitors using engagement techniques better?
4. Gaming Opportunities: What specific gaming mechanics would work well?
5. Strategic Recommendations: What are the top strategic moves to make?
6. Key Narratives: What storytelling approaches would resonate most?

For each category, provide 2-3 insights with the following structure:
- Title: Brief title of the insight
- Summary: One sentence summary
- Details: Expanded explanation of the insight
- Evidence: What evidence from the documents supports this
- Impact: Why this matters to the business
- Recommendations: Specific action steps
- Data Points: 2-3 key metrics or data points that support this insight

Structure the response as JSON with each insight having a unique ID, category, content (with the above structure), confidence score (70-99), and needsReview flag (boolean based on confidence < 85).
`;

    // Call Claude API 
    console.log("Calling Anthropic API...");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error from Anthropic API:", errorData);
      throw new Error(`Anthropic API responded with status ${response.status}: ${errorData}`);
    }

    const anthropicResponse = await response.json();
    console.log("Received response from Anthropic API");

    // Extract the content from Claude's response
    const content = anthropicResponse.content[0].text;

    // Try to parse the JSON from Claude's response
    let insights;
    try {
      // Find JSON in the response - Claude sometimes adds explanatory text
      const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) || 
                        content.match(/\{[\s\S]*\}/);
      
      const jsonContent = jsonMatch 
        ? jsonMatch[1] || jsonMatch[0]
        : content;
      
      insights = JSON.parse(jsonContent);
      
      if (!Array.isArray(insights)) {
        // If Claude returned an object with an insights array
        insights = insights.insights || insights.results || [];
      }
      
      console.log(`Successfully parsed ${insights.length} insights from Anthropic response`);
    } catch (error) {
      console.error("Failed to parse JSON from Anthropic response:", error);
      console.log("Raw response:", content);
      
      // Fallback to a simpler parsing approach
      try {
        const simplifiedContent = content.replace(/```json|```/g, '').trim();
        insights = JSON.parse(simplifiedContent);
        if (!Array.isArray(insights)) {
          insights = insights.insights || insights.results || [];
        }
      } catch (secondError) {
        console.error("Also failed simplified parsing:", secondError);
        throw new Error("Could not parse response from Anthropic API");
      }
    }

    // Return the insights
    return new Response(
      JSON.stringify({
        insights,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error in generate-insights-with-anthropic function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An unexpected error occurred",
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
