
/**
 * Service for interacting with Claude API
 */

// Verify the Anthropic API key
export function verifyAnthropicApiKey(): boolean {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY environment variable is not set');
    return false;
  }
  
  if (!apiKey.startsWith('sk-ant-')) {
    console.error('ANTHROPIC_API_KEY does not have the expected format (should start with sk-ant-)');
    return false;
  }
  
  console.log('API key verification passed');
  return true;
}

export async function callAnthropicAPI(content: string, clientIndustry: string): Promise<any> {
  console.log(`Calling Claude API for analysis in ${clientIndustry} industry`)
  
  // First verify the API key
  if (!verifyAnthropicApiKey()) {
    throw new Error('Invalid or missing Anthropic API key. Please check your ANTHROPIC_API_KEY in Supabase secrets.');
  }
  
  const systemPrompt = `You are an expert strategic consultant from Games Age, a gaming consultancy that helps businesses integrate gaming into their strategy. 
  
Your job is to analyze client documents and generate strategic insights about how they can leverage gaming in their business.

For a ${clientIndustry} company, examine the provided documents and extract key insights into these categories:
1. Business challenges that could be addressed through gaming
2. Audience engagement gaps that gaming could fill
3. Competitive threats that gaming integration could mitigate
4. Strategic gaming opportunities ranked by potential impact
5. Specific recommendations (both quick wins and long-term)
6. Key narratives to use when pitching gaming solutions

For each insight:
- Assign a confidence score (1-100%) based on how clearly the documents support the insight
- Flag insights below 70% confidence as "needsReview: true"
- Structure content with a clear title, summary, and supporting details or bullet points
- Focus on actionable, specific insights rather than generic statements

YOUR OUTPUT MUST BE VALID JSON in this exact format:
{
  "insights": [
    {
      "id": "string unique ID",
      "category": "one of: business_challenges, audience_gaps, competitive_threats, gaming_opportunities, strategic_recommendations, key_narratives",
      "content": {
        "title": "Clear, concise title",
        "summary": "1-2 sentence summary",
        "details": "Longer explanation if needed",
        "points": ["Array of bullet points if applicable"]
      },
      "confidence": number between 1-100,
      "needsReview": boolean
    }
  ]
}`

  try {
    // Using direct fetch approach instead of the SDK
    console.log('Making direct API call to Claude API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.2
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      throw new Error(`Claude API HTTP error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Claude response received');
    
    // Parse the JSON from Claude's content (updated for Messages API)
    try {
      // Check for valid response structure
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('Invalid response structure from Claude API');
      }
      
      const content = data.content[0].text;
      console.log('Claude raw response:', content.substring(0, 200) + '...');
      
      // Try multiple regex patterns to extract the JSON
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                       content.match(/\{\s*"insights":\s*\[[\s\S]*\]\s*\}/) ||
                       [null, content];
                       
      const jsonText = jsonMatch[1]?.trim() || content.trim();
      console.log('Extracted JSON text:', jsonText.substring(0, 200) + '...');
      
      try {
        return JSON.parse(jsonText);
      } catch (innerParseError) {
        console.error('First JSON parse attempt failed:', innerParseError);
        // Try a fallback approach to extract just the insights array
        const insightsMatch = content.match(/"insights"\s*:\s*(\[\s*\{[\s\S]*?\}\s*\])/);
        if (insightsMatch && insightsMatch[1]) {
          console.log('Attempting to parse just the insights array');
          const insightsArray = JSON.parse(insightsMatch[1]);
          return { insights: insightsArray };
        }
        throw innerParseError;
      }
    } catch (parseError) {
      console.error('Error parsing Claude response as JSON:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}
