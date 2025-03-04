
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle requests to the edge function
serve(async (req) => {
  console.log("Edge function received request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { 
      projectId, 
      documentContents, 
      clientIndustry = 'technology', 
      projectTitle = 'Project Analysis',
      maximumResponseTime = 110 // Default to 110 seconds max response time
    } = await req.json();
    
    console.log(`Processing project ${projectId} with ${documentContents?.length || 0} documents`);
    console.log(`Industry: ${clientIndustry}, Project: ${projectTitle}`);
    
    if (!documentContents || documentContents.length === 0) {
      console.error("No document contents provided");
      return new Response(
        JSON.stringify({ error: "No document contents provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Check if required environment variables exist
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Anthropic API key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Process document contents into a combined text for analysis
    // Now documentContents is an array of objects, so we format them accordingly
    const documentSummaries = documentContents.map((doc: any) => 
      `Document ${doc.index}: ${doc.name}\nType: ${doc.type}\nPriority: ${doc.priority || 'normal'}\nContent: ${doc.content.substring(0, 2000)}${doc.content.length > 2000 ? '...(truncated)' : ''}`
    ).join("\n\n");
    
    console.log("Prepared document summaries for Claude");
    console.log(`Total documents being analyzed: ${documentContents.length}`);
    
    // Create a comprehensive system prompt for Claude
    const systemPrompt = `
      You are an expert strategic analyst specializing in gaming and gamification strategies.
      Your task is to analyze business documents and identify strategic insights related to gaming opportunities.
      Focus on finding business challenges that can be solved through gamification,
      audience gaps that can be filled with gaming elements, competitive threats that can be addressed through gaming,
      and specific gaming opportunities that could benefit the client.
      
      Project details:
      - Industry: ${clientIndustry}
      - Project title: ${projectTitle}
      
      For each insight, provide:
      1. A clear title
      2. A concise summary
      3. Detailed analysis with evidence from the documents
      4. Business impact assessment
      5. Specific gaming recommendations
      6. Confidence level (0-100)
      
      You have ${maximumResponseTime} seconds to respond. If you cannot complete a thorough analysis in that time,
      provide the highest quality insights you can within the time constraint.
    `.trim();
    
    // Create the user prompt with document content
    const userPrompt = `
      Please analyze the following ${documentContents.length} documents and generate strategic gaming insights:
      
      ${documentSummaries}
      
      For each insight, follow this structure:
      {
        "category": one of ["business_challenges", "audience_gaps", "competitive_threats", "gaming_opportunities", "strategic_recommendations", "key_narratives"],
        "content": {
          "title": "Clear, concise title for the insight",
          "summary": "Brief 1-2 sentence summary",
          "details": "Detailed explanation with specific evidence",
          "evidence": "Specific findings from the documents that support this insight",
          "impact": "Business impact assessment",
          "recommendations": "Gaming strategy recommendations",
          "dataPoints": ["3-5 key data points or statistics that support this insight"]
        },
        "confidence": number between 70-99,
        "needsReview": boolean based on confidence (true if below 85)
      }
      
      Format your response as valid JSON with an array of insights objects like this:
      {
        "insights": [
          {
            "id": "insight_1",
            "category": "business_challenges",
            "content": { ...insight content as described above... },
            "confidence": 85,
            "needsReview": false
          },
          ...more insights...
        ]
      }
      
      Aim to provide 6-10 comprehensive insights across different categories based on the document content.
      Ensure your insights are specific to the ${clientIndustry} industry and directly related to gaming opportunities.
    `.trim();
    
    console.log("Connecting to Anthropic API");
    
    // Call the Anthropic API (Claude) to generate insights
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${response.status}`, details: errorText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    console.log("Received response from Anthropic API");
    
    // Parse the response from Anthropic
    const anthropicData = await response.json();
    const messageContent = anthropicData.content?.[0]?.text || "";
    console.log("Claude response length:", messageContent.length);
    
    // Extract the JSON insights from Claude's text response
    const jsonMatch = messageContent.match(/```json\n([\s\S]*?)\n```/) || 
                      messageContent.match(/{[\s\S]*}/) ||
                      messageContent.match(/\{\s*"insights":\s*\[([\s\S]*?)\]\s*\}/);
                      
    if (!jsonMatch) {
      console.error("Failed to extract JSON from Claude's response");
      return new Response(
        JSON.stringify({ 
          error: "Failed to extract insights from AI response",
          rawResponse: messageContent.substring(0, 500) + "..." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    try {
      // Try to parse the JSON
      let insightsData;
      try {
        // First try parsing the extracted JSON
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        insightsData = JSON.parse(jsonStr);
      } catch (e) {
        // If that fails, try parsing the whole message
        console.log("First JSON parse failed, trying to parse whole message");
        insightsData = JSON.parse(messageContent);
      }
      
      // Ensure we have the expected format
      const insights = insightsData.insights || [];
      
      // Add unique IDs to insights if not present
      const finalInsights = insights.map((insight: any, index: number) => ({
        id: insight.id || `insight_${Math.random().toString(36).substring(2, 11)}`,
        ...insight
      }));
      
      console.log(`Successfully extracted ${finalInsights.length} insights`);
      
      return new Response(
        JSON.stringify({ insights: finalInsights }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse AI-generated insights",
          details: parseError.message,
          rawResponse: messageContent.substring(0, 500) + "..." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in edge function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
