
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { MOCK_PROJECTS } from "@/data/mockProjects";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { FileUpload } from "@/components/FileUpload";
import { Document, Project } from "@/lib/types";
import { processFiles } from "@/services/documentService";
import DocumentList from "@/components/project/DocumentList";
import { CircleHelp, FileText, Lightbulb, Presentation } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const project = MOCK_PROJECTS.find(p => p.id === projectId);
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState("documents");
  
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
              <h2 className="text-xl font-semibold mb-4">Project Documents</h2>
              <DocumentList 
                documents={documents}
                onRemoveDocument={handleRemoveDocument}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="insights">
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Strategic Insights</h2>
              <p className="text-slate-500">
                Strategic insights will appear here after documents are processed.
              </p>
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
