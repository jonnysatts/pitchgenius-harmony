
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System prompt for Claude to generate insights
const SYSTEM_PROMPT = `
You are an expert strategic consultant specialized in gaming and interactive experiences.
Your task is to analyze the provided document content and generate strategic insights 
for how the client could leverage gaming, interactive entertainment, or gamification in their business.

Your analysis should be structured into the following categories:
1. Business Challenges: Identify key problems or challenges the client is facing
2. Audience Gaps: Identify target audiences the client is struggling to reach or engage
3. Competitive Threats: Analyze threats from competitors or market disruptors
4. Gaming Opportunities: Suggest specific ways gaming or interactivity could be leveraged
5. Strategic Recommendations: Provide a phased approach to gaming integration
6. Key Narratives: Suggest storytelling angles and messaging themes

Your insights should be specific, actionable, and tailored to the client's industry and situation.
Format the response as a JSON object with each category as a key, with 'title', 'summary', and 'points' (array) as values.
`;

// Function to split text into chunks that fit in Claude's context window
const chunkText = (text: string, maxChunkSize = 50000): string[] => {
  if (text.length <= maxChunkSize) {
    return [text];
  }
  
  const chunks: string[] = [];
  let currentChunk = "";
  
  // Split by paragraphs to avoid cutting in the middle of sentences
  const paragraphs = text.split("\n");
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 1 > maxChunkSize) {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? "\n" : "") + paragraph;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};

// Process text with Claude API
async function processWithClaude(text: string, systemPrompt: string): Promise<any> {
  console.log("Processing text with Claude API, length:", text.length);
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey!,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Here is the document content to analyze:\n\n${text}`
          }
        ],
        max_tokens: 4000,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Claude API error:", errorData);
      throw new Error(`Claude API returned ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    console.log("Claude API response received");
    
    try {
      // Extract the content as a string
      const content = data.content[0].text;
      
      // Parse the JSON response from the content
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Error parsing Claude response as JSON:", parseError);
      throw new Error("Failed to parse Claude response as JSON");
    }
  } catch (error) {
    console.error("Error calling Claude API:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    const { projectId, documentIds } = await req.json();
    
    if (!projectId || !documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: projectId and documentIds array" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing analysis for project ${projectId} with ${documentIds.length} documents`);
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // In a real implementation, you would fetch the actual documents from Supabase Storage
    // For now, we'll use mock data as a placeholder
    
    // Combine document texts (in a real implementation, this would retrieve actual document content)
    const documentTexts = documentIds.map(id => 
      `Document ${id}: This is sample text for document ${id} related to project ${projectId}. 
      It contains information about the client's business challenges, their target audience, 
      competitive landscape, and potential opportunities for gaming integration.`
    );
    
    const combinedText = documentTexts.join("\n\n");
    const textChunks = chunkText(combinedText);
    
    // For demonstration, we'll just process the first chunk
    // In a real implementation, you might want to process all chunks and combine results
    const chunkResult = await processWithClaude(textChunks[0], SYSTEM_PROMPT);
    
    // Convert results to the expected Strategic Insights format
    const strategicInsights = Object.entries(chunkResult).map(([category, content]: [string, any]) => ({
      id: `insight_${Math.random().toString(36).substring(2, 11)}`,
      category: category,
      content: content,
      confidence: Math.floor(70 + Math.random() * 30), // Simulated confidence score
      needsReview: Math.random() > 0.7 // Some insights may need review
    }));
    
    return new Response(
      JSON.stringify({ insights: strategicInsights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-insights function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
