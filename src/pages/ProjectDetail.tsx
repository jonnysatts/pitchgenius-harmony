
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { MOCK_PROJECTS } from "@/data/mockProjects";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { FileUpload } from "@/components/file-upload";
import { Document, Project, StrategicInsight, AIProcessingStatus } from "@/lib/types";
import { processFiles } from "@/services/documentService";
import { 
  generateInsights, 
  monitorAIProcessingProgress, 
  calculateOverallConfidence,
  countInsightsNeedingReview
} from "@/services/aiService";
import DocumentList from "@/components/project/DocumentList";
import { CircleHelp, FileText, Lightbulb, Presentation, Brain, Check, X, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import StrategicInsightCard from "@/components/project/StrategicInsightCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  
  // Group insights by category
  const insightsByCategory = insights.reduce((groups, insight) => {
    const category = insight.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(insight);
    return groups;
  }, {} as Record<string, StrategicInsight[]>);
  
  // Calculate stats
  const overallConfidence = calculateOverallConfidence(insights);
  const needsReviewCount = countInsightsNeedingReview(insights);
  const acceptedCount = Object.values(reviewedInsights).filter(status => status === 'accepted').length;
  const rejectedCount = Object.values(reviewedInsights).filter(status => status === 'rejected').length;
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-slate-900">{project.title}</h1>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize bg-slate-100 text-slate-800">
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-500 mt-2">Client: {project.clientName} · Industry: {project.clientIndustry}</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button>Generate Slides</Button>
          </div>
        </div>
        
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
          
          <TabsContent value="documents" className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
              <p className="text-slate-500 mb-4">
                Upload your client documents. We support PDFs, Office documents, images, and text files.
              </p>
              
              <FileUpload 
                onFilesSelected={handleFilesSelected}
                acceptedFileTypes={['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.rtf', '.md', '.jpg', '.png']}
                maxFileSizeMB={25}
                maxFiles={20}
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Project Documents</h2>
                <Button 
                  onClick={handleAnalyzeDocuments} 
                  disabled={documents.length === 0 || aiStatus.status === 'processing'}
                  className="flex items-center gap-2"
                >
                  <Brain size={16} />
                  {aiStatus.status === 'processing' ? 'Analyzing...' : 'Analyze with AI'}
                </Button>
              </div>
              
              {aiStatus.status === 'processing' && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{aiStatus.message}</span>
                    <span>{aiStatus.progress}%</span>
                  </div>
                  <Progress 
                    value={aiStatus.progress} 
                    thickness="thick" 
                    indicatorColor="bg-blue-500" 
                    showAnimation={true} 
                    className="mb-2" 
                  />
                  <p className="text-xs text-slate-500 italic">
                    Our AI is analyzing your documents to extract strategic gaming opportunities...
                  </p>
                </div>
              )}
              
              <DocumentList 
                documents={documents}
                onRemoveDocument={handleRemoveDocument}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="insights">
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-6">Strategic Insights</h2>
              
              {insights.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Overall Confidence</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold">{overallConfidence}%</span>
                        <Progress 
                          value={overallConfidence} 
                          className="w-2/3" 
                          indicatorColor={overallConfidence >= 80 ? "bg-green-500" : overallConfidence >= 60 ? "bg-amber-500" : "bg-red-500"}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Review Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-bold text-green-500">{acceptedCount}</span>
                          <span className="text-xs text-slate-500">Accepted</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-bold text-red-500">{rejectedCount}</span>
                          <span className="text-xs text-slate-500">Rejected</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-bold text-slate-500">
                            {insights.length - acceptedCount - rejectedCount}
                          </span>
                          <span className="text-xs text-slate-500">Pending</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3">
                        <AlertTriangle 
                          size={24} 
                          className={needsReviewCount > 0 ? "text-amber-500" : "text-green-500"} 
                        />
                        <div>
                          <span className="text-2xl font-bold">{needsReviewCount}</span>
                          <span className="text-sm text-slate-500 ml-1">insight{needsReviewCount !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {insights.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <Lightbulb className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">No insights yet</h3>
                  <p className="mt-1 text-slate-500 max-w-md mx-auto">
                    Upload documents and run the AI analysis to generate strategic insights for gaming opportunities
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab("documents")}
                  >
                    Go to Documents
                  </Button>
                </div>
              ) : (
                <div className="space-y-10">
                  {Object.entries(insightsByCategory).map(([category, categoryInsights]) => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-lg font-semibold capitalize border-b pb-2">
                        {category.replace(/_/g, ' ')}
                      </h3>
                      <div className="space-y-6">
                        {categoryInsights.map(insight => (
                          <div key={insight.id} className="relative">
                            <div className={
                              reviewedInsights[insight.id] === 'rejected' 
                                ? 'opacity-50'
                                : ''
                            }>
                              <StrategicInsightCard insight={insight} />
                            </div>
                            
                            <div className="absolute top-4 right-4 flex space-x-2">
                              <Button
                                size="sm"
                                variant={reviewedInsights[insight.id] === 'accepted' ? "default" : "outline"}
                                className={
                                  reviewedInsights[insight.id] === 'accepted' 
                                    ? "bg-green-500 hover:bg-green-600" 
                                    : "border-green-500 text-green-500 hover:bg-green-50"
                                }
                                onClick={() => handleAcceptInsight(insight.id)}
                              >
                                <Check size={16} />
                                <span className="ml-1">Accept</span>
                              </Button>
                              
                              <Button
                                size="sm"
                                variant={reviewedInsights[insight.id] === 'rejected' ? "default" : "outline"}
                                className={
                                  reviewedInsights[insight.id] === 'rejected' 
                                    ? "bg-red-500 hover:bg-red-600" 
                                    : "border-red-500 text-red-500 hover:bg-red-50"
                                }
                                onClick={() => handleRejectInsight(insight.id)}
                              >
                                <X size={16} />
                                <span className="ml-1">Reject</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="presentation">
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Presentation Slides</h2>
              <p className="text-slate-500">
                Your presentation slides will appear here after generating insights.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="help">
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Help & Instructions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">Getting Started</h3>
                  <p className="text-slate-500">
                    Upload your client documents to begin analyzing their gaming opportunities.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900">Document Processing</h3>
                  <p className="text-slate-500">
                    Our AI will analyze your documents to extract strategic insights for gaming narratives.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900">Slide Generation</h3>
                  <p className="text-slate-500">
                    Based on the strategic insights, the system will generate presentation slides following the 6-step narrative framework.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProjectDetail;
