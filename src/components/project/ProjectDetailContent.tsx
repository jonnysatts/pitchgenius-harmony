
import React, { useEffect } from "react";
import { Project, StrategicInsight } from "@/lib/types";
import ProjectHeader from "@/components/project/ProjectHeader";
import DocumentsTabContent from "@/components/project/DocumentsTabContent";
import InsightsTabContent from "@/components/project/InsightsTabContent";
import HelpTabContent from "@/components/project/HelpTabContent";
import PresentationTabContent from "@/components/project/PresentationTabContent";
import WebInsightsTabContent from "@/components/project/WebInsightsTabContent";
import ProjectWelcomeAlert from "@/components/project/ProjectWelcomeAlert";
import { ModernTabNav } from "@/components/project/navigation/ModernTabNav";

interface ProjectDetailContentProps {
  project: Project;
  documents: any[];
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  error: string | null;
  aiStatus: any;
  overallConfidence: number;
  needsReviewCount: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
  acceptedInsights: StrategicInsight[];
  usingFallbackInsights: boolean;
  isNewProject: boolean;
  isLoading: boolean;
  isAnalyzingWebsite: boolean;
  handleFilesSelected: (files: File[]) => void;
  handleRemoveDocument: (documentId: string) => void;
  handleAnalyzeDocuments: () => void;
  handleAnalyzeWebsite: () => void;
  handleAcceptInsight: (insightId: string) => void;
  handleRejectInsight: (insightId: string) => void;
  handleUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
  navigateToPresentation: () => void;
  onRetryAnalysis: () => void;
  onRefreshInsights?: () => void;
}

const ProjectDetailContent: React.FC<ProjectDetailContentProps> = ({
  project,
  documents,
  insights,
  reviewedInsights,
  activeTab,
  setActiveTab,
  error,
  aiStatus,
  overallConfidence,
  needsReviewCount,
  pendingCount,
  acceptedCount,
  rejectedCount,
  acceptedInsights,
  usingFallbackInsights,
  isNewProject,
  isLoading,
  isAnalyzingWebsite,
  handleFilesSelected,
  handleRemoveDocument,
  handleAnalyzeDocuments,
  handleAnalyzeWebsite,
  handleAcceptInsight,
  handleRejectInsight,
  handleUpdateInsight,
  navigateToPresentation,
  onRetryAnalysis,
  onRefreshInsights
}) => {
  const documentInsights = insights.filter(insight => insight.source !== 'website');
  const websiteInsights = insights.filter(insight => insight.source === 'website');
  
  useEffect(() => {
    if (isAnalyzingWebsite) {
      setActiveTab("webinsights");
    }
  }, [isAnalyzingWebsite, setActiveTab]);
  
  const handleAnalyzeAndNavigate = () => {
    handleAnalyzeWebsite();
  };
  
  // Create navigation data for the tabs
  const navItems = [
    { id: "documents", label: "Documents", count: documents.length },
    { id: "insights", label: "Insights", count: documentInsights.length },
    { id: "webinsights", label: "Web Insights", count: websiteInsights.length },
    { id: "presentation", label: "Presentation", count: null },
  ];
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-screen-xl">
      <ProjectHeader 
        project={project}
        insights={insights}
        isNewProject={isNewProject}
        setActiveTab={setActiveTab}
        navigateToPresentation={navigateToPresentation}
      />
      
      {isNewProject && !documents.length && (
        <ProjectWelcomeAlert setActiveTab={setActiveTab} />
      )}
      
      <div className="mt-6">
        <ModernTabNav 
          items={navItems} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        <div className="mt-4 min-h-[500px] bg-white rounded-lg shadow-sm border border-slate-100 p-6">
          {activeTab === "documents" && (
            <DocumentsTabContent 
              project={project}
              documents={documents}
              onFilesSelected={handleFilesSelected}
              onRemoveDocument={handleRemoveDocument}
              onAnalyzeDocuments={handleAnalyzeDocuments}
              isLoading={isLoading}
              error={error}
              aiStatus={aiStatus}
              onAnalyzeWebsite={handleAnalyzeAndNavigate}
              isAnalyzingWebsite={isAnalyzingWebsite}
              websiteUrl={project.clientWebsite}
            />
          )}
          
          {activeTab === "insights" && (
            <InsightsTabContent 
              project={project}
              insights={documentInsights}
              reviewedInsights={reviewedInsights}
              error={error}
              aiStatus={aiStatus}
              overallConfidence={overallConfidence}
              needsReviewCount={needsReviewCount}
              pendingCount={pendingCount}
              acceptedCount={acceptedCount}
              rejectedCount={rejectedCount}
              usingFallbackInsights={usingFallbackInsights}
              onAcceptInsight={handleAcceptInsight}
              onRejectInsight={handleRejectInsight}
              onUpdateInsight={handleUpdateInsight}
              onNavigateToWebInsights={() => setActiveTab("webinsights")}
              onRetryAnalysis={onRetryAnalysis}
              onRefreshInsights={onRefreshInsights}
            />
          )}
          
          {activeTab === "webinsights" && (
            <WebInsightsTabContent 
              websiteUrl={project.clientWebsite}
              isAnalyzingWebsite={isAnalyzingWebsite}
              insights={websiteInsights}
              reviewedInsights={reviewedInsights}
              error={error}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleAnalyzeWebsite={handleAnalyzeAndNavigate}
              onAcceptInsight={handleAcceptInsight}
              onRejectInsight={handleRejectInsight}
              onUpdateInsight={handleUpdateInsight}
              aiStatus={aiStatus}
            />
          )}
          
          {activeTab === "presentation" && (
            <PresentationTabContent 
              project={project}
              insights={insights}
              acceptedInsights={acceptedInsights}
            />
          )}
          
          {activeTab === "help" && (
            <HelpTabContent />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailContent;
