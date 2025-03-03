
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { findProjectById } from "@/data/mockProjects";
import { useAuth } from "@/context/AuthContext";
import { checkSupabaseConnection } from "@/services/ai";
import { Project } from "@/lib/types";

// Import hooks
import { useAiAnalysis } from "@/hooks/useAiAnalysis";
import { useDocuments } from "@/hooks/documents/useDocuments";
import { useInsightsReview } from "@/hooks/useInsightsReview";
import { useProjectDetail } from "@/hooks/useProjectDetail";

// Import the components
import ProjectDetailContent from "@/components/project/ProjectDetailContent";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  
  const project = findProjectById(projectId || '');
  
  // Use the useProjectDetail hook
  const {
    activeTab,
    setActiveTab,
    documents,
    documentsLoading: isLoading,
    insights,
    reviewedInsights,
    aiStatus,
    aiError, // Fix: Use aiError instead of error
    usingFallbackInsights,
    needsReviewCount,
    overallConfidence,
    handleFilesSelected,
    handleRemoveDocument,
    handleAnalyzeProjectDocuments,
    handleAcceptInsight,
    handleRejectInsight,
    handleNavigateToPresentation,
    handleRetryAnalysis,
    isNewProject
  } = useProjectDetail(projectId || '', user?.id || '', project || {} as Project);
  
  // Set up the AI configuration
  const { setUseRealAI } = useAiAnalysis(project || {} as Project);
  
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
  
  return (
    <AppLayout>
      <ProjectDetailContent
        project={project}
        documents={documents}
        insights={insights}
        reviewedInsights={reviewedInsights}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        error={aiError} // Fix: Pass aiError as error prop
        aiStatus={aiStatus}
        overallConfidence={overallConfidence}
        needsReviewCount={needsReviewCount}
        usingFallbackInsights={usingFallbackInsights}
        isNewProject={isNewProject}
        isLoading={isLoading}
        handleFilesSelected={handleFilesSelected}
        handleRemoveDocument={handleRemoveDocument}
        handleAnalyzeDocuments={handleAnalyzeProjectDocuments}
        handleAcceptInsight={handleAcceptInsight}
        handleRejectInsight={handleRejectInsight}
        navigateToPresentation={handleNavigateToPresentation}
        onRetryAnalysis={handleRetryAnalysis}
      />
    </AppLayout>
  );
};

export default ProjectDetail;
