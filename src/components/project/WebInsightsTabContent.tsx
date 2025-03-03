
import React from "react";
import { Project, StrategicInsight } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, RefreshCw, Loader2 } from "lucide-react";
import InsightsErrorAlert from "@/components/project/InsightsErrorAlert";
import InsightsEmptyState from "@/components/project/InsightsEmptyState";
import StrategicInsightCard from "@/components/project/StrategicInsightCard";

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
  
  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Website Insights</h2>
          <p className="text-slate-500 text-sm">
            Strategic insights generated from analyzing the client's website
          </p>
        </div>
        
        {hasWebsiteUrl && onAnalyzeWebsite && (
          <Button
            onClick={onAnalyzeWebsite}
            disabled={isAnalyzingWebsite}
            className="mt-4 md:mt-0 flex items-center gap-2"
          >
            {isAnalyzingWebsite ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing Website...
              </>
            ) : (
              <>
                <Globe size={16} />
                {hasWebsiteInsights ? 'Refresh Website Analysis' : 'Analyze Website'}
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Error display for website analysis */}
      <InsightsErrorAlert 
        error={websiteError} 
        onRetryAnalysis={onRetryAnalysis}
      />
      
      {/* Website URL display */}
      {hasWebsiteUrl && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Client Website</CardTitle>
            <CardDescription>
              Analysis based on the client's online presence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Globe size={16} className="mr-2 text-slate-400" />
              <a 
                href={(project.clientWebsite || '').startsWith('http') 
                  ? project.clientWebsite 
                  : `https://${project.clientWebsite}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {project.clientWebsite}
              </a>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* No website URL provided */}
      {!hasWebsiteUrl && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">No Website URL Provided</CardTitle>
            <CardDescription>
              Add a client website URL to analyze their online presence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700">
              Return to the Documents tab or Dashboard to add a website URL for the client.
              Website analysis can provide valuable insights about the client's brand positioning,
              target audience, and current marketing strategies.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Website Insights */}
      {hasWebsiteInsights ? (
        <div className="space-y-6">
          <div className="text-sm text-slate-600 mb-2">
            <span className="font-medium">{websiteInsights.length}</span> insights generated from website analysis
          </div>
          
          {websiteInsights.map(insight => (
            <StrategicInsightCard
              key={insight.id}
              insight={insight}
              reviewStatus={reviewedInsights[insight.id] || 'pending'}
              onAccept={() => onAcceptInsight(insight.id)}
              onReject={() => onRejectInsight(insight.id)}
              onUpdate={(content) => onUpdateInsight(insight.id, content)}
            />
          ))}
          
          <div className="flex justify-end mt-8">
            <Button
              variant="outline"
              onClick={onNavigateToInsights}
              className="flex items-center gap-2"
            >
              View Document Insights
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg p-8 text-center border border-dashed">
          <Globe size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-medium text-slate-800 mb-2">No Website Insights Yet</h3>
          <p className="text-slate-600 mb-6">
            {hasWebsiteUrl 
              ? "Click 'Analyze Website' to generate insights from the client's website."
              : "Add a client website URL in the Documents tab or Dashboard to analyze their online presence."}
          </p>
          {hasWebsiteUrl && onAnalyzeWebsite && (
            <Button
              onClick={onAnalyzeWebsite}
              disabled={isAnalyzingWebsite}
              className="mx-auto"
            >
              {isAnalyzingWebsite ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Analyzing Website...
                </>
              ) : (
                <>
                  <Globe size={16} className="mr-2" />
                  Analyze Website
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default WebInsightsTabContent;
