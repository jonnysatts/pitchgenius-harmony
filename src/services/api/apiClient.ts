import { Project, Document, StrategicInsight } from "@/lib/types";
import { callEdgeFunction } from "./requestHandler";
import { storage, apiCache } from "./storageAdapter";
import { API_CONFIG, STORAGE_KEYS } from "./config";
import { documentService, DocumentWithLifecycle } from "../documents/documentService";
import { insightService, InsightWithDocuments } from "../insights/insightService";
import { errorService, ErrorType } from "../error/errorService";

// Define API input/output types for type safety
interface WebsiteAnalysisInput {
  websiteUrl: string;
  projectId: string;
  clientIndustry: string;
}

interface WebsiteAnalysisOutput {
  analysis: any;
  insights?: StrategicInsight[];
  error?: string;
}

/**
 * API client for handling data fetching operations
 */
export const apiClient = {
  // Document operations
  documents: {
    fetchProjectDocuments: async (projectId: string): Promise<Document[]> => {
      try {
        const cacheKey = `documents-${projectId}`;
        
        // Try to get from cache first
        const cached = apiCache.get<Document[]>(cacheKey);
        if (cached) {
          return cached;
        }
        
        // Use the document service to fetch documents
        const documents = await documentService.fetchProjectDocuments(projectId);
        
        // Cache the response
        apiCache.set(cacheKey, documents);
        
        return documents;
      } catch (error) {
        errorService.handleError(error, {
          context: "fetch-project-documents",
          projectId
        });
        return [];
      }
    },
    
    uploadDocument: async (projectId: string, file: File, priority: number = 0): Promise<Document | null> => {
      try {
        // Use the document service to upload document
        const result = await documentService.uploadDocument(projectId, file, priority);
        
        // Invalidate document cache for this project upon successful upload
        if (result) {
          apiCache.invalidate(`documents-${projectId}`);
        }
        
        return result;
      } catch (error) {
        errorService.handleError(error, {
          context: "upload-document",
          projectId,
          fileName: file.name
        });
        return null;
      }
    },
    
    removeDocument: async (documentId: string): Promise<boolean> => {
      try {
        // Use the document service to remove document
        const success = await documentService.removeDocument(documentId);
        
        if (success) {
          // Since we don't know which project the document belonged to,
          // we need to invalidate all document caches
          apiCache.invalidate(`documents-`);
        }
        
        return success;
      } catch (error) {
        errorService.handleError(error, {
          context: "remove-document",
          documentId
        });
        return false;
      }
    },
    
    updateDocumentStatus: async (documentId: string, status: string, error?: string): Promise<boolean> => {
      try {
        // Find which project this document belongs to
        const allProjectIds: string[] = [];
        const keys = await storage.getAllKeys('project_documents_');
        
        for (const key of keys) {
          const projectId = key.replace('project_documents_', '');
          allProjectIds.push(projectId);
          
          // Get documents for this project
          const docs = await storage.getItem<Document[]>(key) || [];
          
          // Check if document exists in this project
          if (docs.some(doc => doc.id === documentId)) {
            // Update document status
            const success = await documentService.updateDocumentStatus(
              documentId,
              status as any,
              error
            );
            
            if (success) {
              // Invalidate cache for this project
              apiCache.invalidate(`documents-${projectId}`);
              return true;
            }
          }
        }
        
        // If document wasn't found in any project, invalidate all caches
        // as a precaution
        apiCache.invalidate(`documents-`);
        
        return false;
      } catch (error) {
        errorService.handleError(error, {
          context: "update-document-status",
          documentId,
          status
        });
        return false;
      }
    },
    
    cleanupOldDocuments: async (projectId: string, maxAgeMs?: number): Promise<number> => {
      try {
        // Use the document service to clean up old documents
        const documentsRemoved = await documentService.cleanupProjectDocuments(
          projectId,
          maxAgeMs || 30 * 24 * 60 * 60 * 1000 // Default: 30 days
        );
        
        if (documentsRemoved > 0) {
          // Invalidate cache for this project
          apiCache.invalidate(`documents-${projectId}`);
        }
        
        return documentsRemoved;
      } catch (error) {
        errorService.handleError(error, {
          context: "cleanup-old-documents",
          projectId
        });
        return 0;
      }
    }
  },
  
  // AI Analysis operations
  analysis: {
    analyzeDocuments: async (documents: Document[], projectId: string) => {
      try {
        const result = await callEdgeFunction(
          'analyze-documents',
          {
            documents,
            projectId
          },
          {
            timeoutMs: API_CONFIG.timeouts.long
          }
        );
        
        // Update document statuses to reflect analysis
        if (result && Array.isArray(documents)) {
          for (const doc of documents) {
            await apiClient.documents.updateDocumentStatus(doc.id, 'analyzed');
          }
        }
        
        return result;
      } catch (error) {
        errorService.handleError(error, {
          context: "analyze-documents",
          projectId,
          documentCount: documents?.length || 0
        });
        return null;
      }
    },
    
    analyzeWebsite: async (projectId: string, websiteUrl: string, clientIndustry: string): Promise<WebsiteAnalysisOutput> => {
      try {
        console.log(`Analyzing website: ${websiteUrl} for project ${projectId}`);
        
        // Use the callEdgeFunction utility instead of direct fetch
        const result = await callEdgeFunction<WebsiteAnalysisOutput>(
          API_CONFIG.endpoints.edgeFunctions.analyzeWebsite,
          {
            websiteUrl,
            projectId,
            clientIndustry: clientIndustry || 'technology'
          },
          {
            timeoutMs: API_CONFIG.timeouts.long, // Use longer timeout for website analysis
            retries: 2 // Fewer retries for long-running operations
          }
        );
        
        // If the analysis generated insights, store them
        if (result.insights && Array.isArray(result.insights) && result.insights.length > 0) {
          for (const insightData of result.insights) {
            await insightService.createInsight(projectId, insightData);
          }
        }
        
        return result;
      } catch (error) {
        const errorDetails = errorService.handleError(error, {
          context: "analyze-website",
          projectId,
          websiteUrl
        });
        
        return {
          analysis: null,
          error: errorDetails.message
        };
      }
    }
  },
  
  // Insights operations
  insights: {
    getInsightsForProject: async (projectId: string): Promise<StrategicInsight[]> => {
      try {
        const cacheKey = `insights-${projectId}`;
        
        // Try to get from cache first
        const cached = apiCache.get<StrategicInsight[]>(cacheKey);
        if (cached) {
          return cached;
        }
        
        // Use the insight service
        const insights = await insightService.getProjectInsights(projectId);
        
        // Cache the response
        apiCache.set(cacheKey, insights);
        
        return insights;
      } catch (error) {
        errorService.handleError(error, {
          context: "get-insights-for-project",
          projectId
        });
        return [];
      }
    },
    
    getInsightById: async (projectId: string, insightId: string): Promise<StrategicInsight | null> => {
      try {
        return await insightService.getInsightById(projectId, insightId);
      } catch (error) {
        errorService.handleError(error, {
          context: "get-insight-by-id",
          projectId,
          insightId
        });
        return null;
      }
    },
    
    createInsight: async (projectId: string, insightData: Partial<InsightWithDocuments>, sourceDocumentIds: string[] = []): Promise<StrategicInsight | null> => {
      try {
        return await insightService.createInsight(projectId, insightData, sourceDocumentIds);
      } catch (error) {
        errorService.handleError(error, {
          context: "create-insight",
          projectId
        });
        return null;
      }
    },
    
    updateInsight: async (projectId: string, insightId: string, updates: Partial<InsightWithDocuments>): Promise<StrategicInsight | null> => {
      try {
        return await insightService.updateInsight(projectId, insightId, updates);
      } catch (error) {
        errorService.handleError(error, {
          context: "update-insight",
          projectId,
          insightId
        });
        return null;
      }
    },
    
    deleteInsight: async (projectId: string, insightId: string): Promise<boolean> => {
      try {
        return await insightService.deleteInsight(projectId, insightId);
      } catch (error) {
        errorService.handleError(error, {
          context: "delete-insight",
          projectId,
          insightId
        });
        return false;
      }
    },
    
    associateDocumentsWithInsight: async (
      projectId: string,
      insightId: string,
      documentIds: string[]
    ): Promise<boolean> => {
      try {
        return await insightService.associateDocuments(projectId, insightId, documentIds);
      } catch (error) {
        errorService.handleError(error, {
          context: "associate-documents-with-insight",
          projectId,
          insightId
        });
        return false;
      }
    },
    
    getDocumentsForInsight: async (
      projectId: string,
      insightId: string
    ): Promise<Document[]> => {
      try {
        return await insightService.getAssociatedDocuments(projectId, insightId);
      } catch (error) {
        errorService.handleError(error, {
          context: "get-documents-for-insight",
          projectId,
          insightId
        });
        return [];
      }
    },
    
    cleanupOrphanedInsights: async (projectId: string): Promise<number> => {
      try {
        return await insightService.cleanupOrphanedInsights(projectId);
      } catch (error) {
        errorService.handleError(error, {
          context: "cleanup-orphaned-insights",
          projectId
        });
        return 0;
      }
    }
  }
};
