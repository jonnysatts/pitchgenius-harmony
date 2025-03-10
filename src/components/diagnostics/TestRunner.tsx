
import { supabase } from "@/integrations/supabase/client";
import { FirecrawlService } from "@/utils/FirecrawlService";

// Test runners for individual test cases
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('test-connection', {
      method: 'POST',
      body: { test: true, timestamp: new Date().toISOString() }
    });
    
    return {
      success: !error,
      data,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error testing Supabase connection:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
};

export const testFirecrawlAPI = async () => {
  try {
    console.log("Testing Firecrawl API configuration...");
    const { data, error } = await supabase.functions.invoke('test-connection', {
      method: 'POST',
      body: { 
        testType: "firecrawl-api-check",
        timestamp: new Date().toISOString(),
        debugMode: true
      }
    });
    
    console.log("Firecrawl test response:", data);
    
    // Check if either FIRECRAWL_API_KEY or FIRECRAWL_API_KPI exists
    const firecrawlKeyExists = 
      (data?.firecrawlKeyExists === true);
    
    // Check for error message in data
    const errorMessage = data?.error || 
      (!firecrawlKeyExists ? "No Firecrawl API key found. Either FIRECRAWL_API_KEY or FIRECRAWL_API_KPI must be set." : null);
    
    return {
      success: !error && firecrawlKeyExists && !errorMessage,
      data,
      error: error ? error.message : errorMessage,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error testing Firecrawl API:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
};

export const testClaudeDirectAPI = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('claude-direct-test', {
      method: 'POST',
      body: { timestamp: new Date().toISOString() }
    });
    
    return {
      success: !error && data?.success,
      data,
      error: error ? error.message : data?.error || null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error testing Claude API:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
};

export const testWebsiteAnalysis = async () => {
  try {
    const testUrl = "https://example.com";
    console.log("Testing website analysis with URL:", testUrl);
    
    const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
      method: 'POST',
      body: { 
        website_url: testUrl,
        client_name: "Test Client",
        client_industry: "technology",
        test_mode: true
      }
    });
    
    console.log("Website analysis test response:", data);
    
    return {
      success: !error && !!data,
      data,
      error: error ? error.message : null,
      testUrl,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error testing website analysis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
};

export const testDocumentAnalysis = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-insights-with-anthropic', {
      method: 'POST',
      body: {
        projectId: "test-project",
        documentContents: [
          { 
            id: "test-doc-1", 
            content: "This is a test document for analysis. It contains some sample text to analyze." 
          }
        ],
        clientIndustry: "technology",
        debugMode: true,
        test_mode: true
      }
    });
    
    return {
      success: !error && !!data,
      data,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error testing document analysis:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
};
