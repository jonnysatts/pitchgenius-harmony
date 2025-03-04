
import { Project, Document, StrategicInsight } from "@/lib/types";
import { fetchProjectDocumentsFromApi, uploadDocumentToApi } from "@/services/documents/fetchOperations";
import { analyzeDocuments } from "@/services/ai/document/documentAnalyzer";

/**
 * API client for handling data fetching operations
 */
export const apiClient = {
  // Document operations
  documents: {
    fetchProjectDocuments: async (projectId: string): Promise<Document[]> => {
      return fetchProjectDocumentsFromApi(projectId);
    },
    
    uploadDocument: async (projectId: string, file: File, priority: number = 0): Promise<Document | null> => {
      return uploadDocumentToApi(projectId, file, priority);
    },
    
    removeDocument: async (documentId: string): Promise<boolean> => {
      // This is currently mocked in localStorage
      try {
        // Get all projects from localStorage
        const keys = Object.keys(localStorage).filter(key => key.startsWith('project_documents_'));
        
        for (const key of keys) {
          const storedDocsJson = localStorage.getItem(key);
          if (storedDocsJson) {
            try {
              const storedDocs = JSON.parse(storedDocsJson);
              if (Array.isArray(storedDocs)) {
                // Filter out the document to remove
                const filteredDocs = storedDocs.filter((doc: Document) => doc.id !== documentId);
                
                // If we removed something, update localStorage
                if (filteredDocs.length !== storedDocs.length) {
                  localStorage.setItem(key, JSON.stringify(filteredDocs));
                  console.log(`Removed document ${documentId} from ${key}`);
                  return true;
                }
              }
            } catch (e) {
              console.error('Error parsing stored documents:', e);
            }
          }
        }
        
        console.warn(`Document ${documentId} not found in any project`);
        return false;
      } catch (error) {
        console.error('Error removing document:', error);
        return false;
      }
    }
  },
  
  // AI Analysis operations
  analysis: {
    analyzeDocuments: async (documents: Document[], projectId: string) => {
      return analyzeDocuments(documents, projectId);
    },
    
    analyzeWebsite: async (projectId: string, websiteUrl: string, clientIndustry: string) => {
      try {
        console.log(`Analyzing website: ${websiteUrl} for project ${projectId}`);
        
        // Create URL for the Supabase Edge Function
        const baseUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || 'https://your-project.supabase.co';
        const url = `${baseUrl}/functions/v1/analyze-website-with-anthropic`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            websiteUrl,
            projectId,
            clientIndustry: clientIndustry || 'technology'
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Website analysis failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error analyzing website:', error);
        throw error;
      }
    }
  },
  
  // Insights operations
  insights: {
    getInsightsForProject: async (projectId: string): Promise<StrategicInsight[]> => {
      // Get insights from localStorage for now
      try {
        const storedData = localStorage.getItem(`project_insights_${projectId}`);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          return parsedData.insights || [];
        }
        return [];
      } catch (error) {
        console.error('Error fetching insights:', error);
        return [];
      }
    },
    
    updateInsight: async (projectId: string, insightId: string, updatedContent: Record<string, any>): Promise<boolean> => {
      try {
        const storedData = localStorage.getItem(`project_insights_${projectId}`);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const insights = parsedData.insights || [];
          
          const updatedInsights = insights.map((insight: StrategicInsight) => {
            if (insight.id === insightId) {
              return {
                ...insight,
                content: {
                  ...insight.content,
                  ...updatedContent
                }
              };
            }
            return insight;
          });
          
          const updatedData = {
            ...parsedData,
            insights: updatedInsights
          };
          
          localStorage.setItem(`project_insights_${projectId}`, JSON.stringify(updatedData));
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error updating insight:', error);
        return false;
      }
    }
  }
};
