
import { AnthropicRequestParams } from "../types/anthropicTypes.ts";

/**
 * Call the Anthropic API (Claude) to generate insights
 */
export async function callAnthropicAPI(
  systemPrompt: string,
  userPrompt: string,
  model: string = "claude-3-sonnet-20240229",
  maxTokens: number = 4000
): Promise<Response> {
  console.log("Connecting to Anthropic API");
  
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not found in environment variables");
  }
  
  // Call the Anthropic API (Claude) to generate insights
  return await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt }
      ]
    })
  });
}

/**
 * Verify the Anthropic API key exists
 */
export function verifyAnthropicApiKey(): boolean {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY environment variable is not set");
    return false;
  }
  
  if (!apiKey.startsWith("sk-ant-")) {
    console.error("ANTHROPIC_API_KEY does not have the expected format (should start with sk-ant-)");
    return false;
  }
  
  console.log("API key verification passed");
  return true;
}
