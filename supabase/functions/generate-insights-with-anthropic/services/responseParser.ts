
/**
 * Service for parsing Claude API responses
 */

// Enable debug mode for detailed logging
const DEBUG_MODE = true;

/**
 * Parse Claude's response text into structured data
 */
export function parseClaudeResponse(responseText: string): any[] {
  if (DEBUG_MODE) {
    console.log('🔄 Parsing Claude response...');
    console.log('📄 Response length:', responseText.length);
    console.log('📄 Response sample:', responseText.substring(0, 200) + '...');
  }
  
  try {
    // First try to extract JSON if it's wrapped in markdown code blocks
    let jsonString = responseText;
    
    // Try multiple approaches to extract JSON
    
    // Approach 1: Check for markdown code blocks (```json ... ```)
    const jsonBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      jsonString = jsonBlockMatch[1];
      if (DEBUG_MODE) console.log('📄 Extracted JSON from code block, length:', jsonString.length);
    } 
    // Approach 2: Look for a JSON object structure with insights
    else {
      const possibleJsonMatch = responseText.match(/{[\s\S]*"insights"[\s\S]*?}/);
      if (possibleJsonMatch) {
        jsonString = possibleJsonMatch[0];
        if (DEBUG_MODE) console.log('📄 Extracted JSON object by pattern matching, length:', jsonString.length);
      }
    }
    
    // Try to clean up the JSON string
    jsonString = jsonString.trim();
    
    // Log the extracted JSON string for debugging
    if (DEBUG_MODE) {
      console.log('📄 Extracted JSON string (first 200 chars):', jsonString.substring(0, 200) + '...');
    }
    
    // Try to parse the JSON with detailed error handling
    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
      if (DEBUG_MODE) console.log('✅ Successfully parsed JSON on first attempt');
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      if (DEBUG_MODE) console.log('🔄 Attempting to fix common JSON issues...');
      
      // Try to fix common JSON issues
      const fixedJsonString = jsonString
        .replace(/(\w+):/g, "\"$1\":") // Add quotes around keys
        .replace(/,\s*}/g, "}") // Remove trailing commas
        .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
        .replace(/'/g, "\"")    // Replace single quotes with double quotes
        .replace(/\n/g, " ");   // Remove newlines which can cause parsing issues
      
      if (DEBUG_MODE) {
        console.log('📄 Fixed JSON string (first 200 chars):', fixedJsonString.substring(0, 200) + '...');
      }
      
      try {
        parsedData = JSON.parse(fixedJsonString);
        if (DEBUG_MODE) console.log('✅ Successfully parsed JSON after fixing format issues');
      } catch (fixError) {
        console.error('❌ Failed to fix JSON:', fixError);
        
        // Last resort: Try to extract just the insights array
        if (DEBUG_MODE) console.log('🔄 Attempting to extract just the insights array...');
        const insightsArrayMatch = responseText.match(/"insights"\s*:\s*\[([\s\S]*?)\]/);
        if (insightsArrayMatch && insightsArrayMatch[1]) {
          try {
            const insightsArrayText = `[${insightsArrayMatch[1]}]`;
            if (DEBUG_MODE) console.log('📄 Extracted insights array text:', insightsArrayText.substring(0, 100) + '...');
            
            // Fix potential issues in the array
            const fixedArrayText = insightsArrayText
              .replace(/'/g, "\"")
              .replace(/(\w+):/g, "\"$1\":")
              .replace(/,\s*]/g, "]");
              
            const insightsArray = JSON.parse(fixedArrayText);
            if (DEBUG_MODE) console.log('✅ Successfully extracted insights array directly');
            return insightsArray;
          } catch (arrayError) {
            console.error('❌ Failed to extract insights array:', arrayError);
          }
        }
        
        // Try another approach with a more lenient regex
        if (DEBUG_MODE) console.log('🔄 Trying more lenient regex pattern...');
        try {
          // Look for any array structure that might contain our insights
          const anyArrayMatch = responseText.match(/\[([\s\S]*?)\]/);
          if (anyArrayMatch && anyArrayMatch[1]) {
            const possibleArray = `[${anyArrayMatch[1]}]`;
            const arrayData = JSON.parse(possibleArray);
            if (Array.isArray(arrayData) && arrayData.length > 0) {
              if (DEBUG_MODE) console.log('✅ Found an array structure, using it as insights');
              return arrayData;
            }
          }
        } catch (lenientError) {
          console.error('❌ Lenient parsing approach failed:', lenientError);
        }
        
        // If all parsing attempts fail, return an empty array
        console.error('❌ All parsing attempts failed, returning empty array');
        return [];
      }
    }
    
    // Check if the expected structure exists
    if (!parsedData.insights && !Array.isArray(parsedData)) {
      console.error('❌ Invalid response structure - missing insights array:', 
                    Object.keys(parsedData));
      
      // Try to convert the structure if possible
      if (Array.isArray(parsedData)) {
        if (DEBUG_MODE) console.log('✅ Data is an array, using as insights directly');
        return parsedData;
      } else {
        console.error('❌ Could not find or create a valid insights array structure');
        // Create a default structure
        return [];
      }
    }
    
    // Return the insights array if it exists, otherwise return the parsed data directly
    const insightsArray = parsedData.insights || parsedData;
    
    // Add IDs if they're missing
    const timestamp = Date.now();
    const processedInsights = Array.isArray(insightsArray) ? insightsArray.map((insight: any, index: number) => {
      if (!insight.id) {
        insight.id = `insight_${timestamp}_${index}`;
      }
      return insight;
    }) : [];
    
    if (DEBUG_MODE) console.log(`✅ Successfully parsed ${processedInsights.length} insights`);
    return processedInsights;
  } catch (error) {
    console.error('❌ Error parsing Claude response:', error);
    console.error('📄 Response text sample:', responseText.substring(0, 500) + '...');
    return [];
  }
}
