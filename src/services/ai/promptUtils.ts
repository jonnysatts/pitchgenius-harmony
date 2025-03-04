
import { Project, Document } from "@/lib/types";
import { getFileCategory } from "@/services/documentService";

/**
 * Generate a prompt for document analysis based on project details
 */
export const generateAnalysisPrompt = (project: Project, documents: Document[]): string => {
  // Format document information for the prompt
  const documentsSummary = documents.map(doc => {
    const priority = doc.priority || 0;
    const category = getFileCategory(doc.type);
    return `- ${doc.name} (${category}, ${(doc.size / 1024 / 1024).toFixed(2)}MB, Priority: ${priority})`;
  }).join('\n');
  
  return `
    You are a strategic gaming audience consultant for Games Age, analyzing documents for ${project.clientName} in the ${project.clientIndustry} industry.
    
    Key information about the client:
    - Name: ${project.clientName}
    - Industry: ${project.clientIndustry}
    - Website: ${project.clientWebsite || 'Not provided'}
    - Description: ${project.description || 'No additional information provided'}
    
    The following documents have been uploaded for analysis:
    ${documentsSummary}
    
    Extract strategic insights related to gaming audience engagement opportunities, focusing on:
    - Business challenges that gaming audience strategies could address
    - Audience gaps or engagement opportunities
    - Competitive threats in the gaming space
    - Specific gaming opportunities relevant to their business
    - Strategic recommendations for gaming audience engagement
    - Key cultural or narrative elements that could connect with gaming audiences
    
    For each insight, provide:
    - A clear, specific title
    - A concise summary
    - Supporting details/evidence from the documents
    - Strategic recommendations
    
    Your analysis should be thorough, actionable, and directly relevant to the client's industry.
  `;
};

/**
 * Generate a prompt for website research based on client details
 */
export const generateWebsiteResearchPrompt = (websiteUrl: string, clientName: string, clientIndustry: string): string => {
  return `
    You are a senior strategic consultant at Games Age, Australia's premier gaming audience strategy agency. You specialize in helping brands authentically connect with gaming audiences (not developing games or simple gamification).
    
    Your task is to analyze ${clientName}'s website (${websiteUrl}) and identify strategic opportunities for them to engage with gaming audiences and gaming culture to solve real business challenges.
    
    Games Age's unique approach combines:
    1. Deep gaming audience insights (powered by Fortress venue data from 1 million+ Australian gamers)
    2. Cultural connection strategies (not superficial "gamer marketing")
    3. Experiential expertise in gaming activations, events, and sponsorships
    4. Content and partnership strategies that build authentic gaming community engagement
    
    For ${clientName} in the ${clientIndustry} industry, analyze their website to identify:
    
    1. BUSINESS IMPERATIVES (what critical business challenges could gaming audience engagement solve?)
      * Audience gaps (especially with Gen Z/younger demographics)
      * Brand perception challenges
      * Market differentiation needs
      * Digital transformation opportunities
      * Demand generation requirements
    
    2. GAMING AUDIENCE OPPORTUNITY (how can gaming audiences specifically help them?)
      * Specific gaming audience segments that align with their brand/products
      * Cultural crossover points between their industry and gaming culture
      * Authentic ways to engage these audiences without seeming inauthentic
      * Competitor analysis in gaming space (gaps and opportunities)
    
    3. STRATEGIC ACTIVATION PATHWAYS (what specific Games Age services would deliver value?)
      * Potential experiential/event opportunities (both digital and physical)
      * Content strategy recommendations
      * Sponsorship opportunities within gaming culture
      * Partnership approaches with gaming entities
      * Measurement frameworks for success
  `;
};
