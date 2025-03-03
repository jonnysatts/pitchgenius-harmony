
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { MOCK_PROJECTS } from "@/data/mockProjects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/lib/types";
import { checkSupabaseConnection } from "@/services/ai";
import { calculateOverallConfidence, countInsightsNeedingReview } from "@/services/ai";
import { FileText, Lightbulb, Presentation, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";

// Import hooks
import { useAiAnalysis } from "@/hooks/useAiAnalysis";
import { useDocuments } from "@/hooks/useDocuments";
import { useInsightsReview } from "@/hooks/useInsightsReview";

// Import the components
import ProjectHeader from "@/components/project/ProjectHeader";
import ProjectWelcomeAlert from "@/components/project/ProjectWelcomeAlert";
import ErrorAlert from "@/components/project/ErrorAlert";
import DocumentsTabContent from "@/components/project/DocumentsTabContent";
import InsightsTabContent from "@/components/project/InsightsTabContent";
import PresentationTabContent from "@/components/project/PresentationTabContent";
import HelpTabContent from "@/components/project/HelpTabContent";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const location = useLocation();
  
  const project = MOCK_PROJECTS.find(p => p.id === projectId) as Project;
  const [activeTab, setActiveTab] = useState("documents");
  
  // Get state from location
  const mockProjectWarning = location.state?.mockProjectWarning;
  const newProjectTitle = location.state?.newProjectTitle;
  const newProjectClient = location.state?.newProjectClient;
  
  // Use our custom hooks
  const { 
    documents, 
    handleFilesSelected, 
    handleRemoveDocument 
  } = useDocuments(projectId || '', user?.id || '');
  
  const {
    insights,
    aiStatus,
    error,
    useRealAI,
    processingComplete,
    setUseRealAI,
    handleAnalyzeDocuments
  } = useAiAnalysis(project);
  
  const {
    reviewedInsights,
    handleAcceptInsight,
    handleRejectInsight
  } = useInsightsReview(insights);
  
  // Effect to switch to insights tab when processing completes
  useEffect(() => {
    if (processingComplete && insights.length > 0) {
      setActiveTab("insights");
    }
  }, [processingComplete, insights.length]);
  
  // Check if we can use the real AI via Supabase
  useEffect(() => {
    const checkAiAvailability = async () => {
      try {
        const anthropicKeyExists = await checkSupabaseConnection();
        
        if (anthropicKeyExists) {
          setUseRealAI(true);
          console.log("Anthropic API key detected - will use real AI");
        } else {
          console.log("Anthropic API key not detected - will use mock AI");
        }
      } catch (err) {
        console.error('Error checking Supabase connection:', err);
      }
    };
    
    checkAiAvailability();
  }, [setUseRealAI]);
  
  if (!project) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold text-red-500">Project not found</h1>
          <p className="mt-2">The project you're looking for doesn't exist or has been deleted.</p>
        </div>
      </AppLayout>
    );
  }
  
  // Calculate stats
  const overallConfidence = calculateOverallConfidence(insights);
  const needsReviewCount = countInsightsNeedingReview(insights);
  
  // Handle analyze documents with setActiveTab callback
  const onAnalyzeDocuments = () => {
    handleAnalyzeDocuments(documents, setActiveTab);
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <ProjectWelcomeAlert 
          mockProjectWarning={!!mockProjectWarning} 
          newProjectTitle={newProjectTitle} 
          newProjectClient={newProjectClient} 
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
              onFilesSelected={handleFilesSelected}
              onRemoveDocument={handleRemoveDocument}
              onAnalyzeDocuments={onAnalyzeDocuments}
            />
          </TabsContent>
          
          <TabsContent value="insights">
            <InsightsTabContent 
              insights={insights}
              reviewedInsights={reviewedInsights}
              overallConfidence={overallConfidence}
              needsReviewCount={needsReviewCount}
              onAcceptInsight={handleAcceptInsight}
              onRejectInsight={handleRejectInsight}
              onNavigateToDocuments={() => setActiveTab("documents")}
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
    </AppLayout>
  );
};

export default ProjectDetail;
