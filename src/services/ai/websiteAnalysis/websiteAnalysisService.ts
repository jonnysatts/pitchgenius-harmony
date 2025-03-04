
import { Project, StrategicInsight } from "@/lib/types";
import { callWebsiteAnalysisApi } from "./claudeApiService";
import { generateFallbackWebsiteInsights } from "./fallbackInsightGenerator";
import { processWebsiteInsights } from "./websiteInsightProcessor";
import { v4 as uuidv4 } from 'uuid';

/**
 * Analyzes a client's website to generate strategic insights
 */
export const analyzeClientWebsite = async (project: Project) => {
  // Validate inputs
  if (!project.clientWebsite) {
    console.error('No website URL provided for analysis');
    return {
      insights: [],
      error: "No website URL provided for analysis"
    };
  }

  try {
    console.log(`Analyzing website: ${project.clientWebsite}`);
    
    // Call the Claude API for website analysis
    const websiteAnalysisParams = {
      website_url: project.clientWebsite, 
      client_name: project.clientName || '',
      client_industry: project.industry || 'technology',
      use_firecrawl: true // Use Firecrawl by default for better content extraction
    };
    
    const response = await callWebsiteAnalysisApi(websiteAnalysisParams);
    
    if (!response.success) {
      console.error('Website analysis API error:', response.error);
      
      // Generate fallback insights if API call fails
      const fallbackInsights = generateFallbackWebsiteInsights(
        project.clientWebsite,
        project.clientName || '',
        project.industry || 'technology'
      );
      
      // Process fallback insights with project context
      const processedFallbackInsights = processWebsiteInsights(fallbackInsights, project);
      
      return {
        insights: processedFallbackInsights,
        error: `Website analysis API error: ${response.error}`
      };
    }
    
    // Process raw insights with project context
    let insights = response.data || [];
    
    // Add unique IDs to insights if missing
    insights = insights.map(insight => ({
      ...insight,
      id: insight.id || `website-${insight.category || 'insight'}-${uuidv4()}`
    }));
    
    // If API returned no insights, use fallback
    if (!insights || insights.length === 0) {
      console.warn('API returned no insights, using fallback generator');
      insights = generateFallbackWebsiteInsights(
        project.clientWebsite,
        project.clientName || '',
        project.industry || 'technology'
      );
    }
    
    // Process insights through our processor to ensure proper formatting
    const processedInsights = processWebsiteInsights(insights, project);
    
    return {
      insights: processedInsights,
      error: null
    };
  } catch (err) {
    console.error('Error in analyzeClientWebsite:', err);
    
    // Generate fallback insights if there was an error
    const fallbackInsights = generateFallbackWebsiteInsights(
      project.clientWebsite,
      project.clientName || '',
      project.industry || 'technology'
    );
    
    // Process fallback insights
    const processedFallbackInsights = processWebsiteInsights(fallbackInsights, project);
    
    return {
      insights: processedFallbackInsights,
      error: err instanceof Error ? err.message : 'Unknown error during website analysis'
    };
  }
};

/**
 * Gets the status of an ongoing website analysis
 */
export const getWebsiteAnalysisStatus = async (projectId: string) => {
  // Implementation for getting the analysis status
  return {
    status: 'processing',
    progress: 0.5,
    message: 'Analyzing website content...'
  };
};

/**
 * Extracts strategic insights from raw website data
 */
export const extractInsightsFromWebsiteData = (websiteData: any, project?: Project) => {
  try {
    // Basic validation
    if (!websiteData || (typeof websiteData === 'object' && Object.keys(websiteData).length === 0)) {
      console.warn('Empty website data provided to extractInsightsFromWebsiteData');
      return [];
    }
    
    // If website data is already an array of insights, process it
    if (Array.isArray(websiteData)) {
      return processWebsiteInsights(websiteData, project);
    }
    
    // If website data is a string (raw HTML/text), generate fallback insights
    if (typeof websiteData === 'string') {
      const fallbackInsights = generateFallbackWebsiteInsights(
        project?.clientWebsite || 'unknown',
        project?.clientName || '',
        project?.industry || 'technology'
      );
      return processWebsiteInsights(fallbackInsights, project);
    }
    
    // Handle object with data property
    if (websiteData.data && Array.isArray(websiteData.data)) {
      return processWebsiteInsights(websiteData.data, project);
    }
    
    // If nothing worked, return empty array
    return [];
  } catch (error) {
    console.error('Error extracting insights from website data:', error);
    return [];
  }
};
