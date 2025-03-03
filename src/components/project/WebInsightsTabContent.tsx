
import React from "react";
import { Project, StrategicInsight, WebsiteInsightCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import InsightsErrorAlert from "@/components/project/InsightsErrorAlert";
import { websiteInsightCategories } from "@/components/project/insights/constants";
import {
  WebsiteUrlCard,
  NoWebsiteCard,
  NoInsightsEmptyState,
  WebInsightsTabs,
  WebInsightsHeader
} from "@/components/project/web-insights";

interface WebInsightsTabContentProps {
  project: Project;
  websiteInsights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  isAnalyzingWebsite?: boolean;
  error?: string | null;
  onAnalyzeWebsite?: () => void;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
  onNavigateToInsights: () => void;
  onRetryAnalysis?: () => void;
}

const WebInsightsTabContent: React.FC<WebInsightsTabContentProps> = ({
  project,
  websiteInsights,
  reviewedInsights,
  isAnalyzingWebsite = false,
  error,
  onAnalyzeWebsite,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight,
  onNavigateToInsights,
  onRetryAnalysis
}) => {
  // Check if there's a website URL available
  const hasWebsiteUrl = !!project.clientWebsite;
  
  // Filter for website-specific error messages
  const websiteError = error && (error.includes('website analysis') || error.includes('Website analysis'))
    ? error
    : null;

  // Website insights are already filtered in the parent component
  const hasWebsiteInsights = websiteInsights.length > 0;
  
  // Group insights by category with proper type checking and fallbacks
  const insightsByCategory = websiteInsights.reduce((acc, insight) => {
    // Add a fallback for category - default to "company_positioning" if not set
    // Make sure category is a valid WebsiteInsightCategory
    let category = (insight.category || "company_positioning") as WebsiteInsightCategory;
    
    // Validate that the category exists in our defined categories, if not use default
    if (!websiteInsightCategories.some(cat => cat.id === category)) {
      console.warn(`Invalid category ${category} for insight ${insight.id}, defaulting to company_positioning`);
      category = "company_positioning";
    }
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(insight);
    return acc;
  }, {} as Record<WebsiteInsightCategory, StrategicInsight[]>);
  
  // Make sure every category has an array, even if empty
  websiteInsightCategories.forEach(category => {
    const categoryId = category.id as WebsiteInsightCategory;
    if (!insightsByCategory[categoryId]) {
      insightsByCategory[categoryId] = [];
    }
  });
  
  return (
    <div className="bg-white p-6 rounded-lg border">
      {/* Header with proper props */}
      <WebInsightsHeader 
        websiteUrl={project.clientWebsite}
        hasWebsiteUrl={hasWebsiteUrl}
        isAnalyzing={isAnalyzingWebsite}
        onAnalyzeWebsite={onAnalyzeWebsite}
        hasInsights={hasWebsiteInsights}
      />
      
      {/* Error display for website analysis */}
      <InsightsErrorAlert 
        error={websiteError} 
        onRetryAnalysis={onRetryAnalysis}
      />
      
      {/* Website URL display */}
      {hasWebsiteUrl && <WebsiteUrlCard websiteUrl={project.clientWebsite} />}
      
      {/* No website URL provided */}
      {!hasWebsiteUrl && <NoWebsiteCard />}
      
      {/* Website Insights */}
      {hasWebsiteInsights ? (
        <>
          <WebInsightsTabs
            insightsByCategory={insightsByCategory}
            reviewedInsights={reviewedInsights}
            onAcceptInsight={onAcceptInsight}
            onRejectInsight={onRejectInsight}
            onUpdateInsight={onUpdateInsight}
            totalInsightsCount={websiteInsights.length}
          />
          
          <div className="flex justify-end mt-8">
            <Button
              variant="outline"
              onClick={onNavigateToInsights}
              className="flex items-center gap-2"
            >
              View Document Insights
            </Button>
          </div>
        </>
      ) : (
        <NoInsightsEmptyState
          hasWebsiteUrl={hasWebsiteUrl}
          isAnalyzing={isAnalyzingWebsite}
          onAnalyzeWebsite={onAnalyzeWebsite}
        />
      )}
    </div>
  );
};

export default WebInsightsTabContent;
