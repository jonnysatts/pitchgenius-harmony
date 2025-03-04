
/**
 * Service for interacting with Anthropic Claude API
 */
import { callClaudeAPI } from './apiClient.ts';

/**
 * Generate system prompt for Claude to analyze website content
 */
function generateSystemPrompt(clientIndustry: string, clientName: string = ''): string {
  return `You are an expert strategic consultant specializing in ${clientIndustry}. 
Your task is to analyze website content for ${clientName || 'a client'} and identify key strategic insights.
Provide specific, actionable insights in JSON format according to the exact structure requested.
Your insights should be specific to the ${clientIndustry} industry and based solely on the website content provided.
Be objective and balanced in your analysis, highlighting both strengths and areas for improvement.`;
}

/**
 * Generate user prompt for Claude to analyze website content
 */
function generatePrompt(websiteContent: string, clientIndustry: string): string {
  return `I need you to analyze this website content for a client in the ${clientIndustry} industry.

WEBSITE CONTENT:
${websiteContent.substring(0, 50000)}

Based on this content, generate strategic insights structured as JSON in the following format:
\`\`\`json
{
  "insights": [
    {
      "id": "unique_id_1",
      "category": "business_opportunities",
      "content": {
        "title": "Key insight title",
        "summary": "Brief summary of the insight",
        "details": "More detailed explanation of the insight",
        "evidence": "Evidence from the website content",
        "recommendations": "Strategic recommendations",
        "impact": "Potential business impact"
      },
      "confidence": 85,
      "needsReview": false,
      "source": "website"
    },
    // More insights...
  ]
}
\`\`\`

Generate exactly 6 insights, one for each of these categories:
1. business_imperatives
2. audience_insights
3. competitive_positioning
4. growth_opportunities
5. strategic_recommendations
6. key_narratives

Your insights must be specific to the website content provided, not generic advice. Focus on concrete details from the website.
ONLY output the JSON, nothing else.`;
}

/**
 * Analyze website content using Claude API
 */
export async function analyzeWebsiteWithAnthropic(
  websiteContent: string,
  customSystemPrompt: string = '',
  clientName: string = '',
  clientIndustry: string = 'technology'
): Promise<string> {
  console.log(`Analyzing website content with Claude. Industry: ${clientIndustry}, Content length: ${websiteContent.length} chars`);
  
  // Generate the prompts
  const systemPrompt = customSystemPrompt || generateSystemPrompt(clientIndustry, clientName);
  const userPrompt = generatePrompt(websiteContent, clientIndustry);
  
  // Call Claude API
  try {
    console.log('Sending request to Claude API...');
    
    const claudeResponse = await callClaudeAPI(
      websiteContent, 
      systemPrompt,
      userPrompt,
      'claude-3-sonnet-20240229',  // Model
      0.3,                         // Temperature
      4000                         // Max tokens
    );
    
    // Parse the response to ensure it's valid JSON
    try {
      // Try to extract JSON from response if it's wrapped in markdown code blocks
      let jsonContent = claudeResponse;
      
      // Remove markdown code blocks if present
      const jsonMatch = claudeResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonContent = jsonMatch[1];
      }
      
      // Check if it's valid JSON
      JSON.parse(jsonContent);
      
      console.log('Successfully validated Claude response as valid JSON');
      return jsonContent;
    } catch (jsonError) {
      console.error('Error parsing Claude response as JSON:', jsonError);
      console.error('Claude response:', claudeResponse.substring(0, 500) + '...');
      
      // Return a valid JSON error response
      return JSON.stringify({
        error: "Failed to parse Claude response as valid JSON",
        insights: []
      });
    }
  } catch (error) {
    console.error('Error calling Claude API:', error);
    
    // Return a valid JSON error response
    return JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
      insights: []
    });
  }
}
