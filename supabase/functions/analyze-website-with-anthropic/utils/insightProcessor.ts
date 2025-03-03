
/**
 * Utility to process Claude's response into structured insights
 */

// Parse the Claude response into a structured array of insights
export function parseClaudeResponse(claudeResponse: string): any[] {
  try {
    console.log("Processing Claude response");
    
    // Find JSON array in the response
    const jsonStartRegex = /\[\s*{/;
    const jsonEndRegex = /}\s*\]/;
    
    let jsonStartMatch = claudeResponse.match(jsonStartRegex);
    let jsonEndMatch = claudeResponse.match(jsonEndRegex);
    
    if (!jsonStartMatch || !jsonEndMatch) {
      console.error("Could not find JSON structure in Claude response");
      throw new Error("Unexpected response format from Claude");
    }
    
    // Extract the JSON portion from the response
    const jsonStart = jsonStartMatch.index;
    const jsonEnd = jsonEndMatch.index + jsonEndMatch[0].length;
    
    if (jsonStart === undefined || jsonEnd === undefined) {
      throw new Error("Failed to locate JSON boundaries in Claude response");
    }
    
    const jsonString = claudeResponse.substring(jsonStart, jsonEnd);
    console.log("Extracted JSON string of length:", jsonString.length);
    
    // Parse the JSON
    const insights = JSON.parse(jsonString);
    
    if (!Array.isArray(insights)) {
      throw new Error("Parsed result is not an array");
    }
    
    return insights;
  } catch (error) {
    console.error("Error parsing Claude response:", error);
    console.log("Claude response excerpt:", claudeResponse.substring(0, 200) + "...");
    throw error;
  }
}

// Process insights to ensure they have all required fields and proper formatting
export function processInsights(rawInsights: any[]): any[] {
  try {
    console.log("Processing insights array:", rawInsights.length);
    
    return rawInsights.map((insight, index) => {
      // Generate a timestamp-based ID if not present
      if (!insight.id) {
        const timestamp = Date.now();
        insight.id = `website-${insight.category || 'general'}-${timestamp}-${index}`;
      }
      
      // Ensure category is set
      if (!insight.category) {
        console.log("Missing category for insight:", insight.id);
        insight.category = 'company_positioning';
      }
      
      // Ensure confidence is within range
      if (!insight.confidence || typeof insight.confidence !== 'number') {
        insight.confidence = 75;
      } else {
        insight.confidence = Math.max(60, Math.min(95, insight.confidence));
      }
      
      // Set needsReview if not present
      if (typeof insight.needsReview !== 'boolean') {
        insight.needsReview = true;
      }
      
      // Initialize content object if not present
      if (!insight.content) {
        insight.content = {};
      }
      
      // Set default title if not present
      if (!insight.content.title) {
        insight.content.title = `Insight about ${insight.category}`;
      }
      
      // Set default summary if not present
      if (!insight.content.summary) {
        insight.content.summary = "[Website-derived] Analysis based on website content";
      } else if (!insight.content.summary.includes("[Website-derived]")) {
        insight.content.summary = `[Website-derived] ${insight.content.summary}`;
      }
      
      // Set default details if not present
      if (!insight.content.details) {
        insight.content.details = "No specific details were extracted from the website.";
      }
      
      // Set default recommendations if not present
      if (!insight.content.recommendations) {
        insight.content.recommendations = "Consider exploring gaming integration opportunities based on the website analysis.";
      }
      
      // Set source to website
      insight.source = 'website';
      
      return insight;
    });
  } catch (error) {
    console.error("Error processing insights:", error);
    throw error;
  }
}
