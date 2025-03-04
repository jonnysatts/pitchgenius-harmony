
/**
 * Utilities for parsing Claude API responses
 */

/**
 * Parse the content from Claude's response into structured JSON 
 */
export function parseClaudeResponse(data: any): any {
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
}
