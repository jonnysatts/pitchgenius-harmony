
import React, { useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { findProjectById } from "@/data/mockProjects";
import { useAuth } from "@/context/AuthContext";
import { checkSupabaseConnection } from "@/services/ai";
import { Project } from "@/lib/types";
import { calculateOverallConfidence } from "@/services/ai/insightAnalytics";
import { toast } from "sonner";

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
  const navigate = useNavigate();
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
  
  // Redirect to dashboard with error message if project not found
  useEffect(() => {
    if (projectId && !project) {
      console.error("Project not found, redirecting to dashboard");
      toast.error("Project not found", {
        description: "We couldn't find that project. You've been redirected to the dashboard."
      });
      navigate('/dashboard');
    }
  }, [project, projectId, navigate]);

  // If no project is found, return null to prevent rendering with undefined project
  if (!project) {
    return null;
  }
  
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
  } = useProjectDetail(projectId, user?.id || '', project);
  
  // Set up the AI configuration
  const { setUseRealAI } = useAiAnalysis(project);
  
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
