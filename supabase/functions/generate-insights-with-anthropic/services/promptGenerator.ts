
/**
 * Generate the system prompt for Claude
 */
export function generateSystemPrompt(
  clientIndustry: string,
  projectTitle: string,
  maximumResponseTime: number
): string {
  return `
    You are an expert strategic analyst specializing in gaming and gamification strategies.
    Your task is to analyze business documents and identify strategic insights related to gaming opportunities.
    Focus on finding business challenges that can be solved through gamification,
    audience gaps that can be filled with gaming elements, competitive threats that can be addressed through gaming,
    and specific gaming opportunities that could benefit the client.
    
    Project details:
    - Industry: ${clientIndustry}
    - Project title: ${projectTitle}
    
    For each insight, provide:
    1. A clear title
    2. A concise summary
    3. Detailed analysis with evidence from the documents
    4. Business impact assessment
    5. Specific gaming recommendations
    6. Confidence level (0-100)
    
    You have ${maximumResponseTime} seconds to respond. If you cannot complete a thorough analysis in that time,
    provide the highest quality insights you can within the time constraint.
  `.trim();
}

/**
 * Generate the user prompt with document summaries
 */
export function generateUserPrompt(documentSummaries: string, documentCount: number): string {
  return `
    Please analyze the following ${documentCount} documents and generate strategic gaming insights:
    
    ${documentSummaries}
    
    For each insight, follow this structure:
    {
      "category": one of ["business_challenges", "audience_gaps", "competitive_threats", "gaming_opportunities", "strategic_recommendations", "key_narratives"],
      "content": {
        "title": "Clear, concise title for the insight",
        "summary": "Brief 1-2 sentence summary",
        "details": "Detailed explanation with specific evidence",
        "evidence": "Specific findings from the documents that support this insight",
        "impact": "Business impact assessment",
        "recommendations": "Gaming strategy recommendations",
        "dataPoints": ["3-5 key data points or statistics that support this insight"]
      },
      "confidence": number between 70-99,
      "needsReview": boolean based on confidence (true if below 85)
    }
    
    Format your response as valid JSON with an array of insights objects like this:
    {
      "insights": [
        {
          "id": "insight_1",
          "category": "business_challenges",
          "content": { ...insight content as described above... },
          "confidence": 85,
          "needsReview": false
        },
        ...more insights...
      ]
    }
    
    Aim to provide 6-10 comprehensive insights across different categories based on the document content.
  `.trim();
}

/**
 * Format document content for Claude analysis
 */
export function formatDocumentSummaries(documentContents: any[]): string {
  // Now documentContents is an array of objects, so we format them accordingly
  return documentContents.map((doc: any) => 
    `Document ${doc.index}: ${doc.name}\nType: ${doc.type}\nPriority: ${doc.priority || 'normal'}\nContent: ${doc.content?.substring(0, 2000) || ''}${doc.content && doc.content.length > 2000 ? '...(truncated)' : ''}`
  ).join("\n\n");
}
