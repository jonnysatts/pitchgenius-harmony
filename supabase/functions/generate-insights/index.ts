
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Utility to safely chunk text based on Claude's context window
function chunkText(text: string, maxChunkSize = 100000): string[] {
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
function getIndustryConsiderations(industry: string): string {
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
function formatDocumentsForAnalysis(documents: any[], clientIndustry: string): string {
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

async function callAnthropicAPI(content: string, clientIndustry: string): Promise<any> {
  console.log(`Calling Claude API for analysis in ${clientIndustry} industry`)
  
  const systemPrompt = `You are an expert strategic consultant from Games Age, a gaming consultancy that helps businesses integrate gaming into their strategy. 
  
Your job is to analyze client documents and generate strategic insights about how they can leverage gaming in their business.

For a ${clientIndustry} company, examine the provided documents and extract key insights into these categories:
1. Business challenges that could be addressed through gaming
2. Audience engagement gaps that gaming could fill
3. Competitive threats that gaming integration could mitigate
4. Strategic gaming opportunities ranked by potential impact
5. Specific recommendations (both quick wins and long-term)
6. Key narratives to use when pitching gaming solutions

For each insight:
- Assign a confidence score (1-100%) based on how clearly the documents support the insight
- Flag insights below 70% confidence as "needsReview: true"
- Structure content with a clear title, summary, and supporting details or bullet points
- Focus on actionable, specific insights rather than generic statements

YOUR OUTPUT MUST BE VALID JSON in this exact format:
{
  "insights": [
    {
      "id": "string unique ID",
      "category": "one of: business_challenges, audience_gaps, competitive_threats, gaming_opportunities, strategic_recommendations, key_narratives",
      "content": {
        "title": "Clear, concise title",
        "summary": "1-2 sentence summary",
        "details": "Longer explanation if needed",
        "points": ["Array of bullet points if applicable"]
      },
      "confidence": number between 1-100,
      "needsReview": boolean
    }
  ]
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.2
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error:', errorText)
      throw new Error(`Claude API error: ${response.status} ${errorText}`)
    }
    
    const data = await response.json()
    console.log('Claude response received')
    
    // Parse the JSON from Claude's content
    try {
      // Claude sometimes surrounds JSON with markdown code blocks
      const content = data.content[0].text
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content]
      const jsonText = jsonMatch[1].trim()
      
      return JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Error parsing Claude response as JSON:', parseError)
      throw new Error('Failed to parse AI response as JSON')
    }
  } catch (error) {
    console.error('Error calling Claude API:', error)
    throw error
  }
}

// Mock processing documents content from base64 or text extraction
// In a real implementation, this would extract text from documents
async function processDocumentContent(documentIds: string[]): Promise<any[]> {
  console.log(`Processing ${documentIds.length} documents`)
  
  // For demonstration, we're returning mock document content
  // In a real implementation, this would fetch documents from storage and extract text
  return documentIds.map(id => ({
    id,
    name: `Document ${id.slice(0, 6)}`,
    content: `This is a sample content for document ${id}. In a real implementation, text would be extracted from the actual document.`
  }))
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const { projectId, documentIds, clientIndustry = 'technology' } = await req.json()
    
    if (!projectId || !documentIds || documentIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: projectId and documentIds' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Processing analysis request for project ${projectId} with ${documentIds.length} documents`)
    
    // Process documents to extract content
    const processedDocuments = await processDocumentContent(documentIds)
    
    // Format documents for analysis
    const formattedContent = formatDocumentsForAnalysis(processedDocuments, clientIndustry)
    
    // Split content into chunks if it exceeds Claude's context window
    const chunks = chunkText(formattedContent)
    console.log(`Split content into ${chunks.length} chunks`)
    
    // For now, we'll just use the first chunk to stay within Claude's context window
    // A more sophisticated approach would be to analyze each chunk and then synthesize
    const analysisResult = await callAnthropicAPI(chunks[0], clientIndustry)
    
    // Return the insights
    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-insights function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error processing insights' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
