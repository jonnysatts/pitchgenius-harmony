
/**
 * Process insights from Claude API response
 */
export function parseClaudeResponse(completion: string): any[] {
  try {
    // Extract JSON from the response
    const jsonMatch = completion.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      // Parse the JSON array
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Could not extract JSON array from response');
    }
  } catch (parseError) {
    console.error('Error parsing Claude response:', parseError);
    
    // Try a more lenient approach to find and parse JSON objects
    try {
      const jsonStart = completion.indexOf('[');
      const jsonEnd = completion.lastIndexOf(']');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = completion.substring(jsonStart, jsonEnd + 1);
        return JSON.parse(jsonStr);
      } else {
        throw new Error('Could not find JSON array in response');
      }
    } catch (fallbackError) {
      console.error('Fallback parsing also failed:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Process insights to ensure they have required fields
 */
export function processInsights(insights: any[]): any[] {
  return insights.map(insight => {
    // Generate an ID if one wasn't provided
    if (!insight.id) {
      const category = insight.category || 'general';
      insight.id = `website-${category}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    
    // Set default values for missing fields
    return {
      ...insight,
      confidence: insight.confidence || 80,
      needsReview: insight.needsReview !== undefined ? insight.needsReview : true,
      content: {
        ...(insight.content || {}),
        title: insight.content?.title || `Website Analysis: ${insight.category}`,
        summary: insight.content?.summary || `Analysis of website.`,
        details: insight.content?.details || 'No specific details found on the website.',
        recommendations: insight.content?.recommendations || 'Consider how this insight could be leveraged in gaming context.'
      }
    };
  });
}
