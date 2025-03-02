
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight, 
  ChevronRight, 
  FileText, 
  FolderOpen, 
  LayoutTemplate, 
  MessageSquare, 
  Upload, 
  Users 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock project data (would come from an API in a real app)
const MOCK_PROJECT = {
  id: "1",
  title: "MegaMart Gaming Strategy",
  clientName: "MegaMart Retail",
  clientIndustry: "retail",
  createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  createdBy: "1",
  collaborators: ["2"],
  status: "in_progress",
  description: "Create a compelling gaming strategy presentation for MegaMart to engage Gen Z customers through authentic gaming activations in retail stores."
};

const ProjectDetail = () => {
  const { projectId } = useParams<{projectId: string}>();
  const [activeTab, setActiveTab] = useState("materials");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // This would fetch project data in a real app
  const project = MOCK_PROJECT;
  
  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
  };
  
  const handleAnalyzeMaterials = () => {
    // In a real app, this would send files to a backend for processing
    console.log("Analyzing materials:", uploadedFiles);
  };
  
  const steps = [
    { id: "materials", title: "Client Materials", icon: FolderOpen, description: "Upload and analyze client documents" },
    { id: "narrative", title: "Strategic Narrative", icon: MessageSquare, description: "Build your strategic narrative framework" },
    { id: "slides", title: "Create Slides", icon: LayoutTemplate, description: "Design and customize your presentation" },
    { id: "export", title: "Export & Share", icon: Upload, description: "Export and share your finalized deck" }
  ];
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center text-sm text-slate-500 mb-2">
            <a href="/dashboard" className="hover:text-brand-orange transition-colors">Dashboard</a>
            <ChevronRight size={16} className="mx-1" />
            <a href="/projects" className="hover:text-brand-orange transition-colors">Projects</a>
            <ChevronRight size={16} className="mx-1" />
            <span className="text-slate-700">{project.title}</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">{project.title}</h1>
              <p className="text-slate-500 mb-2">Client: {project.clientName}</p>
              <p className="text-sm text-slate-600 max-w-2xl">{project.description}</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button variant="outline" className="mr-2">
                <Users size={16} className="mr-2" />
                Invite
              </Button>
              
              <Button 
                className="bg-brand-orange hover:opacity-90 transition-opacity"
                onClick={() => setActiveTab("narrative")}
              >
                Next Step
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-xl p-4 border border-slate-200">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button 
                  className={cn(
                    "flex items-center px-2 py-3 rounded-lg transition-colors",
                    activeTab === step.id 
                      ? "bg-orange-50 text-brand-orange" 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                  onClick={() => setActiveTab(step.id)}
                >
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                      activeTab === step.id 
                        ? "bg-brand-orange text-white" 
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    <step.icon size={16} />
                  </div>
                  <div className="text-left">
                    <p className={cn(
                      "font-medium",
                      activeTab === step.id ? "text-brand-orange" : "text-slate-700"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500 hidden md:block">
                      {step.description}
                    </p>
                  </div>
                </button>
                
                {index < steps.length - 1 && (
                  <div className="hidden sm:block text-slate-300">
                    <ChevronRight size={20} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="materials" className="mt-0">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <FileText size={40} className="mx-auto mb-4 text-slate-400" />
                  <h2 className="text-2xl font-bold mb-2">Upload Client Materials</h2>
                  <p className="text-slate-500 mb-6">
                    Upload client documents for analysis. We'll automatically extract key insights to help build your presentation.
                  </p>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Document Upload</CardTitle>
                    <CardDescription>
                      Drag and drop files or click to browse. We support PDF, Word, PowerPoint, Excel, and image files.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload onFilesSelected={handleFilesSelected} />
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      className="bg-brand-orange hover:opacity-90 transition-opacity"
                      disabled={uploadedFiles.length === 0}
                      onClick={handleAnalyzeMaterials}
                    >
                      Analyze Materials
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="narrative">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">Strategic Narrative Builder</h2>
                <p className="text-slate-500 mb-6">
                  This section will be implemented in the next phase
                </p>
                <Button variant="outline">
                  Continue to Slides
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="slides">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">Slide Creation</h2>
                <p className="text-slate-500 mb-6">
                  This section will be implemented in the next phase
                </p>
                <Button variant="outline">
                  Continue to Export
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="export">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">Export & Share</h2>
                <p className="text-slate-500 mb-6">
                  This section will be implemented in the next phase
                </p>
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProjectDetail;
