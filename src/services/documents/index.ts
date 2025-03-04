
// Re-export all document-related services
export * from './databaseOperations';
export * from './storageOperations';

// Add an explicit export for fetchProjectDocuments 
export { fetchProjectDocumentsFromApi as fetchProjectDocuments } from './fetchOperations';
export * from './errors';
