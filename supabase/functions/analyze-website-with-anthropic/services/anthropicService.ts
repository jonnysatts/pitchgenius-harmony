
import { Anthropic } from 'https://esm.sh/@anthropic-ai/sdk@0.6.2';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY') || '',
});

/**
 * Generate the structured output format for Claude
 */
export function generateOutputFormat(): string {
  return `
    Structure your response as a JSON array of insights, with exactly one insight for each of these categories:
    - company_positioning (how they present themselves to the market)
    - competitive_landscape (competitors and market position)
    - key_partnerships (specific partners mentioned)
    - public_announcements (specific news items, dates, announcements)
    - consumer_engagement (how they interact with customers)
    - product_service_fit (how their offerings relate to gaming)
    
    Each insight must follow this format:
    {
      "id": "website-[category]-[timestamp]",
      "category": "One of the six categories listed above",
      "confidence": A number between 60-95 representing how confident you are in this insight,
      "needsReview": true if specificity is low, false if highly specific,
      "content": {
        "title": "A specific title based on actual website content",
        "summary": "A concise summary with SPECIFIC details from the website",
        "details": "Detailed explanation with specific facts, numbers, names, or direct quotes from the website",
        "recommendations": "Gaming-specific recommendations based on the details"
      }
    }
    
    CRITICAL INSTRUCTIONS:
    1. ONLY include information actually present on the website - DO NOT HALLUCINATE or INVENT details
    2. If you cannot find specific information for a category, explicitly note this in the details
    3. Include direct quotes and specific details wherever possible
    4. For recommendations, be specific about gaming integrations
    5. If the content is insufficient, state so clearly in the details field
    6. Include DATES of announcements, NAMES of partners, and SPECIFIC products/services when available
    `;
}

/**
 * Call Claude API to analyze website content
 */
export async function analyzeWebsiteWithAnthropic(
  websiteContent: string,
  systemPrompt: string,
  clientName: string,
  clientIndustry: string
): Promise<string> {
  // Combine the system prompt with the output format
  const fullSystemPrompt = `${systemPrompt}\n\n${generateOutputFormat()}`;
  
  // Call Claude API with the prepared content and prompt
  const completion = await anthropic.completions.create({
    model: 'claude-2.1',
    max_tokens_to_sample: 4000,
    system: fullSystemPrompt,
    prompt: `\n\nHuman: I need to analyze this website for a gaming strategy project. The website belongs to ${clientName || "a company"} in the ${clientIndustry} industry. Here's the website content:\n\n${websiteContent}\n\nPlease analyze this content and generate strategic insights that would be valuable for a gaming company considering a potential partnership. Focus on identifying specific opportunities, challenges, and unique strategic positions.\n\nAssistant: I'll analyze this website content and generate strategic insights with specific details for your gaming client.`,
    temperature: 0.3
  });
  
  return completion.completion;
}
