
/**
 * Process and normalize the Claude response
 */
export function parseClaudeResponse(claudeResponse: string): any[] {
  try {
    // Extract JSON from Claude's response
    // Claude might wrap the JSON in text, markdown code blocks, etc.
    const jsonMatches = claudeResponse.match(/\[[\s\S]*?\]/g);
    
    if (!jsonMatches || jsonMatches.length === 0) {
      console.error('No JSON array found in Claude response');
      throw new Error('No JSON array found in Claude response');
    }
    
    // Find the longest JSON match which is likely the insights array
    let longestMatch = '';
    for (const match of jsonMatches) {
      if (match.length > longestMatch.length) {
        longestMatch = match;
      }
    }
    
    // Parse the JSON
    const insights = JSON.parse(longestMatch);
    
    if (!Array.isArray(insights)) {
      console.error('Parsed content is not an array:', insights);
      throw new Error('Parsed content from Claude is not an array');
    }
    
    console.log(`Successfully parsed ${insights.length} insights from Claude response`);
    return insights;
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    console.error('Raw Claude response:', claudeResponse);
    throw new Error(`Failed to parse Claude response: ${error.message}`);
  }
}

/**
 * Process insights to ensure they have all required fields
 */
export function processInsights(insights: any[]): any[] {
  return insights.map(insight => {
    // Generate a unique ID if one doesn't exist
    const id = insight.id || `website-${insight.category || 'general'}-${Date.now()}`;
    
    // Ensure all required fields are present
    return {
      id,
      source: 'website',
      category: insight.category || 'company_positioning',
      confidence: insight.confidence || 75,
      needsReview: insight.needsReview !== undefined ? insight.needsReview : true,
      content: {
        title: insight.content?.title || 'Website Analysis Insight',
        summary: insight.content?.summary || 'Analysis from website content',
        details: insight.content?.details || 'No specific details available',
        recommendations: insight.content?.recommendations || 'No specific recommendations available',
      }
    };
  });
}
