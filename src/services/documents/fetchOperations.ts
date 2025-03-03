
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/lib/types";

/**
 * Fetch documents for a specific project
 */
export const fetchProjectDocuments = async (projectId: string): Promise<Document[]> => {
  if (!projectId) {
    throw new Error("Project ID is required to fetch documents");
  }

  try {
    console.log(`Fetching documents for project: ${projectId}`);

    // For development/mock environment, get documents from localStorage if available
    const storageKey = `project_documents_${projectId}`;
    const storedDocuments = localStorage.getItem(storageKey);
    
    if (storedDocuments) {
      console.log(`Found documents in localStorage for project ${projectId}`);
      return JSON.parse(storedDocuments);
    }
    
    // Try to get from Supabase if not in localStorage
    // This will likely fail in mock/development environment without auth
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
      const documents = data.map(doc => ({
        id: doc.id,
        name: doc.name,
        size: doc.size,
        type: doc.type,
        uploadedAt: doc.uploaded_at,
        uploadedBy: doc.user_id,
        url: doc.url,
        priority: doc.priority
      }));
      
      // Store in localStorage as backup
      localStorage.setItem(storageKey, JSON.stringify(documents));
      
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
