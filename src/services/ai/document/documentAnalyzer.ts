
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
    
    // Prepare documents for analysis - this extracts text content
    const documentsContent = prepareDocumentContents(documents);
    
    if (documentsContent.length === 0) {
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
      clientName: "Unknown Client", // Added missing required property
      clientIndustry: "technology", // Default value
      clientWebsite: "",
      createdAt: new Date(), // Added missing required property
      updatedAt: new Date(), // Added missing required property
      ownerId: "system", // Added missing required property
      description: "Automated document analysis", // Added missing required property
      status: "in_progress" // Optional but added for completeness
    };
    
    // Actually call the API to analyze the documents
    const apiResult = await callClaudeApi(mockProject, documents, documentsContent);
    
    // Check if we got valid insights
    if (apiResult.insights && apiResult.insights.length > 0) {
      return {
        success: true,
        message: `Successfully analyzed ${documents.length} documents.`,
        analysisResults: apiResult.insights
      };
    } else if (apiResult.error) {
      return {
        success: false,
        message: apiResult.error
      };
    }
    
    return {
      success: true,
      message: `Successfully prepared ${documents.length} documents for analysis.`
    };
  } catch (error) {
    console.error('Error analyzing documents:', error);
    return {
      success: false,
      message: `Failed to analyze documents: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};
