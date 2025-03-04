
/**
 * Service for parsing Claude API responses
 */

/**
 * Parse Claude's response text into structured data
 */
export function parseClaudeResponse(responseText: string): any[] {
  console.log('Parsing Claude response...');
  console.log('Response length:', responseText.length);
  
  try {
    // First try to extract JSON if it's wrapped in markdown code blocks
    let jsonString = responseText;
    
    // Log a sample of the response for debugging
    console.log('Response sample:', responseText.substring(0, 200) + '...');
    
    // Try multiple approaches to extract JSON
    
    // Approach 1: Check for markdown code blocks (```json ... ```)
    const jsonBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      jsonString = jsonBlockMatch[1];
      console.log('Extracted JSON from code block, length:', jsonString.length);
    } 
    // Approach 2: Look for a JSON object structure
    else {
      const possibleJsonMatch = responseText.match(/{[\s\S]*"insights"[\s\S]*?}/);
      if (possibleJsonMatch) {
        jsonString = possibleJsonMatch[0];
        console.log('Extracted JSON object by pattern matching, length:', jsonString.length);
      }
    }
    
    // Try to clean up the JSON string
    jsonString = jsonString.trim();
    
    // Try to parse the JSON with detailed error handling
    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
      console.log('Successfully parsed JSON');
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.log('Attempting to fix common JSON issues...');
      
      // Try to fix common JSON issues
      const fixedJsonString = jsonString
        .replace(/(\w+):/g, "\"$1\":") // Add quotes around keys
        .replace(/,\s*}/g, "}") // Remove trailing commas
        .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
        .replace(/'/g, "\""); // Replace single quotes with double quotes
      
      try {
        parsedData = JSON.parse(fixedJsonString);
        console.log('Successfully parsed JSON after fixing format issues');
      } catch (fixError) {
        console.error('Failed to fix JSON:', fixError);
        
        // Last resort: Try to extract just the insights array
        const insightsArrayMatch = responseText.match(/"insights"\s*:\s*\[([\s\S]*?)\]/);
        if (insightsArrayMatch) {
          try {
            const insightsArray = JSON.parse(`[${insightsArrayMatch[1]}]`);
            console.log('Extracted insights array directly');
            return insightsArray;
          } catch (arrayError) {
            console.error('Failed to extract insights array:', arrayError);
          }
        }
        
        // If all parsing attempts fail, throw the original error
        throw parseError;
      }
    }
    
    // Check if the expected structure exists
    if (!parsedData.insights || !Array.isArray(parsedData.insights)) {
      console.error('Invalid response structure - missing insights array:', 
                    Object.keys(parsedData));
      
      // Try to convert the structure if possible
      if (Array.isArray(parsedData)) {
        console.log('Data is an array, using as insights directly');
        parsedData = { insights: parsedData };
      } else {
        // Create a default structure
        return [];
      }
    }
    
    // Add IDs if they're missing
    const timestamp = Date.now();
    parsedData.insights = parsedData.insights.map((insight: any, index: number) => {
      if (!insight.id) {
        insight.id = `insight_${timestamp}_${index}`;
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
