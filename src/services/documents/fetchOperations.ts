
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/lib/types";

// Create a cache for documents by project
const documentCache = new Map<string, {
  documents: Document[],
  timestamp: number
}>();

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Fetch documents for a specific project with caching
 */
export const fetchProjectDocuments = async (projectId: string): Promise<Document[]> => {
  if (!projectId) {
    throw new Error("Project ID is required to fetch documents");
  }

  try {
    console.log(`Fetching documents for project: ${projectId}`);
    
    // Check cache first
    const cachedData = documentCache.get(projectId);
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp < CACHE_EXPIRATION)) {
      console.log(`Using cached documents for project ${projectId}`);
      return cachedData.documents;
    }

    // For development/mock environment, get documents from localStorage if available
    const storageKey = `project_documents_${projectId}`;
    const storedDocuments = localStorage.getItem(storageKey);
    
    if (storedDocuments) {
      console.log(`Found documents in localStorage for project ${projectId}`);
      const parsedDocs = JSON.parse(storedDocuments);
      
      // Convert to proper Document type with required fields
      const documents: Document[] = parsedDocs.map((doc: any) => ({
        ...doc,
        projectId: doc.projectId || projectId,
        createdAt: doc.createdAt || new Date()
      }));
      
      // Update cache
      documentCache.set(projectId, {
        documents,
        timestamp: Date.now()
      });
      
      return documents;
    }
    
    // Try to get from Supabase if not in localStorage
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents from Supabase:', error);
        return [];
      }

      if (!data) return [];

      console.log(`Found ${data.length} documents in Supabase for project ${projectId}`);
      
      // Convert retrieved documents to our Document type
      const documents: Document[] = data.map(doc => ({
        id: doc.id,
        name: doc.name,
        size: doc.size,
        type: doc.type,
        projectId: projectId,
        createdAt: new Date(doc.created_at || Date.now()),
        uploadedAt: doc.uploaded_at,
        uploadedBy: doc.user_id,
        url: doc.url,
        priority: doc.priority
      }));
      
      // Store in localStorage as backup
      localStorage.setItem(storageKey, JSON.stringify(documents));
      
      // Update cache
      documentCache.set(projectId, {
        documents,
        timestamp: Date.now()
      });
      
      return documents;
    } catch (supabaseError) {
      console.error('Failed to fetch from Supabase, returning empty list:', supabaseError);
      return [];
    }
  } catch (error) {
    console.error('Unexpected error fetching documents:', error);
    return [];
  }
};

// Add a method to clear the cache for testing
export const clearDocumentCache = () => {
  documentCache.clear();
};
