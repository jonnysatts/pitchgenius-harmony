/**
 * Service for generating prompts for Claude AI
 */

/**
 * Interface for document content
 */
interface DocumentContent {
  name?: string;
  content?: string;
}

/**
 * Generate the system prompt for Claude
 */
export function generateSystemPrompt(
  clientIndustry: string = 'technology',
  projectTitle: string = 'Document Analysis'
): string {
  return `You are an expert strategic consultant specializing in ${clientIndustry}. 
Your task is to analyze documents for a project titled "${projectTitle}" and identify key strategic insights.
Focus on extracting specific, actionable insights that would be valuable to a business in the ${clientIndustry} industry.
Provide your analysis in a structured JSON format as specified in the user prompt.
Be objective and balanced in your analysis, highlighting both strengths and areas for improvement.
Avoid generic advice - all insights should be directly tied to specific content in the provided documents.`;
}

/**
 * Generate the main prompt for Claude based on document contents
 */
export function generatePrompt(
  documentContents: DocumentContent[],
  clientIndustry: string = 'technology',
  clientWebsite: string = '',
  projectTitle: string = 'Document Analysis',
  processingMode: 'comprehensive' | 'focused' = 'comprehensive'
): string {
  if (!documentContents || documentContents.length === 0) {
    throw new Error('No document contents provided for analysis.');
  }

  // Create a header for the prompt
  let prompt = `I need you to analyze documents for a project titled "${projectTitle}" in the ${clientIndustry} industry.\n\n`;

  // Add context about the client's website if available
  if (clientWebsite) {
    prompt += `The client's website is ${clientWebsite}. Please consider this when generating insights.\n\n`;
  }

  // Add the document contents
  prompt += `DOCUMENT CONTENTS:\n\n`;

  // Include each document with clear separation
  documentContents.forEach((doc, index) => {
    const docName = doc.name || 'Untitled Document';
    const docContent = doc.content || 'No content available';
    prompt += `DOCUMENT ${index + 1}: ${docName}\n${docContent}\n\n---- END OF DOCUMENT ${index + 1} ----\n\n`;
  });

  // Specify the required JSON output format
  const jsonFormat = `
Based on these documents, generate strategic insights structured as JSON in the following format:
\`\`\`json
{
  "insights": [
    {
      "id": "unique_id_1",
      "category": "business_challenges",
      "content": {
        "title": "Concise insight title",
        "summary": "Brief summary of the insight",
        "details": "More detailed explanation of the insight",
        "evidence": "Evidence from the documents",
        "recommendations": "Strategic recommendations",
        "impact": "Potential business impact",
        "sources": [
          {
            "id": "doc_id",
            "name": "Document Name",
            "relevance": "high"
          }
        ]
      },
      "confidence": 85,
      "needsReview": false
    },
    // Additional insights...
  ]
}
\`\`\`

Generate insights for each of these categories:
1. business_challenges: Key business challenges identified in the documents
2. audience_gaps: Gaps in audience understanding or targeting
3. competitive_threats: Competitive threats and challenges
4. gaming_opportunities: Specific opportunities in the gaming market
5. strategic_recommendations: High-level strategic recommendations
6. key_narratives: Important narrative themes from the documents

For each insight:
- The title should be specific and actionable
- The summary should be 1-2 sentences
- Details should provide more comprehensive information
- Evidence should cite specific content from the documents
- Confidence should range from 60-95 based on the strength of evidence
- Set needsReview to true if the insight is based on limited evidence

Your insights must be specific to the document content provided, not generic advice.
ONLY output the JSON, nothing else.`;

  prompt += jsonFormat;

  return prompt;
}
