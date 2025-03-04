
/**
 * Service for interacting with Claude API
 * This is the main integration point that coordinates all Claude-related functionality
 */

import { verifyAnthropicApiKey } from './keyValidation.ts';
import { generateOutputFormat, getHighQualityExamples, getIndustryGamingContext } from './contentTemplates.ts';
import { callClaudeAPI } from './apiClient.ts';

/**
 * Re-export key validation function for external use
 */
export { verifyAnthropicApiKey } from './keyValidation.ts';

/**
 * Call Claude API to analyze website content with improved error handling
 * Using direct fetch approach instead of the SDK
 */
export async function analyzeWebsiteWithAnthropic(
  websiteContent: string,
  systemPrompt: string,
  clientName: string,
  clientIndustry: string
): Promise<string> {
  try {
    // Verify we have minimum content
    if (!websiteContent || websiteContent.length < 50) {
      console.error('Website content is too short for analysis:', websiteContent.length);
      throw new Error('Website content is too short or empty for meaningful analysis');
    }

    // Check content size and truncate if needed to avoid API limits
    const maxContentSize = 25000; // Reduce from previous 50k to ensure we don't hit token limits
    const truncatedContent = websiteContent.length > maxContentSize 
      ? websiteContent.substring(0, maxContentSize) + "\n[Content truncated due to size limits]" 
      : websiteContent;

    console.log(`Content prepared for Claude: ${truncatedContent.length} chars`);
    
    // Log a sample of the content
    console.log(`Content sample: ${truncatedContent.substring(0, 200)}...`);

    // Combine the system prompt with the context and examples
    const industryContext = getIndustryGamingContext(clientIndustry);
    const highQualityExamples = getHighQualityExamples();
    const outputFormat = generateOutputFormat();
    const fullSystemPrompt = `${systemPrompt}\n\n${industryContext}\n\n${outputFormat}\n\n${highQualityExamples}`;
    
    // Create the user prompt with document content
    const userPrompt = `
I need to analyze this website for a strategic gaming partnership opportunity. The website belongs to ${clientName || "a company"} in the ${clientIndustry} industry. 

Here's the website content:

${truncatedContent}

Please analyze this content and generate strategic insights that would help Games Age develop a compelling gaming audience strategy for this client. Focus on identifying specific business challenges, audience opportunities, and activation pathways.
`;
    
    // Call the Claude API through our API client
    return await callClaudeAPI(
      truncatedContent,
      fullSystemPrompt,
      userPrompt,
      'claude-3-sonnet-20240229',
      0.3,
      4000
    );
  } catch (error: any) {
    console.error('Error in analyzeWebsiteWithAnthropic:', error);
    throw error;
  }
}
