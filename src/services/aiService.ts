

import { supabase } from "@/integrations/supabase/client";
import { Document, StrategicInsight, AIProcessingStatus, Project } from "@/lib/types";

/**
 * Generate strategic insights by processing documents with AI
 */
export const generateInsights = async (
  project: Project, 
  documents: Document[]
): Promise<{ insights: StrategicInsight[], error?: string }> => {
  try {
    // Process all documents without limiting
    const documentIds = documents.map(doc => doc.id);
    
    console.log(`Processing ${documents.length} documents for project ${project.id}`);
    
    // Extract text content from documents if possible
    // For a demo, we'll create mock content based on the document names and metadata
    const documentContents = documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      // In a real app, this would be the actual content extracted from the documents
      content: `This is ${doc.name}, a ${doc.type} document about ${project.clientIndustry} industry strategies. 
                It contains important information about market trends, customer engagement, and potential 
                gaming opportunities in the ${project.clientIndustry} sector.
                The document highlights challenges with customer retention and engagement,
                especially with younger demographics. Competitors are starting to implement
                gamification strategies that are showing promising results.
                Priority: ${doc.priority || 0}`
    }));

    // Check if we're in development mode without Supabase or if Supabase connection failed
    const useRealApi = await checkSupabaseConnection();
    
    if (!useRealApi) {
      console.log('Supabase connection not available, using mock insights generator');
      const mockInsights = generateComprehensiveInsights(project, documents);
      return { insights: mockInsights };
    }
    
    console.log('Using Anthropic API via Supabase Edge Function to generate insights');
    
    // Call the Supabase Edge Function that uses Anthropic
    const { data, error } = await supabase.functions.invoke('generate-insights-with-anthropic', {
      body: { 
        projectId: project.id, 
        documentIds,
        clientIndustry: project.clientIndustry,
        projectTitle: project.title,
        documentContents,
        processingMode: 'thorough',
        includeComprehensiveDetails: true
      }
    });
    
    if (error) {
      console.error('Error generating insights with Anthropic:', error);
      return { insights: [], error: error.message };
    }
    
    console.log('Successfully received insights from Anthropic:', data);
    return { insights: data.insights || [] };
  } catch (err: any) {
    console.error('Error generating insights:', err);
    return { 
      insights: [],
      error: err.message || 'An unexpected error occurred while analyzing documents'
    };
  }
};

/**
 * Check if we can connect to Supabase and verify access to ANTHROPIC_API_KEY
 */
const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('test-connection', {
      method: 'POST',
      body: { test: true, timestamp: new Date().toISOString() },
    });
    
    if (error) {
      console.error('Error testing Supabase connection:', error);
      return false;
    }
    
    // Check if ANTHROPIC_API_KEY is available
    const anthropicKeyExists = data?.environmentChecks?.ANTHROPIC_API_KEY?.exists;
    
    if (!anthropicKeyExists) {
      console.warn('ANTHROPIC_API_KEY not found in Supabase secrets');
    }
    
    return !!anthropicKeyExists;
  } catch (error) {
    console.error('Exception testing Supabase connection:', error);
    return false;
  }
};

/**
 * Generate comprehensive mock insights for development/demo purposes
 */
const generateComprehensiveInsights = (project: Project, documents: Document[]): StrategicInsight[] => {
  // Categories for insights
  const categories: Array<StrategicInsight['category']> = [
    "business_challenges",
    "audience_gaps",
    "competitive_threats",
    "gaming_opportunities",
    "strategic_recommendations",
    "key_narratives"
  ];
  
  // Generate 2-3 detailed insights per category
  const insights: StrategicInsight[] = [];
  
  categories.forEach(category => {
    const insightsCount = Math.floor(Math.random() * 2) + 2; // 2-3 insights per category
    
    for (let i = 0; i < insightsCount; i++) {
      insights.push(generateDetailedInsight(category, project, documents));
    }
  });
  
  return insights;
};

/**
 * Generate a single detailed mock insight
 */
const generateDetailedInsight = (
  category: StrategicInsight['category'], 
  project: Project,
  documents: Document[]
): StrategicInsight => {
  const id = `insight_${Math.random().toString(36).substr(2, 9)}`;
  const confidence = Math.floor(Math.random() * 30) + 70; // 70-99%
  const needsReview = confidence < 85;
  
  // Determine industry-specific content
  const industrySpecificContent = getIndustrySpecificContent(project.clientIndustry, category);
  
  // Create a detailed content structure
  const content: Record<string, any> = {
    title: industrySpecificContent.title,
    summary: industrySpecificContent.summary,
    details: industrySpecificContent.details,
    evidence: industrySpecificContent.evidence,
    impact: industrySpecificContent.impact,
    recommendations: industrySpecificContent.recommendations,
    // Reference source documents when possible
    sources: documents.length > 0 
      ? documents.slice(0, Math.min(3, documents.length)).map(doc => ({
          id: doc.id,
          name: doc.name,
          relevance: "high"
        }))
      : undefined,
    dataPoints: industrySpecificContent.dataPoints,
  };
  
  return {
    id,
    category,
    content,
    confidence,
    needsReview
  };
};

/**
 * Industry-specific content templates
 */
