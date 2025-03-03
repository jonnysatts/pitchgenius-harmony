
import React from "react";
import { Project, StrategicInsight } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import InsightsErrorAlert from "@/components/project/InsightsErrorAlert";
import InsightsStats from "@/components/project/InsightsStats";
import StrategicInsightCard from "@/components/project/StrategicInsightCard";
import InsightsEmptyState from "@/components/project/InsightsEmptyState";

interface InsightsTabContentProps {
  project: Project;
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  error?: string | null;
  overallConfidence?: number;
  needsReviewCount?: number;
  usingFallbackInsights?: boolean;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
  onRetryAnalysis?: () => void;
}

const InsightsTabContent: React.FC<InsightsTabContentProps> = ({
  project,
  insights,
  reviewedInsights,
  error,
  overallConfidence,
  needsReviewCount,
  usingFallbackInsights,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight,
  onRetryAnalysis
}) => {
  // Only show document insights, not website insights
  const documentInsights = insights.filter(insight => insight.source === 'document');
  const hasInsights = documentInsights.length > 0;
  
  // Only set as fallback insights for display if there are insights and the flag is true
  const showingFallbackInsights = hasInsights && usingFallbackInsights;
  
  // Filter for document-specific error messages (that don't mention websites)
  const docError = error && !error.includes('website') ? error : null;
  
  // Count the insights that have been accepted
  const acceptedCount = documentInsights.filter(
    insight => reviewedInsights[insight.id] === 'accepted'
  ).length;
  
  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Document Insights</h2>
          <p className="text-slate-500 text-sm">
            Strategic insights generated from analyzing the client documents
          </p>
        </div>
        
        {hasInsights && onRetryAnalysis && (
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="mt-4 md:mt-0 flex items-center gap-2"
              >
                <RefreshCcw size={16} />
                Refresh Analysis
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Refresh Document Analysis</DialogTitle>
                <DialogDescription>
                  This will restart the document analysis process using Claude AI. 
                  The current insights will be replaced with new ones. Are you sure?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => document.querySelector('[data-state="open"] button[aria-label="Close"]')?.dispatchEvent(new MouseEvent('click', {bubbles: true}))}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    onRetryAnalysis();
                    document.querySelector('[data-state="open"] button[aria-label="Close"]')?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                  }}
                >
                  Confirm Refresh
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <InsightsErrorAlert 
        error={docError} 
        onRetryAnalysis={onRetryAnalysis}
      />
      
      {hasInsights && (
        <div className="mb-6">
          <InsightsStats
            insightCount={documentInsights.length}
            acceptedCount={acceptedCount}
            needsReviewCount={needsReviewCount || 0}
            confidence={overallConfidence}
            usingFallbackInsights={showingFallbackInsights}
          />
        </div>
      )}
      
      {hasInsights ? (
        <div className="space-y-6">
          {documentInsights.map((insight) => (
            <StrategicInsightCard
              key={insight.id}
              insight={insight}
              reviewStatus={reviewedInsights[insight.id] || 'pending'}
              onAccept={() => onAcceptInsight(insight.id)}
              onReject={() => onRejectInsight(insight.id)}
              onUpdate={(updatedContent) => onUpdateInsight(insight.id, updatedContent)}
            />
          ))}
        </div>
      ) : (
        <InsightsEmptyState 
          onRetryAnalysis={onRetryAnalysis} 
        />
      )}
    </div>
  );
};

export default InsightsTabContent;
