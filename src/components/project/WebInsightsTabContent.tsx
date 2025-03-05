
import React, { useMemo } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import NoWebsiteCard from "./web-insights/NoWebsiteCard";
import WebsiteUrlCard from "./web-insights/WebsiteUrlCard";
import { WebInsightsHeader } from "./web-insights/WebInsightsHeader";
import WebInsightsTabs from "./web-insights/WebInsightsTabs";
import { NoInsightsEmptyState } from "./web-insights/NoInsightsEmptyState";
import { WebsiteAnalysisControls } from "./web-insights/WebsiteAnalysisControls";
import { WebsiteInsightCategory, StrategicInsight, AIProcessingStatus, Project } from "@/lib/types";
import { websiteInsightCategories } from "@/components/project/insights/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface WebInsightsTabContentProps {
  websiteUrl?: string;
  isAnalyzingWebsite: boolean;
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  error: string | null | undefined;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleAnalyzeWebsite: () => void;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
  aiStatus?: AIProcessingStatus;
}

const WebInsightsTabContent: React.FC<WebInsightsTabContentProps> = ({
  websiteUrl,
  isAnalyzingWebsite,
  insights,
  reviewedInsights,
  error,
  activeTab,
  setActiveTab,
  handleAnalyzeWebsite,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight,
  aiStatus
}) => {
  // Check if insights contain error indicators or are fallbacks
  const containsErrorsOrFallbacks = useMemo(() => {
    if (!insights || insights.length === 0) return false;
    
    // Common patterns that indicate error insights or fallbacks
    const errorTitles = [
      "Improve Website Accessibility",
      "Website Accessibility Issue", 
      "Website Unavailable",
      "Prioritize Website Accessibility",
      "Unable to Assess",
      "Unable to Identify",
      "Unable to Evaluate", 
      "Unable to Provide",
      "Placeholder Title"
    ];
    
    const fallbackPatterns = [
      "Essential Business Focus Areas",
      "Target Audience Analysis",
      "Competitive Differentiation",
      "Growth Expansion Possibilities",
      "Strategic Priorities",
      "Core Brand Narratives"
    ];
    
    // Look for fallback IDs (typically contain "fallback")
    const hasFallbackIds = insights.some(insight => 
      insight.id && insight.id.includes('fallback')
    );
    
    // Check for error titles
    const hasErrorTitles = insights.some(insight => 
      errorTitles.some(errorTitle => 
        insight.content?.title?.includes(errorTitle)
      )
    );
    
    // Check for fallback content patterns that typically appear in generated fallbacks
    const hasGenericFallbackContent = insights.some(insight => {
      const title = insight.content?.title || '';
      const details = insight.content?.details || '';
      
      return fallbackPatterns.some(pattern => title.includes(pattern)) && 
             (details.includes("Evidence would normally be extracted") || 
              details.includes("No specific evidence"));
    });
    
    return hasErrorTitles || hasFallbackIds || hasGenericFallbackContent;
  }, [insights]);
  
  // Check if we have actual meaningful insights (not error-related)
  const hasRealInsights = useMemo(() => {
    if (!insights || insights.length === 0) return false;
    return !containsErrorsOrFallbacks;
  }, [insights, containsErrorsOrFallbacks]);
  
  // Organize insights by category
  const insightsByCategory = useMemo(() => {
    const categories = {} as Record<WebsiteInsightCategory, StrategicInsight[]>;
    
    // Initialize categories with empty arrays
    websiteInsightCategories.forEach(category => {
      categories[category.id as WebsiteInsightCategory] = [];
    });
    
    // Only populate categories if we have real insights
    if (hasRealInsights) {
      // Populate categories with insights
      insights.forEach(insight => {
        const category = insight.category as WebsiteInsightCategory;
        if (categories[category]) {
          categories[category].push(insight);
        }
      });
    }
    
    return categories;
  }, [insights, hasRealInsights]);

  // Get filtered categories that have insights
  const filteredCategories = useMemo(() => {
    return websiteInsightCategories.filter(category => {
      const categoryId = category.id as WebsiteInsightCategory;
      return insightsByCategory[categoryId]?.length > 0;
    });
  }, [insightsByCategory]);

  // Show error in the main content area if we have error insights but no real error message
  const shouldShowErrorBanner = useMemo(() => {
    return (containsErrorsOrFallbacks && !hasRealInsights && !isAnalyzingWebsite) || 
           (error !== null && error !== undefined);
  }, [containsErrorsOrFallbacks, hasRealInsights, isAnalyzingWebsite, error]);

  // Determine the appropriate error message to show
  const errorMessage = useMemo(() => {
    if (error) return error;
    
    if (containsErrorsOrFallbacks && !hasRealInsights) {
      // Extract a potentially useful error message from insights
      const firstInsight = insights[0];
      if (firstInsight?.content?.details) {
        return firstInsight.content.details;
      }
      return "We couldn't generate meaningful insights from this website. The site may have access restrictions or insufficient content.";
    }
    
    return null;
  }, [error, containsErrorsOrFallbacks, hasRealInsights, insights]);

  return (
    <div>
      <WebInsightsHeader 
        websiteUrl={websiteUrl}
        hasWebsiteUrl={!!websiteUrl}
        isAnalyzing={isAnalyzingWebsite}
        onAnalyzeWebsite={handleAnalyzeWebsite}
        hasInsights={hasRealInsights}
        aiStatus={aiStatus}
      />
      
      {!websiteUrl ? (
        <NoWebsiteCard />
      ) : (
        <>
          <WebsiteUrlCard websiteUrl={websiteUrl} />
          
          {/* Only show analysis controls when actively analyzing */}
          {isAnalyzingWebsite && (
            <div className="mt-6">
              <WebsiteAnalysisControls 
                project={{
                  id: '1',
                  clientWebsite: websiteUrl,
                  title: '',
                  clientName: '',
                  clientIndustry: '',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  ownerId: '',
                  description: ''
                } as Project}
                isAnalyzing={isAnalyzingWebsite}
                onAnalyzeWebsite={handleAnalyzeWebsite}
                hasInsights={hasRealInsights}
                aiStatus={aiStatus}
                error={error}
              />
            </div>
          )}

          {shouldShowErrorBanner && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Website Analysis Failed</AlertTitle>
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
              <p className="mt-2 text-sm">
                Please try a different website URL or check the URL format. Common issues include website protection, CORS policies, or temporary site unavailability.
              </p>
            </Alert>
          )}

          {hasRealInsights ? (
            <WebInsightsTabs
              insightsByCategory={insightsByCategory}
              reviewedInsights={reviewedInsights}
              onAcceptInsight={onAcceptInsight}
              onRejectInsight={onRejectInsight}
              onUpdateInsight={onUpdateInsight}
              totalInsightsCount={insights.length}
              insights={insights}
            />
          ) : (
            <NoInsightsEmptyState 
              hasWebsiteUrl={!!websiteUrl}
              isAnalyzing={isAnalyzingWebsite}
              error={errorMessage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default WebInsightsTabContent;
