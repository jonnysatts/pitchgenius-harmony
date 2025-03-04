import { useState, useCallback, useEffect, useRef } from "react";
import { Project, Document } from "@/lib/types";
import { useDocuments } from "@/hooks/documents/useDocuments";
import { useAiAnalysis } from "@/hooks/useAiAnalysis";
import useInsightsReview from "@/hooks/useInsightsReview";

export const useProjectDetail = (projectId: string, userId: string, project: Project) => {
  const [activeTab, setActiveTab] = useState<string>("documents");
  const previousTabRef = useRef<string>("documents");
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
    error: aiError,
    processingComplete,
    usingFallbackInsights,
    insufficientContent,
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
    // Ensure we provide the correct Document type from @/lib/types
    retryHandler(documents as Document[]);
  }, [retryAnalysis, documents, setActiveTab]);
  
  // Handle document analysis
  const handleAnalyzeProjectDocuments = useCallback(() => {
    if (documents.length === 0) return;
    // Ensure we provide the correct Document type from @/lib/types
    handleAnalyzeDocuments(documents as Document[], setActiveTab);
  }, [documents, handleAnalyzeDocuments]);
  
  // Handle website analysis
  const handleAnalyzeWebsite = useCallback(() => {
    if (!project.clientWebsite) return;
    analyzeWebsite();
    // We'll handle the tab navigation in the effect below instead of here
  }, [project.clientWebsite, analyzeWebsite]);
  
  // Stable tab navigation functions that won't change on re-render
  const handleNavigateToDocuments = useCallback(() => {
    setActiveTab("documents");
  }, []);
  
  // Navigate to presentation tab
  const handleNavigateToPresentation = useCallback(() => {
    setActiveTab("presentation");
  }, []);
  
  // Navigate to web insights tab
  const handleNavigateToWebInsights = useCallback(() => {
    setActiveTab("webinsights");
  }, []);
  
  // When activeTab changes, store the previous value
  useEffect(() => {
    previousTabRef.current = activeTab;
  }, [activeTab]);
  
  // Automatically navigate to insights tab when document processing completes
  useEffect(() => {
    if (processingComplete && previousTabRef.current === "documents") {
      setActiveTab("insights");
    }
  }, [processingComplete]);
  
  // Handle website analysis completion - switch to webinsights tab
  useEffect(() => {
    if (websiteInsights && websiteInsights.length > 0 && isAnalyzingWebsite === false) {
      // Only navigate if we were previously analyzing
      const wasAnalyzing = sessionStorage.getItem('was_analyzing_website') === 'true';
      if (wasAnalyzing) {
        setActiveTab("webinsights");
        sessionStorage.removeItem('was_analyzing_website');
      }
    }
  }, [websiteInsights, isAnalyzingWebsite]);
  
  // Track when website analysis begins
  useEffect(() => {
    if (isAnalyzingWebsite) {
      sessionStorage.setItem('was_analyzing_website', 'true');
    }
  }, [isAnalyzingWebsite]);
  
  return {
    activeTab,
    setActiveTab,
    documents,
    documentsLoading,
    documentsError,
    failedUploads,
    insights,
    aiStatus,
    aiError,
    usingFallbackInsights,
    insufficientContent,
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
    handleRetryAnalysis,
    isNewProject,
    // Add website analysis functionality
    isAnalyzingWebsite,
    websiteInsights,
    handleAnalyzeWebsite,
    // Stable tab navigation functions
    handleNavigateToDocuments,
    handleNavigateToPresentation,
    handleNavigateToWebInsights
  };
};

export default useProjectDetail;
