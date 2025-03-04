
/**
 * Service for parsing Claude API responses
 */

/**
 * Parse Claude's response text into structured data
 */
export function parseClaudeResponse(responseText: string): any[] {
  console.log('Parsing Claude response...');
  
  try {
    // First try to extract JSON if it's wrapped in markdown code blocks
    let jsonString = responseText;
    
    // Check for markdown code blocks (```json ... ```)
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
      console.log('Extracted JSON from code block');
    }
    
    // Parse the JSON
    const parsedData = JSON.parse(jsonString);
    
    // Check if the expected structure exists
    if (!parsedData.insights || !Array.isArray(parsedData.insights)) {
      console.error('Invalid response structure - missing insights array:', parsedData);
      return [];
    }
    
    // Add IDs if they're missing
    parsedData.insights = parsedData.insights.map((insight: any, index: number) => {
      if (!insight.id) {
        insight.id = `insight_${Date.now()}_${index}`;
      }
      return insight;
    });
    
    console.log(`Successfully parsed ${parsedData.insights.length} insights`);
    return parsedData.insights;
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    console.error('Response text sample:', responseText.substring(0, 500) + '...');
    return [];
  }
}
