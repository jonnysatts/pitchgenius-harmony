
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIProcessingStatus, Project, Document, StrategicInsight } from "@/lib/types";
import ProjectHeader from "@/components/project/ProjectHeader";
import DocumentsTabContent from "@/components/project/DocumentsTabContent";
import InsightsTabContent from "@/components/project/InsightsTabContent";
import PresentationTabContent from "@/components/project/PresentationTabContent";
import HelpTabContent from "@/components/project/HelpTabContent";
import ProjectWelcomeAlert from "@/components/project/ProjectWelcomeAlert";

interface ProjectDetailContentProps {
  project: Project;
  documents: Document[];
  insights: StrategicInsight[];
  acceptedInsights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  error?: string | null;
  aiStatus?: AIProcessingStatus;
  overallConfidence: number;
  needsReviewCount: number;
  usingFallbackInsights?: boolean;
  isNewProject: boolean;
  isLoading: boolean;
  isAnalyzingWebsite?: boolean;
  handleFilesSelected: (files: File[]) => void;
  handleRemoveDocument: (documentId: string) => void;
  handleAnalyzeDocuments: () => void;
  handleAnalyzeWebsite?: () => void;
  handleAcceptInsight: (insightId: string) => void;
  handleRejectInsight: (insightId: string) => void;
  handleUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
  navigateToPresentation: () => void;
  onRetryAnalysis?: () => void;
}

const ProjectDetailContent: React.FC<ProjectDetailContentProps> = ({
  project,
  documents,
  insights,
  acceptedInsights,
  reviewedInsights,
  activeTab,
  setActiveTab,
  error,
  aiStatus,
  overallConfidence,
  needsReviewCount,
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
  onRetryAnalysis
}) => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ProjectHeader 
        project={project} 
        activeTab={activeTab}
        aiStatus={aiStatus}
      />
      
      {isNewProject && <ProjectWelcomeAlert isNewProject={isNewProject} />}
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="mt-6"
      >
        <TabsList className="grid grid-cols-4 w-full max-w-[600px] mb-6">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="presentation">Presentation</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents">
          <DocumentsTabContent 
            documents={documents}
            project={project}
            isLoading={isLoading}
            onFilesSelected={handleFilesSelected}
            onRemoveDocument={handleRemoveDocument}
            onAnalyzeDocuments={handleAnalyzeDocuments}
            aiStatus={aiStatus}
            isAnalyzingWebsite={isAnalyzingWebsite}
            onAnalyzeWebsite={handleAnalyzeWebsite}
            websiteUrl={project.clientWebsite}
          />
        </TabsContent>
        
        <TabsContent value="insights">
          <InsightsTabContent
            insights={insights}
            reviewedInsights={reviewedInsights}
            overallConfidence={overallConfidence}
            needsReviewCount={needsReviewCount}
            error={error}
            usingFallbackInsights={usingFallbackInsights}
            aiStatus={aiStatus}
            onAcceptInsight={handleAcceptInsight}
            onRejectInsight={handleRejectInsight}
            onUpdateInsight={handleUpdateInsight}
            onNavigateToDocuments={() => setActiveTab("documents")}
            onNavigateToPresentation={navigateToPresentation}
            onRetryAnalysis={onRetryAnalysis}
          />
        </TabsContent>
        
        <TabsContent value="presentation">
          <PresentationTabContent 
            project={project}
            acceptedInsights={acceptedInsights}
          />
        </TabsContent>
        
        <TabsContent value="help">
          <HelpTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailContent;
