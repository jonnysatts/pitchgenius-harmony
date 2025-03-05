
export * from './fetchOperations';
export * from './storageOperations';
export * from './mockDocuments';
export * from './errors';

// Re-export with proper names to match what the hooks are expecting
import { fetchProjectDocumentsFromApi } from './fetchOperations';
import { removeDocumentFromApi } from './fetchOperations';

// Export with the names used in the hooks
export const fetchProjectDocuments = fetchProjectDocumentsFromApi;
export const removeDocument = removeDocumentFromApi;

// Mock implementation for insertDocumentRecord since it's used but not available
export const insertDocumentRecord = async (
  name: string,
  size: number,
  type: string,
  projectId: string,
  userId: string,
  publicUrl: string,
  priority: number,
  storagePath: string
) => {
  console.log('Mock insertDocumentRecord called');
  // Use uploadDocumentToApi which is available
  return uploadDocumentToApi(projectId, new File([], name, { type }), priority);
};

// Mock implementation for uploadDocumentToStorage since it's used but not available
export const uploadDocumentToStorage = async (
  file: File,
  userId: string,
  projectId: string
) => {
  console.log('Mock uploadDocumentToStorage called');
  const storagePath = `${projectId}/${Date.now()}_${file.name}`;
  const publicUrl = URL.createObjectURL(file);
  return { storagePath, publicUrl };
};

// Re-export the calculate document priority function
export const calculateDocumentPriority = (filename: string): number => {
  // Simple priority calculation based on filename
  if (filename.toLowerCase().includes('important')) return 10;
  if (filename.toLowerCase().includes('urgent')) return 9;
  return 5; // Default priority
};
