
/**
 * Generate prompts for Claude API
 */

/**
 * Generate the system prompt for Claude
 */
export function generateSystemPrompt(
  clientIndustry: string,
  projectTitle: string = '',
  maximumResponseTime: number = 90
): string {
  return `
You are an expert strategic analyst specializing in gaming and gamification strategies.
Your task is to analyze business documents and identify strategic insights related to gaming opportunities.

${getIndustrySpecificContext(clientIndustry)}

Focus on finding:
1. Business challenges that can be solved through gamification
2. Audience gaps that can be filled with gaming elements 
3. Competitive threats that can be addressed through gaming
4. Specific gaming opportunities that could benefit the client
5. Strategic recommendations for implementation
6. Key narratives that could form presentation slides

Project details:
- Industry: ${clientIndustry}
- Project title: ${projectTitle || 'Gaming Strategy Analysis'}

Your response MUST be structured as a valid JSON array of insight objects. Each insight should include:
1. id - A unique identifier string
2. category - One of: "business_challenges", "audience_gaps", "competitive_threats", "gaming_opportunities", "strategic_recommendations", "key_narratives"
3. title - A clear, concise title
4. content - Detailed description with evidence from the documents
5. confidence - A number between 70 and 100 indicating your confidence in this insight

You have ${maximumResponseTime} seconds to respond. If you cannot complete a thorough analysis in that time,
provide the highest quality insights you can within the time constraint.

IMPORTANT: Format your entire response as valid JSON. Wrap it in a code block with ```json and ``` markers.
`.trim();
}

/**
 * Generate the user prompt with document content
 */
export function generatePrompt(
  documentContents: any[],
  clientIndustry: string = 'technology',
  clientWebsite: string = '',
  projectTitle: string = '',
  processingMode: string = 'comprehensive'
): string {
  // Format document summaries
  const formattedDocuments = formatDocumentSummaries(documentContents);
  
  // Add website context if available
  const websiteContext = clientWebsite 
    ? `\n\nClient website: ${clientWebsite}. Please consider any relevant information from the website in your analysis.` 
    : '';
  
  // Get processing mode instructions
  const modeInstructions = getProcessingModeInstructions(processingMode);
  
  return `
I need you to analyze these documents for a client in the ${clientIndustry} industry${projectTitle ? ` for project: "${projectTitle}"` : ''}.
The goal is to identify strategic gaming and gamification opportunities for this client.${websiteContext}

${modeInstructions}

DOCUMENT CONTENT TO ANALYZE:
${formattedDocuments}

Format your response as a JSON array of insight objects inside a code block, like this:

\`\`\`json
[
  {
    "id": "unique_id_1",
    "category": "business_challenges",
    "title": "Clear title for this insight",
    "content": "Detailed explanation with evidence from the documents",
    "confidence": 85
  },
  {
    "id": "unique_id_2",
    "category": "audience_gaps",
    "title": "Another clear insight title",
    "content": "Details about this insight with supporting evidence",
    "confidence": 90
  }
]
\`\`\`

Aim for 6-10 high-quality insights across different categories. Each insight should be detailed and specific, not generic.
`.trim();
}

/**
 * Format document content for Claude analysis
 */
export function formatDocumentSummaries(documentContents: any[]): string {
  if (!documentContents || documentContents.length === 0) {
    return "No document content provided.";
  }
  
  // Sort by priority if available
  const sortedContents = [...documentContents].sort((a, b) => 
    (b.priority || 0) - (a.priority || 0)
  );
  
  // Calculate total content length for potential truncation
  let totalLength = 0;
  const MAX_CONTENT_LENGTH = 85000; // Safe limit for Claude's context window
  
  return sortedContents.map((doc, index) => {
    // Check if we should truncate individual large documents
    let content = doc.content || '';
    
    // If this document would push us over the limit, truncate it
    if (totalLength + content.length > MAX_CONTENT_LENGTH) {
      const remainingSpace = Math.max(0, MAX_CONTENT_LENGTH - totalLength);
      if (remainingSpace > 1000) { // Only include if we can get meaningful content
        content = content.substring(0, remainingSpace) + "\n[Content truncated due to size limits]";
      } else {
        content = "[Content omitted due to size limits]";
      }
    }
    
    totalLength += content.length;
    
    return `
----- DOCUMENT ${index + 1}: ${doc.name || 'Untitled'} -----
Type: ${doc.type || 'Unknown'}
Priority: ${doc.priority || 'Normal'}

${content}
`.trim();
  }).join("\n\n---\n\n");
}

/**
 * Get processing mode specific instructions
 */
function getProcessingModeInstructions(mode: string): string {
  switch (mode.toLowerCase()) {
    case 'quick':
      return "Perform a rapid analysis focusing on the most prominent insights. Aim for 4-6 key insights.";
    case 'comprehensive':
      return "Perform a thorough analysis of all documents. Focus on depth and quality rather than quantity.";
    case 'focused':
      return "Focus specifically on actionable gaming opportunities and quick wins the client could implement.";
    default:
      return "Analyze these documents thoroughly to extract strategic gaming insights.";
  }
}

/**
 * Get industry-specific context for the system prompt
 */
function getIndustrySpecificContext(industry: string): string {
  const industries: Record<string, string> = {
    'retail': `
Since this client is in the retail industry, focus on:
- How gaming can enhance the in-store and online shopping experience
- Opportunities for limited edition products with gaming themes
- How gaming creators could showcase products authentically
- Gamification of loyalty programs and shopping experiences
`,
    'finance': `
Since this client is in the finance industry, focus on:
- Financial literacy gamification opportunities
- Gen Z attitudes toward traditional banking
- Opportunities for rewards programs tied to gaming
- How financial tools could integrate with gaming ecosystems
`,
    'technology': `
Since this client is in the technology industry, focus on:
- How product demonstrations could leverage gaming elements
- Integration opportunities with streaming platforms
- Gaming as a showcase for technical capabilities
- Gaming community influencers as technical advocates
`,
    'entertainment': `
Since this client is in the entertainment industry, focus on:
- Narrative extensions into gaming
- Character/IP integration opportunities
- Crossover audience potential
- Transmedia storytelling opportunities
`,
    'gaming': `
Since this client is already in the gaming industry, focus on:
- Audience expansion opportunities
- Community building strategies
- Competitive positioning against other gaming brands
- Cross-promotion with non-gaming brands
`,
    'healthcare': `
Since this client is in the healthcare industry, focus on:
- Health education through gamification
- Patient engagement opportunities
- Wellness tracking and rewards
- Community building around health goals
`
  };
  
  return industries[industry.toLowerCase()] || `
For this client in the ${industry} industry, focus on:
- Identifying business challenges that gaming could solve
- Spotting gaps in reaching younger/gaming audiences
- Finding competitive threats from more gaming-savvy brands
- Discovering untapped opportunities within gaming communities
`;
}
