
/**
 * Extract and parse JSON insights from Claude's text response
 */
export function parseClaudeResponse(messageContent: string): any {
  console.log("Claude response length:", messageContent.length);
  
  // Extract the JSON insights from Claude's text response
  const jsonMatch = messageContent.match(/```json\n([\s\S]*?)\n```/) || 
                    messageContent.match(/{[\s\S]*}/) ||
                    messageContent.match(/\{\s*"insights":\s*\[([\s\S]*?)\]\s*\}/);
                    
  if (!jsonMatch) {
    console.error("Failed to extract JSON from Claude's response");
    throw new Error("Failed to extract insights from AI response");
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
    
    return insightsData;
  } catch (parseError) {
    console.error("JSON parsing error:", parseError);
    throw new Error("Failed to parse AI-generated insights");
  }
}

/**
 * Ensure insights have unique IDs and proper structure
 */
export function processInsights(insights: any[]): any[] {
  if (!insights || insights.length === 0) {
    return [];
  }
  
  // Add unique IDs to insights if not present
  return insights.map((insight: any, index: number) => ({
    id: insight.id || `insight_${Math.random().toString(36).substring(2, 11)}`,
    ...insight
  }));
}
