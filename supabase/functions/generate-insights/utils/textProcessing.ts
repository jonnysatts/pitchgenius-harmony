
/**
 * Utilities for processing and formatting text for analysis
 */

// Utility to safely chunk text based on Claude's context window
export function chunkText(text: string, maxChunkSize = 100000): string[] {
  const chunks: string[] = []
  let currentChunk = ''
  
  // Split by paragraphs to avoid breaking mid-sentence
  const paragraphs = text.split(/\n\s*\n/)
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph exceeds the limit, save current chunk and start a new one
    if (currentChunk.length + paragraph.length + 2 > maxChunkSize) {
      chunks.push(currentChunk)
      currentChunk = paragraph + '\n\n'
    } else {
      currentChunk += paragraph + '\n\n'
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk)
  }
  
  return chunks
}

// Map client industry to specialized prompting
export function getIndustryConsiderations(industry: string): string {
  const industryMap: Record<string, string> = {
    retail: "Retail businesses often benefit from gamification of loyalty programs, social shopping experiences, and interactive product discovery.",
    finance: "Financial services can leverage gaming for financial literacy, investment simulation, and rewards-based saving/spending behaviors.",
    technology: "Technology companies should explore integrations with existing gaming platforms, API-driven solutions, and gamified product onboarding.",
    entertainment: "Entertainment brands have natural synergy with gaming through IP extension, transmedia storytelling, and interactive experiences.",
    other: "Consider gamification of core experience, audience engagement through playful interfaces, and competitive/collaborative elements."
  }
  
  return industryMap[industry.toLowerCase()] || industryMap.other
}

// Format document text for AI analysis
export function formatDocumentsForAnalysis(documents: any[], clientIndustry: string): string {
  const industryConsiderations = getIndustryConsiderations(clientIndustry)
  
  let formattedText = `# CLIENT DOCUMENTS FOR STRATEGIC ANALYSIS\n\n`
  formattedText += `Industry context: ${clientIndustry}\n`
  formattedText += `Industry-specific gaming considerations: ${industryConsiderations}\n\n`
  
  documents.forEach((doc, index) => {
    formattedText += `## DOCUMENT ${index + 1}: ${doc.name}\n\n`
    formattedText += `${doc.content || "No text content available for this document."}\n\n`
    formattedText += `---\n\n`
  })
  
  return formattedText
}

// Mock processing documents content from base64 or text extraction
// In a real implementation, this would extract text from documents
export async function processDocumentContent(documentIds: string[]): Promise<any[]> {
  console.log(`Processing ${documentIds.length} documents`);
  
  // For demonstration, we're returning mock document content
  // In a real implementation, this would fetch documents from storage and extract text
  return documentIds.map(id => ({
    id,
    name: `Document ${id.slice(0, 6)}`,
    content: `This is a sample content for document ${id}. In a real implementation, text would be extracted from the actual document.`
  }));
}
