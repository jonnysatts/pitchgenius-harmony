
/**
 * Generate a context description from a website URL for AI analysis
 */
export const generateWebsiteContext = async (
  websiteUrl: string,
  projectId: string
): Promise<string> => {
  try {
    // Simple validation of the URL
    if (!websiteUrl || !websiteUrl.startsWith('http')) {
      return `Website URL (${websiteUrl}) is invalid or missing.`;
    }
    
    // This would typically call an API to extract content
    // For now, we'll return a simple description
    return `Website ${websiteUrl} for project ${projectId}. This appears to be a website related to gaming or internet services.`;
  } catch (error) {
    console.error('Error generating website context:', error);
    return `Error generating context for ${websiteUrl}: ${error instanceof Error ? error.message : String(error)}`;
  }
};
