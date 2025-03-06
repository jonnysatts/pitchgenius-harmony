/**
 * API and storage configuration settings
 */

// Default request timeouts (ms)
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const LONG_TIMEOUT = 120000;   // 2 minutes
const UPLOAD_TIMEOUT = 300000; // 5 minutes

// Default retry settings
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

// Cache settings
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Timeout settings for different operation types
  timeouts: {
    default: DEFAULT_TIMEOUT,
    long: LONG_TIMEOUT,
    upload: UPLOAD_TIMEOUT
  },
  
  // Retry settings
  retry: {
    count: DEFAULT_RETRIES,
    delay: DEFAULT_RETRY_DELAY
  },
  
  // Cache settings
  cache: {
    defaultTime: DEFAULT_CACHE_TIME
  },
  
  // API endpoints
  endpoints: {
    // Edge function endpoints
    edgeFunctions: {
      analyzeDocuments: 'analyze-documents',
      analyzeWebsite: 'analyze-website',
      generateInsights: 'generate-insights'
    }
  }
};

/**
 * Storage key definitions to ensure consistent storage patterns
 */
export const STORAGE_KEYS = {
  // Project-related keys
  project: (projectId: string) => `project_${projectId}`,
  projectSettings: (projectId: string) => `project_settings_${projectId}`,
  projectDocuments: (projectId: string) => `project_documents_${projectId}`,
  projectInsights: (projectId: string) => `project_insights_${projectId}`,
  projectAnalysis: (projectId: string) => `project_analysis_${projectId}`,
  
  // Document-related keys
  documentContent: (documentId: string) => `document_content_${documentId}`,
  documentInsights: (documentId: string) => `document_insights_${documentId}`,
  documentStatus: (documentId: string) => `document_status_${documentId}`,
  
  // Insight-related keys
  insightDocuments: (insightId: string) => `insight_documents_${insightId}`,
  
  // Misc
  lastMigration: 'last_document_migration',
  migrationsCompleted: 'migrations_completed'
};

/**
 * Document lifecycle configuration
 */
export const DOCUMENT_CONFIG = {
  maxDocumentsPerProject: 100,
  defaultExpirationDays: 30,
  documentStatusUpdateInterval: 5000, // 5 seconds
  allowedDocumentTypes: [
    'application/pdf',
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ],
  maxDocumentSize: 25 * 1024 * 1024 // 25MB
};

// HTTP status codes for error handling
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
};

// Determine if an error is retriable based on status code
export function isRetriableError(status: number): boolean {
  return [
    HTTP_STATUS.TIMEOUT,
    HTTP_STATUS.TOO_MANY_REQUESTS,
    HTTP_STATUS.SERVER_ERROR,
    HTTP_STATUS.SERVICE_UNAVAILABLE,
    HTTP_STATUS.GATEWAY_TIMEOUT
  ].includes(status);
}
