
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { findProjectById } from "@/data/mockProjects";
import { useAuth } from "@/context/AuthContext";
import { checkSupabaseConnection } from "@/services/ai";
import { Project } from "@/lib/types";

// Import hooks
import { useAiAnalysis } from "@/hooks/useAiAnalysis";
import { useDocuments } from "@/hooks/useDocuments";
import { useInsightsReview } from "@/hooks/useInsightsReview";
import { useProjectDetail } from "@/hooks/useProjectDetail";

// Import the components
import ProjectDetailContent from "@/components/project/ProjectDetailContent";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  
  const project = findProjectById(projectId || '');
  
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
    usingFallbackInsights,
    setUseRealAI,
    handleAnalyzeDocuments,
    retryAnalysis
  } = useAiAnalysis(project || {} as Project);
  
  const {
    reviewedInsights,
    handleAcceptInsight,
    handleRejectInsight
  } = useInsightsReview(insights);
  
  const {
    activeTab,
    setActiveTab,
    overallConfidence,
    needsReviewCount,
    navigateToPresentation,
    isNewProject
  } = useProjectDetail(project, projectId, insights, processingComplete);
  
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
  
  const onAnalyzeDocuments = () => {
    handleAnalyzeDocuments(documents, setActiveTab);
  };

  const onRetryAnalysis = () => {
    const retry = retryAnalysis(setActiveTab);
    retry(documents);
  };
  
  return (
    <AppLayout>
      <ProjectDetailContent
        project={project}
        documents={documents}
        insights={insights}
        reviewedInsights={reviewedInsights}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        error={error}
        aiStatus={aiStatus}
        overallConfidence={overallConfidence}
        needsReviewCount={needsReviewCount}
        usingFallbackInsights={usingFallbackInsights}
        isNewProject={isNewProject}
        handleFilesSelected={handleFilesSelected}
        handleRemoveDocument={handleRemoveDocument}
        handleAnalyzeDocuments={onAnalyzeDocuments}
        handleAcceptInsight={handleAcceptInsight}
        handleRejectInsight={handleRejectInsight}
        navigateToPresentation={navigateToPresentation}
        onRetryAnalysis={onRetryAnalysis}
      />
    </AppLayout>
  );
};

export default ProjectDetail;
