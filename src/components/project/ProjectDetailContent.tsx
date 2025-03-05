import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project, StrategicInsight } from "@/lib/types";
import ProjectHeader from "@/components/project/ProjectHeader";
import DocumentsTabContent from "@/components/project/DocumentsTabContent";
import InsightsTabContent from "@/components/project/InsightsTabContent";
import HelpTabContent from "@/components/project/HelpTabContent";
import PresentationTabContent from "@/components/project/PresentationTabContent";
import WebInsightsTabContent from "@/components/project/WebInsightsTabContent";
import ProjectWelcomeAlert from "@/components/project/ProjectWelcomeAlert";

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
  
  return (
    <div className="container mx-auto px-4 py-6">
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-5 mb-8">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="webinsights">Web Insights</TabsTrigger>
            <TabsTrigger value="presentation">Presentation</TabsTrigger>
            <TabsTrigger value="help" className="hidden lg:block">Help</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents">
            <DocumentsTabContent 
              project={project}
              documents={documents}
              onFilesSelected={handleFilesSelected}
              onRemoveDocument={handleRemoveDocument}
              onAnalyzeDocuments={handleAnalyzeDocuments}
              isLoading={isLoading}
              error={error}
            />
          </TabsContent>
          
          <TabsContent value="insights">
            <InsightsTabContent 
              project={project}
              insights={documentInsights}
              reviewedInsights={reviewedInsights}
              error={error}
              aiStatus={aiStatus}
              overallConfidence={overallConfidence}
              needsReviewCount={needsReviewCount}
              usingFallbackInsights={usingFallbackInsights}
              onAcceptInsight={handleAcceptInsight}
              onRejectInsight={handleRejectInsight}
              onUpdateInsight={handleUpdateInsight}
              onNavigateToWebInsights={() => setActiveTab("webinsights")}
              onRetryAnalysis={onRetryAnalysis}
              onRefreshInsights={onRefreshInsights}
            />
          </TabsContent>
          
          <TabsContent value="webinsights">
            <WebInsightsTabContent 
              websiteUrl={project.clientWebsite}
              isAnalyzingWebsite={isAnalyzingWebsite}
              insights={websiteInsights}
              reviewedInsights={reviewedInsights}
              error={error}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleAnalyzeWebsite={handleAnalyzeWebsite}
              onAcceptInsight={handleAcceptInsight}
              onRejectInsight={handleRejectInsight}
              onUpdateInsight={handleUpdateInsight}
              aiStatus={aiStatus}
            />
          </TabsContent>
          
          <TabsContent value="presentation">
            <PresentationTabContent 
              project={project}
              insights={insights}
              acceptedInsights={acceptedInsights}
            />
          </TabsContent>
          
          <TabsContent value="help">
            <HelpTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectDetailContent;
