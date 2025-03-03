
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { MOCK_PROJECTS } from "@/data/mockProjects";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { FileUpload } from "@/components/file-upload";
import { Document, Project, StrategicInsight, AIProcessingStatus } from "@/lib/types";
import { processFiles } from "@/services/documentService";
import { generateInsights, monitorAIProcessingProgress } from "@/services/aiService";
import DocumentList from "@/components/project/DocumentList";
import { CircleHelp, FileText, Lightbulb, Presentation, Brain } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import StrategicInsightCard from "@/components/project/StrategicInsightCard";

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
      const result = await generateInsights(project.id, documents);
      
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
  
  // Group insights by category
  const insightsByCategory = insights.reduce((groups, insight) => {
    const category = insight.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(insight);
    return groups;
  }, {} as Record<string, StrategicInsight[]>);
  
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
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{aiStatus.message}</span>
                    <span>{aiStatus.progress}%</span>
                  </div>
                  <Progress value={aiStatus.progress} className="h-2" />
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
              <h2 className="text-xl font-semibold mb-4">Strategic Insights</h2>
              
              {insights.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">No insights yet</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Upload documents and run the AI analysis to generate strategic insights
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(insightsByCategory).map(([category, categoryInsights]) => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-lg font-medium capitalize">
                        {category.replace(/_/g, ' ')}
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {categoryInsights.map(insight => (
                          <StrategicInsightCard 
                            key={insight.id} 
                            insight={insight} 
                          />
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
