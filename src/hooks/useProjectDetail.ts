
import { useState, useCallback, useEffect } from "react";
import { Project, Document } from "@/lib/types";
import { useDocuments } from "@/hooks/documents/useDocuments";
import { useAiAnalysis } from "@/hooks/useAiAnalysis";
import useInsightsReview from "@/hooks/useInsightsReview";

export const useProjectDetail = (projectId: string, userId: string, project: Project) => {
  const [activeTab, setActiveTab] = useState<string>("documents");
  const [isNewProject] = useState<boolean>(project.createdAt ? 
    Date.now() - new Date(project.createdAt).getTime() < 5 * 60 * 1000 : false); // 5 minutes
  
  // Handle documents for the project
  const {
    documents,
    isLoading: documentsLoading,
    error: documentsError,
    failedUploads,
    handleFilesSelected,
    handleRemoveDocument
  } = useDocuments(projectId, userId);
  
  // Handle AI analysis of documents
  const {
    insights,
    aiStatus,
    error: aiError, // Make sure this is explicitly named to match usage in ProjectDetail.tsx
    processingComplete,
    usingFallbackInsights,
    handleAnalyzeDocuments,
    retryAnalysis,
    // Add website analysis functionality
    isAnalyzingWebsite,
    websiteInsights,
    analyzeWebsite
  } = useAiAnalysis(project);
  
  // Handle insights review
  const {
    reviewedInsights,
    needsReviewCount,
    overallConfidence,
    acceptedInsights,
    rejectedInsights,
    handleAcceptInsight,
    handleRejectInsight,
    handleUpdateInsight,
    updatedInsights
  } = useInsightsReview(insights);
  
  // Set up retry analysis handler
  const handleRetryAnalysis = useCallback(() => {
    const retryHandler = retryAnalysis(setActiveTab);
    retryHandler(documents);
  }, [retryAnalysis, documents, setActiveTab]);
  
  // Handle document analysis
  const handleAnalyzeProjectDocuments = useCallback(() => {
    if (documents.length === 0) return;
    handleAnalyzeDocuments(documents, setActiveTab);
  }, [documents, handleAnalyzeDocuments]);
  
  // Handle website analysis
  const handleAnalyzeWebsite = useCallback(() => {
    if (!project.clientWebsite) return;
    analyzeWebsite();
    // Navigate to the webinsights tab after initiating website analysis
    setActiveTab("webinsights");
  }, [project.clientWebsite, analyzeWebsite]);
  
  // Navigate to documents tab
  const handleNavigateToDocuments = useCallback(() => {
    setActiveTab("documents");
  }, []);
  
  // Navigate to presentation tab
  const handleNavigateToPresentation = useCallback(() => {
    setActiveTab("presentation");
  }, []);
  
  // Automatically navigate to insights tab when document processing completes
  useEffect(() => {
    if (processingComplete && activeTab === "documents") {
      setActiveTab("insights");
    }
  }, [processingComplete, activeTab]);
  
  // Handle website analysis completion - switch to webinsights tab
  useEffect(() => {
    if (websiteInsights && websiteInsights.length > 0 && isAnalyzingWebsite === false) {
      // Only navigate if we just finished analyzing (not on initial load)
      if (activeTab === "documents") {
        setActiveTab("webinsights");
      }
    }
  }, [websiteInsights, isAnalyzingWebsite, activeTab]);
  
  return {
    activeTab,
    setActiveTab,
    documents,
    documentsLoading,
    documentsError,
    failedUploads,
    insights,
    aiStatus,
    aiError, // Explicitly return aiError to match usage in ProjectDetail.tsx
    usingFallbackInsights,
    reviewedInsights,
    needsReviewCount,
    overallConfidence,
    acceptedInsights,
    rejectedInsights,
    updatedInsights,
    handleFilesSelected,
    handleRemoveDocument,
    handleAnalyzeProjectDocuments,
    handleAcceptInsight,
    handleRejectInsight,
    handleUpdateInsight,
    handleNavigateToDocuments,
    handleNavigateToPresentation,
    handleRetryAnalysis,
    isNewProject,
    // Add website analysis functionality
    isAnalyzingWebsite,
    websiteInsights,
    handleAnalyzeWebsite
  };
};

export default useProjectDetail;
