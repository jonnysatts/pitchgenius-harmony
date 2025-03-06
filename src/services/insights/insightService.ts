import { StrategicInsight } from "@/lib/types";
import { storage, apiCache } from "../api/storageAdapter";
import { STORAGE_KEYS } from "../api/config";
import { errorService, ErrorType } from "../error/errorService";
import { documentService } from "../documents/documentService";

/**
 * Insight types for categorizing different insights
 */
export enum InsightType {
  STRATEGIC = "strategic",
  COMPETITIVE = "competitive",
  MARKET = "market",
  CONTENT = "content",
  TECHNICAL = "technical",
  RECOMMENDATION = "recommendation"
}

/**
 * Extended insight interface with document associations
 */
export interface InsightWithDocuments extends StrategicInsight {
  sourceDocumentIds: string[];
  generatedAt: string;
  updatedAt?: string;
}

/**
 * Validates an insight
 */
function validateInsight(insight: Partial<InsightWithDocuments>): void {
  if (!insight.id) {
    throw new Error("Insight must have an ID");
  }
  
  if (!insight.content) {
    throw new Error("Insight must have content");
  }
}

/**
 * Validates a project ID
 */
function validateProjectId(projectId: string | undefined | null): string {
  if (!projectId) {
    const error = new Error("Invalid or missing project ID");
    errorService.handleError(error, { 
      context: "insight-service",
      type: ErrorType.VALIDATION_ERROR
    });
    throw error;
  }
  return projectId;
}

/**
 * Generates a unique insight ID
 */
