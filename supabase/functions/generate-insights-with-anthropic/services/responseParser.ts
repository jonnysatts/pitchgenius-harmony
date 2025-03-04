
/**
 * Parse and format Claude API responses
 */

/**
 * Parse Claude's response text into strategic insights
 */
export function parseClaudeResponse(responseText: string) {
  try {
    // First, try to extract a JSON array or object from the response
    const jsonMatch = responseText.match(/```json([\s\S]*?)```/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        // Try to parse the extracted JSON
        const jsonData = JSON.parse(jsonMatch[1].trim());
        
        // Check if we have an array of insights
        if (Array.isArray(jsonData)) {
          console.log(`Found JSON array with ${jsonData.length} insights`);
          return jsonData;
        }
        
        // If it's an object with an insights property that's an array
        if (jsonData.insights && Array.isArray(jsonData.insights)) {
          console.log(`Found JSON object with ${jsonData.insights.length} insights`);
          return jsonData.insights;
        }
        
        // If it's a single insight object, wrap it in an array
        if (jsonData.title || jsonData.content || jsonData.category) {
          console.log('Found single JSON insight object');
          return [jsonData];
        }
      } catch (jsonError) {
        console.error('Error parsing JSON from response:', jsonError);
        // Continue to fallback parsing if JSON parsing fails
      }
    }
    
    // If JSON extraction/parsing failed, try to parse structured text
    console.log('Falling back to structured text parsing');
    return parseStructuredTextResponse(responseText);
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    return [];
  }
}

/**
 * Parse a structured text response from Claude
 */
function parseStructuredTextResponse(responseText: string) {
  // Split by numbered or titled insights
  const insightPattern = /\n\s*(?:Insight\s*#?\s*\d+|Strategic Insight\s*#?\s*\d+|#\d+|INSIGHT\s*\d+)[\s:-]*(.*?)(?=\n\s*(?:Insight\s*#?\s*\d+|Strategic Insight\s*#?\s*\d+|#\d+|INSIGHT\s*\d+)|\n\s*$|$)/gis;
  
  const insights = [];
  let match;
  
  while ((match = insightPattern.exec(responseText)) !== null) {
    const insightText = match[0].trim();
    
    // Extract title, category, and content
    const titleMatch = insightText.match(/^(?:Insight\s*#?\s*\d+|Strategic Insight\s*#?\s*\d+|#\d+|INSIGHT\s*\d+)[\s:-]*(.+?)(?:\n|$)/i);
    const categoryMatch = insightText.match(/Category[\s:-]*([^\n]+)/i);
    
    // Create the insight object
    const insight = {
      id: `insight_${Date.now()}_${insights.length}`,
      title: titleMatch ? titleMatch[1].trim() : `Insight ${insights.length + 1}`,
      category: categoryMatch ? categoryMatch[1].trim() : 'business_imperatives',
      content: insightText,
      confidence: Math.round(0.7 * 100) / 100,
      source: 'document' as const,
      status: 'pending' as const
    };
    
    insights.push(insight);
  }
  
  // If no insights were found with the pattern, split by newlines and create simpler insights
  if (insights.length === 0) {
    const lines = responseText.split('\n\n').filter(line => line.trim().length > 20);
    
    lines.forEach((line, index) => {
      const insight = {
        id: `insight_${Date.now()}_${index}`,
        title: `Insight ${index + 1}`,
        category: 'business_imperatives',
        content: line.trim(),
        confidence: Math.round(0.6 * 100) / 100,
        source: 'document' as const,
        status: 'pending' as const
      };
      
      insights.push(insight);
    });
  }
  
  return insights;
}
