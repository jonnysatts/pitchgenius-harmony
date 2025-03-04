
/**
 * Service for interacting with Claude API
 */

import { verifyAnthropicApiKey } from './keyValidation.ts';
import { callClaudeAPI } from './apiClient.ts';
import { parseClaudeResponse } from './responseParser.ts';
import { generateSystemPrompt } from './promptGenerator.ts';

/**
 * Re-export key validation function for external use
 */
export { verifyAnthropicApiKey } from './keyValidation.ts';

/**
 * Call Claude API to analyze content and return structured insights
 */
export async function callAnthropicAPI(content: string, clientIndustry: string): Promise<any> {
  console.log(`Calling Claude API for analysis in ${clientIndustry} industry`);
  
  // Get the system prompt
  const systemPrompt = generateSystemPrompt(clientIndustry);
  
  try {
    // Call the Claude API
    const responseData = await callClaudeAPI(systemPrompt, content);
    
    // Parse the JSON from Claude's content
    return parseClaudeResponse(responseData);
  } catch (error) {
    console.error('Error in callAnthropicAPI:', error);
    throw error;
  }
}