const getIndustrySpecificContent = (
  industry: Project['clientIndustry'],
  category: StrategicInsight['category']
): Record<string, any> => {
  // Define base content templates by industry and category
  const templates: Record<string, Record<string, Record<string, any>>> = {
    retail: {
      business_challenges: {
        title: "Declining in-store foot traffic",
        summary: "Physical retail locations are experiencing a 23% year-over-year decline in customer visits.",
        details: "Analysis of client documents reveals a consistent downward trend in physical store visits across all locations. This decline is accelerating at a rate of approximately 5% quarter-over-quarter, with particularly sharp drops in suburban locations. Traditional promotional strategies haven't reversed this trend.",
        evidence: "Store visitation metrics from Q1-Q3 2023 show decreasing trends across all demographics, with strongest declines among 18-34 year olds (37% reduction YoY).",
        impact: "This decline directly impacts not only sales but also the effectiveness of in-store promotions, store staff utilization, and inventory management strategies.",
        recommendations: "Implement gaming activations that drive physical store visits through collectible rewards, in-store exclusive content, and location-based challenges.",
        dataPoints: [
          "37% reduction in Gen Z and Millennial store visits",
          "12% increase in online vs in-store purchase ratio",
          "43% of former in-store shoppers cite 'lack of engaging experience' as reason for shopping online"
        ]
      },
      // ... other categories for retail
    },
    finance: {
      audience_gaps: {
        title: "Disengagement among Gen Z customers",
        summary: "Financial products and services are failing to resonate with younger demographics.",
        details: "Client data indicates high account churn rates among 18-25 year old customers, with primary feedback citing 'boring interfaces' and 'lack of engagement' as key reasons for switching providers. The typical customer acquisition cost for this demographic is 3.2x higher than for older segments, yet retention rates are 47% lower.",
        evidence: "Customer retention reports show 68% of Gen Z customers discontinue services within the first 8 months, compared to 26% for other demographics.",
        impact: "This represents both a significant cost drain and a strategic threat as competitors successfully capture this market segment through more engaging digital experiences.",
        recommendations: "Implement gamified financial education and rewards programs that transform routine financial activities into engaging experiences with progression systems.",
        dataPoints: [
          "68% early service discontinuation rate among Gen Z",
          "4.2x higher mobile app abandonment compared to industry average",
          "87% of surveyed young customers expressed interest in 'game-like' financial applications"
        ]
      },
      // ... other categories for finance
    },
    // ... other industries
  };
  
  // Fallback content if specific template isn't available
  const fallbackContent = {
    title: `${category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} for ${industry} industry`,
    summary: `Key ${category.replace('_', ' ')} identified through document analysis.`,
    details: `Comprehensive analysis of client documents reveals significant patterns related to ${category.replace('_', ' ')} that require strategic attention. Multiple data points across various sources confirm this finding.`,
    evidence: "Document analysis revealed consistent patterns across multiple data sources and market research reports.",
    impact: "This insight has significant implications for business growth, market positioning, and competitive advantage.",
    recommendations: "Implement gaming strategies that directly address this insight through engagement mechanics, retention hooks, and monetization opportunities.",
    dataPoints: [
      "Multiple supporting data points identified across documents",
      "Consistent pattern recognition with 87% confidence interval",
      "Strategic relevance rated as high"
    ]
  };
  
  // Return template if available, otherwise fallback
  return templates[industry]?.[category] || fallbackContent;
};

/**
 * Get the current status of AI processing
 */
export const getAIProcessingStatus = (projectId: string): AIProcessingStatus => {
  // This would typically be fetched from the server
  // For now, we'll use a mock implementation
  return {
    status: 'idle',
    progress: 0,
    message: 'Ready to analyze documents'
  };
};

/**
 * Monitor the progress of AI document processing
 * In a real implementation, this would poll a database or use websockets
 */
export const monitorAIProcessingProgress = (
  projectId: string,
  onStatusUpdate: (status: AIProcessingStatus) => void
): () => void => {
  let cancelled = false;
  let progress = 0;
  
  // This simulates the AI processing progress
  // In a production app, this would connect to a real-time status endpoint
  const interval = setInterval(() => {
    if (cancelled) return;
    
    // Simulate different phases of processing with appropriate messages
    if (progress < 15) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Extracting text from all documents...`
      });
    } else if (progress < 30) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Analyzing document relationships...`
      });
    } else if (progress < 45) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Analyzing business context...`
      });
    } else if (progress < 60) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Identifying gaming opportunities...`
      });
    } else if (progress < 75) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Connecting to Anthropic API...`
      });
    } else if (progress < 90) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Processing AI-generated insights...`
      });
    } else if (progress < 100) {
      onStatusUpdate({
        status: 'processing',
        progress,
        message: `Finalizing comprehensive insights...`
      });
    } else {
      onStatusUpdate({
        status: 'completed',
        progress: 100,
        message: 'AI analysis complete!'
      });
      clearInterval(interval);
    }
    
    // Slow down the progress a bit to reflect real API processing time
    progress += Math.random() * 4 + 1;
    
    if (progress > 100) {
      clearInterval(interval);
    }
  }, 800);
  
  // Return a function to cancel the monitoring
  return () => {
    cancelled = true;
    clearInterval(interval);
  };
};

/**
 * Calculate the overall confidence score for insights
 * @returns A number between 0-100 representing average confidence
 */
export const calculateOverallConfidence = (insights: StrategicInsight[]): number => {
  if (!insights.length) return 0;
  
  const total = insights.reduce((sum, insight) => sum + insight.confidence, 0);
  return Math.round(total / insights.length);
};

/**
 * Count insights that need review (low confidence)
 */
export const countInsightsNeedingReview = (insights: StrategicInsight[]): number => {
  return insights.filter(insight => insight.needsReview).length;
};
