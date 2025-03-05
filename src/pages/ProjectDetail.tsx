
import React, { useEffect, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { findProjectById } from "@/data/mockProjects";
import { useAuth } from "@/context/AuthContext";
import { checkSupabaseConnection } from "@/services/ai";
import { Project } from "@/lib/types";
import { calculateOverallConfidence } from "@/services/ai/insightAnalytics";

// Import hooks
import { useAiAnalysis } from "@/hooks/useAiAnalysis";
import { useDocuments } from "@/hooks/documents/useDocuments";
import { useInsightsReview } from "@/hooks/useInsightsReview";
import { useProjectDetail } from "@/hooks/useProjectDetail";

// Import the components
import ProjectDetailContent from "@/components/project/ProjectDetailContent";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  
  // Try to get projectId from different sources
  const projectId = useMemo(() => {
    // First check URL param
    if (id) return id;
    
    // Check if ID might be in a different part of the URL
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    if (lastPart && lastPart !== 'project' && lastPart !== 'projects') {
      return lastPart;
    }
    
    console.error("Could not determine project ID from URL:", location.pathname);
    return '';
  }, [id, location.pathname]);
  
  // Log the project ID for debugging
  useEffect(() => {
    console.log("ProjectDetail attempting to load project with ID:", projectId);
  }, [projectId]);
  
  const project = useMemo(() => {
    if (!projectId) {
      console.error("No project ID available to load project");
      return undefined;
    }
    return findProjectById(projectId);
  }, [projectId]);
  
  // Use the useProjectDetail hook
  const {
    activeTab,
    setActiveTab,
    documents,
    documentsLoading: isLoading,
    insights,
    reviewedInsights,
    aiStatus,
    aiError,
    usingFallbackInsights,
    needsReviewCount,
    pendingCount,
    acceptedCount,
    rejectedCount,
    overallConfidence,
    acceptedInsights,
    handleFilesSelected,
    handleRemoveDocument,
    handleAnalyzeProjectDocuments,
    handleAcceptInsight,
    handleRejectInsight,
    handleUpdateInsight,
    handleNavigateToPresentation,
    handleRetryAnalysis,
    handleRefreshInsights,
    isNewProject,
    isAnalyzingWebsite,
    handleAnalyzeWebsite
  } = useProjectDetail(projectId, user?.id || '', project || {} as Project);
  
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
  
  // Ensure we always have a valid confidence value
  const calculatedConfidence = useMemo(() => 
    calculateOverallConfidence(insights), [insights]);
    
  const confidenceToUse = useMemo(() => 
    overallConfidence || calculatedConfidence || 0, 
    [overallConfidence, calculatedConfidence]);
  
  if (!project) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold text-red-500">Project not found</h1>
          <p className="mt-2">The project you're looking for doesn't exist or has been deleted.</p>
          <p className="mt-2 text-sm text-gray-500">Project ID: {projectId}</p>
          <p className="mt-2 text-sm text-gray-500">
            If you just created this project, try returning to the dashboard and clicking on it again.
          </p>
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
        error={aiError ? aiError.toString() : null}
        aiStatus={aiStatus}
        overallConfidence={confidenceToUse}
        needsReviewCount={needsReviewCount}
        pendingCount={pendingCount}
        acceptedCount={acceptedCount}
        rejectedCount={rejectedCount}
        usingFallbackInsights={usingFallbackInsights}
        isNewProject={isNewProject}
        isLoading={isLoading}
        acceptedInsights={acceptedInsights}
        isAnalyzingWebsite={isAnalyzingWebsite}
        handleFilesSelected={handleFilesSelected}
        handleRemoveDocument={handleRemoveDocument}
        handleAnalyzeDocuments={handleAnalyzeProjectDocuments}
        handleAnalyzeWebsite={handleAnalyzeWebsite}
        handleAcceptInsight={handleAcceptInsight}
        handleRejectInsight={handleRejectInsight}
        handleUpdateInsight={handleUpdateInsight}
        navigateToPresentation={handleNavigateToPresentation}
        onRetryAnalysis={handleRetryAnalysis}
        onRefreshInsights={handleRefreshInsights}
      />
    </AppLayout>
  );
};

export default React.memo(ProjectDetail);