function generateInsightId(type: InsightType): string {
  return `insight_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Service for managing insights
 */
export const insightService = {
  /**
   * Get all insights for a project
   */
  async getProjectInsights(projectId: string): Promise<InsightWithDocuments[]> {
    try {
      validateProjectId(projectId);
      
      // Get insights from storage
      const storageKey = STORAGE_KEYS.projectInsights(projectId);
      const data = await storage.getItem<{ insights: InsightWithDocuments[] }>(storageKey);
      
      if (!data || !data.insights) {
        return [];
      }
      
      return data.insights;
    } catch (error) {
      errorService.handleError(error, { 
        context: "get-project-insights",
        projectId
      });
      return [];
    }
  },
  
  /**
   * Get a specific insight by ID
   */
  async getInsightById(projectId: string, insightId: string): Promise<InsightWithDocuments | null> {
    try {
      validateProjectId(projectId);
      
      // Get insights from storage
      const insights = await this.getProjectInsights(projectId);
      
      // Find the specific insight
      return insights.find(insight => insight.id === insightId) || null;
    } catch (error) {
      errorService.handleError(error, { 
        context: "get-insight-by-id",
        projectId,
        insightId
      });
      return null;
    }
  },
  
  /**
   * Create a new insight
   */
  async createInsight(
    projectId: string, 
    insightData: Partial<InsightWithDocuments>, 
    sourceDocumentIds: string[] = []
  ): Promise<InsightWithDocuments | null> {
    try {
      validateProjectId(projectId);
      
      const now = new Date().toISOString();
      
      // Create the insight
      const newInsight: InsightWithDocuments = {
        id: insightData.id || generateInsightId(insightData.type as InsightType || InsightType.STRATEGIC),
        title: insightData.title || "New Insight",
        type: insightData.type || InsightType.STRATEGIC,
        content: insightData.content || {},
        sourceDocumentIds: sourceDocumentIds,
        generatedAt: now,
        ...insightData
      };
      
      validateInsight(newInsight);
      
      // Get existing insights
      const storageKey = STORAGE_KEYS.projectInsights(projectId);
      const existingData = await storage.getItem<{ insights: InsightWithDocuments[] }>(storageKey) || { 
        insights: [] 
      };
      
      // Add the new insight
      const updatedInsights = [...existingData.insights, newInsight];
      
      // Save insights
      await storage.setItem(storageKey, { 
        insights: updatedInsights 
      });
      
      // If there are source documents, associate them with this insight
      if (sourceDocumentIds.length > 0) {
        await documentService.associateDocumentsWithInsight(
          projectId,
          newInsight.id,
          sourceDocumentIds
        );
      }
      
      // Invalidate cache
      apiCache.invalidate(`insights-${projectId}`);
      
      return newInsight;
    } catch (error) {
      errorService.handleError(error, { 
        context: "create-insight",
        projectId
      });
      return null;
    }
  },
  
  /**
   * Update an existing insight
   */
  async updateInsight(
    projectId: string, 
    insightId: string, 
    updates: Partial<InsightWithDocuments>
  ): Promise<InsightWithDocuments | null> {
    try {
      validateProjectId(projectId);
      
      // Get existing insights
      const storageKey = STORAGE_KEYS.projectInsights(projectId);
      const existingData = await storage.getItem<{ insights: InsightWithDocuments[] }>(storageKey);
      
      if (!existingData || !existingData.insights) {
        throw new Error(`No insights found for project ${projectId}`);
      }
      
      // Find the insight to update
      const insightIndex = existingData.insights.findIndex(insight => insight.id === insightId);
      
      if (insightIndex === -1) {
        throw new Error(`Insight ${insightId} not found in project ${projectId}`);
      }
      
      // Update the insight
      const updatedInsight: InsightWithDocuments = {
        ...existingData.insights[insightIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Ensure source document IDs are merged properly
      if (updates.sourceDocumentIds) {
        updatedInsight.sourceDocumentIds = updates.sourceDocumentIds;
      }
      
      validateInsight(updatedInsight);
      
      // Replace the insight in the array
      existingData.insights[insightIndex] = updatedInsight;
      
      // Save insights
      await storage.setItem(storageKey, existingData);
      
      // If source document IDs have changed, update associations
      if (updates.sourceDocumentIds) {
        await documentService.associateDocumentsWithInsight(
          projectId,
          insightId,
          updatedInsight.sourceDocumentIds
        );
      }
      
      // Invalidate cache
      apiCache.invalidate(`insights-${projectId}`);
      
      return updatedInsight;
    } catch (error) {
      errorService.handleError(error, { 
        context: "update-insight",
        projectId,
        insightId
      });
      return null;
    }
  },
  
  /**
   * Delete an insight
   */
  async deleteInsight(
    projectId: string, 
    insightId: string
  ): Promise<boolean> {
    try {
      validateProjectId(projectId);
      
      // Get existing insights
      const storageKey = STORAGE_KEYS.projectInsights(projectId);
      const existingData = await storage.getItem<{ insights: InsightWithDocuments[] }>(storageKey);
      
      if (!existingData || !existingData.insights) {
        return false;
      }
      
      // Remove the insight
      const updatedInsights = existingData.insights.filter(insight => insight.id !== insightId);
      
      // If nothing was removed, return false
      if (updatedInsights.length === existingData.insights.length) {
        return false;
      }
      
      // Save insights
      await storage.setItem(storageKey, { 
        insights: updatedInsights 
      });
      
      // Invalidate cache
      apiCache.invalidate(`insights-${projectId}`);
      
      return true;
    } catch (error) {
      errorService.handleError(error, { 
        context: "delete-insight",
        projectId,
        insightId
      });
      return false;
    }
  },
  
  /**
   * Associate documents with an insight
   */
  async associateDocuments(
    projectId: string, 
    insightId: string, 
    documentIds: string[]
  ): Promise<boolean> {
    try {
      // Get the insight
      const insight = await this.getInsightById(projectId, insightId);
      
      if (!insight) {
        throw new Error(`Insight ${insightId} not found in project ${projectId}`);
      }
      
      // Update the insight with the document IDs
      await this.updateInsight(projectId, insightId, {
        sourceDocumentIds: documentIds
      });
      
      // Use document service to create the association
      return await documentService.associateDocumentsWithInsight(
        projectId,
        insightId,
        documentIds
      );
    } catch (error) {
      errorService.handleError(error, { 
        context: "associate-documents-with-insight",
        projectId,
        insightId
      });
      return false;
    }
  },
  
  /**
   * Get documents associated with an insight
   */
  async getAssociatedDocuments(
    projectId: string, 
    insightId: string
  ): Promise<any[]> {
    try {
      // Use document service to get associated documents
      return await documentService.getDocumentsForInsight(
        projectId,
        insightId
      );
    } catch (error) {
      errorService.handleError(error, { 
        context: "get-associated-documents",
        projectId,
        insightId
      });
      return [];
    }
  },
  
  /**
   * Clean up insights that have no associated documents
   */
  async cleanupOrphanedInsights(projectId: string): Promise<number> {
    try {
      validateProjectId(projectId);
      
      // Get all insights for this project
      const insights = await this.getProjectInsights(projectId);
      
      // Track how many insights are removed
      let removedCount = 0;
      
      // Check each insight
      for (const insight of insights) {
        // Skip insights without document associations
        if (!insight.sourceDocumentIds || insight.sourceDocumentIds.length === 0) {
          continue;
        }
        
        // Get the associated documents
        const documents = await documentService.getDocumentsForInsight(
          projectId,
          insight.id
        );
        
        // If no documents exist, delete the insight
        if (documents.length === 0) {
          const deleted = await this.deleteInsight(projectId, insight.id);
          if (deleted) {
            removedCount++;
          }
        }
      }
      
      return removedCount;
    } catch (error) {
      errorService.handleError(error, { 
        context: "cleanup-orphaned-insights",
        projectId
      });
      return 0;
    }
  }
};
