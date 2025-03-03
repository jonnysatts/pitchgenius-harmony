
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectWelcomeAlert from "@/components/project/ProjectWelcomeAlert";
import ProjectHeader from "@/components/project/ProjectHeader";
import ErrorAlert from "@/components/project/ErrorAlert";
import DocumentsTabContent from "@/components/project/DocumentsTabContent";
import InsightsTabContent from "@/components/project/InsightsTabContent";
import PresentationTabContent from "@/components/project/PresentationTabContent";
import HelpTabContent from "@/components/project/HelpTabContent";
import { FileText, Lightbulb, Presentation, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Document, StrategicInsight, AIProcessingStatus } from "@/lib/types";

interface ProjectDetailContentProps {
  project: Project;
  documents: Document[];
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  error: string | null;
  aiStatus: AIProcessingStatus;
  overallConfidence: number;
  needsReviewCount: number;
  usingFallbackInsights: boolean;
  isNewProject: boolean;
  isLoading?: boolean;
  handleFilesSelected: (files: File[]) => void;
  handleRemoveDocument: (documentId: string) => void;
  handleAnalyzeDocuments: () => void;
  handleAcceptInsight: (insightId: string) => void;
  handleRejectInsight: (insightId: string) => void;
  navigateToPresentation: () => void;
  onRetryAnalysis: () => void;
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
  usingFallbackInsights,
  isNewProject,
  isLoading = false,
  handleFilesSelected,
  handleRemoveDocument,
  handleAnalyzeDocuments,
  handleAcceptInsight,
  handleRejectInsight,
  navigateToPresentation,
  onRetryAnalysis
}) => {
  const { toast } = useToast();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectWelcomeAlert 
        mockProjectWarning={false} 
        newProjectTitle={project.title} 
        newProjectClient={project.clientName} 
        isNewProject={isNewProject}
      />
      
      <ProjectHeader project={project} />
      
      <ErrorAlert error={error} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText size={16} />
            Documents
            {documents.length > 0 && (
              <Badge variant="secondary" className="ml-1">{documents.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb size={16} />
            Strategic Insights
            {insights.length > 0 && (
              <Badge variant="secondary" className="ml-1">{insights.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="presentation" className="flex items-center gap-2">
            <Presentation size={16} />
            Presentation
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <CircleHelp size={16} />
            Help
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents">
          <DocumentsTabContent 
            documents={documents}
            project={project}
            aiStatus={aiStatus}
            isLoading={isLoading}
            onFilesSelected={handleFilesSelected}
            onRemoveDocument={handleRemoveDocument}
            onAnalyzeDocuments={handleAnalyzeDocuments}
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
            onAcceptInsight={handleAcceptInsight}
            onRejectInsight={handleRejectInsight}
            onNavigateToDocuments={() => setActiveTab("documents")}
            onNavigateToPresentation={navigateToPresentation}
            onRetryAnalysis={onRetryAnalysis}
          />
        </TabsContent>
        
        <TabsContent value="presentation">
          <PresentationTabContent />
        </TabsContent>
        
        <TabsContent value="help">
          <HelpTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailContent;
