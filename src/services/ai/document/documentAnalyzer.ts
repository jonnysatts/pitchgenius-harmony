
import { Document, Project } from "@/lib/types";
import { prepareDocumentContents } from '../promptUtils';
import { callClaudeApi } from '../apiClient';

/**
 * Analyzes documents to generate strategic insights
 */
export const analyzeDocuments = async (
  documents: Document[],
  projectId: string
): Promise<{ success: boolean; message?: string; analysisResults?: any[] }> => {
  try {
    console.log(`Analyzing ${documents.length} documents for project ${projectId}`);
    
    if (!documents || documents.length === 0) {
      console.error("No documents provided for analysis");
      return {
        success: false,
        message: 'No documents provided for analysis.'
      };
    }
    
    // Prepare documents for analysis - this extracts text content
    const documentsContent = prepareDocumentContents(documents);
    
    if (documentsContent.length === 0) {
      console.error("No content could be extracted from documents");
      return {
        success: false,
        message: 'No document content could be extracted. Please check the document formats.'
      };
    }
    
    // Log the total content size to help with debugging
    const totalContentSize = documentsContent.reduce((total, doc) => total + (doc.content?.length || 0), 0);
    console.log(`Prepared ${documentsContent.length} documents with total content size: ${totalContentSize} characters`);
    
    // Create a complete mock project object for the API call that satisfies the Project interface
    const mockProject: Project = {
      id: projectId,
      title: "Document Analysis",
      clientName: "Unknown Client",
      clientIndustry: "technology", // Default value
      clientWebsite: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: "system",
      description: "Automated document analysis",
      status: "in_progress"
    };
    
    console.log("Calling Claude API with mock project:", mockProject.id);
    
    // Actually call the API to analyze the documents
    const apiResult = await callClaudeApi(mockProject, documents, documentsContent);
    console.log("Claude API result received:", apiResult ? "success" : "failure");
    
    // Check if we got valid insights
    if (apiResult.insights && apiResult.insights.length > 0) {
      console.log(`Success: Received ${apiResult.insights.length} insights from Claude API`);
      
      // Ensure all insights have the correct source field
      const enhancedInsights = apiResult.insights.map((insight: any) => ({
        ...insight,
        source: 'document'  // Explicitly mark these as document insights
      }));
      
      return {
        success: true,
        message: `Successfully analyzed ${documents.length} documents.`,
        analysisResults: enhancedInsights
      };
    } else if (apiResult.error) {
      console.error("Claude API returned an error:", apiResult.error);
      return {
        success: false,
        message: apiResult.error
      };
    }
    
    console.log("Claude API call succeeded but no insights were returned");
    return {
      success: true,
      message: `Successfully prepared ${documents.length} documents for analysis, but no insights were generated.`
    };
  } catch (error) {
    console.error('Error analyzing documents:', error);
    return {
      success: false,
      message: `Failed to analyze documents: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};
