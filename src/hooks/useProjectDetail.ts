
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "@/lib/types";
import { calculateOverallConfidence, countInsightsNeedingReview } from "@/services/ai";
import { useToast } from "@/hooks/use-toast";

export const useProjectDetail = (
  project: Project | null,
  projectId: string | undefined,
  insights: any[],
  processingComplete: boolean
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("documents");
  
  // If project not found, redirect to dashboard
  useEffect(() => {
    if (!project && projectId) {
      toast({
        title: "Project not found",
        description: "The project you're looking for doesn't exist or has been deleted.",
        variant: "destructive"
      });
      navigate("/dashboard");
    }
  }, [project, projectId, navigate, toast]);
  
  // If analysis is complete, navigate to insights tab
  useEffect(() => {
    if (processingComplete && insights.length > 0) {
      setActiveTab("insights");
    }
  }, [processingComplete, insights.length]);
  
  // Calculate stats from insights
  const overallConfidence = calculateOverallConfidence(insights);
  const needsReviewCount = countInsightsNeedingReview(insights);
  
  // Navigation helpers
  const navigateToPresentation = () => {
    setActiveTab("presentation");
    toast({
      title: "Proceeding to presentation",
      description: "Now you can create a presentation based on your accepted insights"
    });
  };
  
  const isNewProject = project?.id.startsWith('new_');
  
  return {
    activeTab,
    setActiveTab,
    overallConfidence,
    needsReviewCount,
    navigateToPresentation,
    isNewProject
  };
};
