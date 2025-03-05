
/**
 * Main parser for Claude API responses
 */
import { validateAndFixInsight } from './insightValidator.ts';
import { extractInsightsFromText } from './textExtractor.ts';
import { generateFallbackInsights } from './defaultContentGenerators.ts';

/**
 * Parse Claude's JSON response into structured insights
 * Updated to handle the response format from Messages API
 */
export function parseClaudeResponse(response: string): any[] {
  console.log('Starting to parse Claude response');
  
  try {
    // Attempt multiple JSON extraction strategies
    // First try to find JSON in code blocks
    let jsonStr = '';
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
      console.log(`Found JSON in code block: ${jsonStr.substring(0, 100)}...`);
    } else {
      // Try to find a JSON array directly
      const jsonArrayMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonArrayMatch) {
        jsonStr = jsonArrayMatch[0];
        console.log(`Found JSON array in response: ${jsonStr.substring(0, 100)}...`);
      } else {
        // Look for JSON object with insights array
        const jsonObjMatch = response.match(/\{\s*"insights"\s*:\s*(\[[\s\S]*\])\s*\}/);
        if (jsonObjMatch) {
          jsonStr = jsonObjMatch[1];
          console.log(`Found insights array in JSON object: ${jsonStr.substring(0, 100)}...`);
        } else {
          console.log('No JSON format found, using fallback extraction');
          return extractInsightsFromText(response).map(insight => ({
            ...insight,
            source: 'website' // Ensure source is set
          }));
        }
      }
    }
    
    // Parse the JSON
    try {
      const parsed = JSON.parse(jsonStr);
      
      // Handle both array of insights and object with insights array
      let insights: any[];
      if (Array.isArray(parsed)) {
        insights = parsed;
      } else if (parsed.insights && Array.isArray(parsed.insights)) {
        insights = parsed.insights;
      } else {
        console.error('Parsed JSON is not an array or object with insights array');
        throw new Error('Invalid insight format returned from Claude API');
      }
      
      console.log(`Successfully parsed ${insights.length} insights from JSON`);
      
      // Add source field to each insight - explicitly mark website insights
      const enhancedInsights = insights.map(insight => {
        const validatedInsight = validateAndFixInsight(insight);
        return {
          ...validatedInsight,
          source: 'website'  // Explicitly mark these as website insights
        };
      });
      
      // Validate that we have actual insights
      if (enhancedInsights.length === 0) {
        throw new Error('No insights could be extracted from Claude response');
      }
      
      return enhancedInsights;
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      // Fall back to generated insights
      throw new Error(`Failed to parse Claude response as valid JSON: ${jsonError.message}`);
    }
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw error;
  }
}

// Re-export functions from other modules for backward compatibility
export { processInsights } from './insightValidator.ts';
export { generateFallbackInsights } from './defaultContentGenerators.ts';
