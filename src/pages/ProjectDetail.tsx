
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { MOCK_PROJECTS } from "@/data/mockProjects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Document, Project, StrategicInsight, AIProcessingStatus } from "@/lib/types";
import { processFiles } from "@/services/documentService";
import { 
  generateInsights, 
  monitorAIProcessingProgress, 
  calculateOverallConfidence,
  countInsightsNeedingReview
} from "@/services/aiService";
import { FileText, Lightbulb, Presentation, CircleHelp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Import the new components
import ProjectHeader from "@/components/project/ProjectHeader";
import DocumentsTabContent from "@/components/project/DocumentsTabContent";
import InsightsTabContent from "@/components/project/InsightsTabContent";
import PresentationTabContent from "@/components/project/PresentationTabContent";
import HelpTabContent from "@/components/project/HelpTabContent";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const project = MOCK_PROJECTS.find(p => p.id === projectId);
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [insights, setInsights] = useState<StrategicInsight[]>([]);
  const [activeTab, setActiveTab] = useState("documents");
  const [aiStatus, setAiStatus] = useState<AIProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: 'Ready to analyze documents'
  });
  
  const [reviewedInsights, setReviewedInsights] = useState<Record<string, 'accepted' | 'rejected' | 'pending'>>({});
  
  // Initialize review status for insights
  useEffect(() => {
    if (insights.length > 0) {
      const initialReviewStatus: Record<string, 'accepted' | 'rejected' | 'pending'> = {};
      insights.forEach(insight => {
        initialReviewStatus[insight.id] = 'pending';
      });
      setReviewedInsights(initialReviewStatus);
    }
  }, [insights]);
  
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
  
  const handleFilesSelected = (files: File[]) => {
    if (!user) return;
    
    const newDocuments = processFiles(files, project.id, user.id);
    setDocuments(prev => [...prev, ...newDocuments]);
    
    toast({
      title: "Documents uploaded",
      description: `Successfully uploaded ${files.length} document${files.length !== 1 ? 's' : ''}`,
    });
  };
  
  const handleRemoveDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    
    toast({
      title: "Document removed",
      description: "Document has been removed from the project",
    });
  };
  
  const handleAnalyzeDocuments = async () => {
    if (documents.length === 0) {
      toast({
        title: "No documents to analyze",
        description: "Please upload documents before running the analysis",
        variant: "destructive"
      });
      return;
    }
    
    // Update status to processing
    setAiStatus({
      status: 'processing',
      progress: 0,
      message: 'Starting document analysis...'
    });
    
    // Set up progress monitoring
    const cancelMonitoring = monitorAIProcessingProgress(
      project.id,
      (status) => setAiStatus(status)
    );
    
    try {
      // Call the AI service to generate insights
      const result = await generateInsights(project, documents);
      
      if (result.error) {
        toast({
          title: "Analysis failed",
          description: result.error,
          variant: "destructive"
        });
        setAiStatus({
          status: 'error',
          progress: 0,
          message: result.error
        });
      } else {
        setInsights(result.insights);
        
        // Wait for the progress animation to complete
        setTimeout(() => {
          setActiveTab("insights");
          toast({
            title: "Analysis complete",
            description: `Generated ${result.insights.length} strategic insights`,
          });
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error analyzing documents:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      setAiStatus({
        status: 'error',
        progress: 0,
        message: error.message || "Analysis failed"
      });
    } finally {
      cancelMonitoring();
    }
  };
  
  const handleAcceptInsight = (insightId: string) => {
    setReviewedInsights(prev => ({
      ...prev,
      [insightId]: 'accepted'
    }));
    
    toast({
      title: "Insight accepted",
      description: "This insight will be included in the final report",
    });
  };
  
  const handleRejectInsight = (insightId: string) => {
    setReviewedInsights(prev => ({
      ...prev,
      [insightId]: 'rejected'
    }));
    
    toast({
      title: "Insight rejected",
      description: "This insight will be excluded from the final report",
    });
  };
  
  // Calculate stats
  const overallConfidence = calculateOverallConfidence(insights);
  const needsReviewCount = countInsightsNeedingReview(insights);
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <ProjectHeader project={project} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText size={16} />
              Documents
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
              onAnalyzeDocuments={handleAnalyzeDocuments}
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
