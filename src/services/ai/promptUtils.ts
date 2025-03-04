
import { Document } from "@/lib/types";

/**
 * Prepares document contents for analysis from Document objects
 */
export const prepareDocumentContents = (documents: Document[]) => {
  console.log(`Preparing ${documents.length} documents for analysis`);
  
  // Create formatted document contents
  const documentContents = documents.map((doc, index) => {
    // Extract text content based on document type
    let extractedText = "";
    
    try {
      // In a production environment with actual document parsing:
      // This would extract content from binary files
      // But for our demo, we'll use mock content based on the document name
      
      // Check if we already have extracted text (not a URL)
      if (doc.content && !doc.content.startsWith("Content from URL:") && 
          !doc.content.startsWith("blob:")) {
        extractedText = doc.content;
      } else {
        // Generate mock content based on the file name and type
        const fileName = doc.name.toLowerCase();
        
        if (fileName.includes("meeting") || fileName.includes("summary")) {
          extractedText = `Meeting summary for ${doc.name}.\n\n` +
            `Key points discussed:\n` +
            `- Client expressed interest in gaming-focused internet packages\n` +
            `- Need to focus on low latency connections for competitive gaming\n` +
            `- Opportunity to bundle services with game subscriptions\n` +
            `- Concerns about network stability during peak gaming hours`;
        } else if (fileName.includes("proposal") || fileName.includes("partnership")) {
          extractedText = `Proposal document for partnership between gaming services and ISP.\n\n` +
            `Main proposal points:\n` +
            `- Co-branded internet packages optimized for gaming\n` +
            `- Revenue sharing model for game purchases through our platform\n` +
            `- Joint marketing campaigns targeting gamers\n` +
            `- Premium technical support for gaming-related issues`;
        } else if (fileName.includes("data") || fileName.includes("request")) {
          extractedText = `Data analysis request document.\n\n` +
            `Data points needed:\n` +
            `- Current gaming customer segment size and growth\n` +
            `- Peak usage times for gaming traffic\n` +
            `- Bandwidth consumption patterns for major game releases\n` +
            `- Competitive analysis of gaming-focused ISP packages`;
        } else if (fileName.includes("strategic") || fileName.includes("memo")) {
          extractedText = `Strategic memo on gaming market opportunities.\n\n` +
            `Strategic considerations:\n` +
            `- Gaming market represents 35% growth potential for our services\n` +
            `- Key competitors are launching gaming-specific packages\n` +
            `- Cloud gaming services require more reliable connections\n` +
            `- Gamers are willing to pay premium for optimized routing`;
        } else if (fileName.includes("considerations")) {
          extractedText = `Considerations for Australian Broadband gaming initiatives.\n\n` +
            `Key considerations:\n` +
            `- Australian gaming market is growing 22% year over year\n` +
            `- Regional connectivity challenges for rural gamers\n` +
            `- NBN infrastructure limitations in some regions\n` +
            `- Opportunity to differentiate with gaming-specific routing`;
        } else {
          extractedText = `Document ${doc.name}.\n\n` +
            `This document contains information relevant to gaming-focused internet services and partnerships.`;
        }
      }
    } catch (err) {
      console.error(`Error extracting content from document ${doc.name}:`, err);
      extractedText = `Error extracting content from document ${doc.name}`;
    }
    
    // For debugging
    console.log(`Document ${index + 1}: ${doc.name} - extracted ${extractedText.length} chars`);
    
    // Return the document content object
    return {
      name: doc.name,
      type: doc.type || 'unknown',
      size: doc.size || 0,
      priority: doc.priority || 0,
      content: extractedText,
      index: index + 1
    };
  });
  
  return documentContents;
};
