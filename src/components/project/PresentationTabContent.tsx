
import React, { useState } from "react";
import { StrategicInsight, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  PresentationScreen, 
  Palette, 
  Brain, 
  LayoutTemplate, 
  Layers, 
  Download,
  Plus,
  FileSlides
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PresentationTabContentProps {
  project: Project;
  acceptedInsights: StrategicInsight[];
}

const PresentationTabContent: React.FC<PresentationTabContentProps> = ({
  project,
  acceptedInsights
}) => {
  const [activeTab, setActiveTab] = useState("slides");
  const [generatingSlides, setGeneratingSlides] = useState(false);
  
  // This will eventually be populated by slide generation logic
  const slideCount = 0;
  
  const handleGenerateSlides = () => {
    console.log("Generating slides with insights:", acceptedInsights);
    setGeneratingSlides(true);
    
    // Simulate slide generation (this will be replaced with actual slide generation)
    setTimeout(() => {
      setGeneratingSlides(false);
    }, 2000);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Presentation Builder</h2>
        
        <div className="flex gap-3">
          {slideCount > 0 && (
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Export Presentation
            </Button>
          )}
          
          <Button 
            onClick={handleGenerateSlides}
            disabled={generatingSlides || acceptedInsights.length === 0}
            className="flex items-center gap-2"
          >
            <Brain size={16} />
            {generatingSlides ? "Generating Slides..." : "Generate Slides"}
          </Button>
        </div>
      </div>
      
      {acceptedInsights.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <FileSlides size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No Accepted Insights Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            You need to review and accept strategic insights before generating a presentation.
            Go back to the Insights tab to review and accept insights.
          </p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="slides">Slides</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="slides" className="space-y-4">
            {slideCount === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <PresentationScreen size={36} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-medium text-slate-700 mb-2">No Slides Generated Yet</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-4">
                  Use the "Generate Slides" button to create a presentation based on your accepted insights.
                </p>
                <Button 
                  onClick={handleGenerateSlides}
                  disabled={generatingSlides}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Brain size={16} />
                  {generatingSlides ? "Generating..." : "Generate Slides"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {/* Slide thumbnails will go here */}
                <div className="aspect-[16/9] bg-slate-100 rounded flex items-center justify-center">
                  <Plus size={24} className="text-slate-400" />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="template">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Presentation Template</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded p-3 cursor-pointer bg-blue-50 border-blue-200">
                  <div className="aspect-[16/9] bg-white rounded mb-2 flex items-center justify-center">
                    <LayoutTemplate size={20} className="text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-center">Games Age Standard</p>
                </div>
                
                <div className="border rounded p-3 cursor-pointer">
                  <div className="aspect-[16/9] bg-slate-100 rounded mb-2 flex items-center justify-center">
                    <Palette size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-center">Client Branded</p>
                </div>
                
                <div className="border rounded p-3 cursor-pointer">
                  <div className="aspect-[16/9] bg-slate-100 rounded mb-2 flex items-center justify-center">
                    <Layers size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-center">Minimalist</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="structure">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Presentation Structure</h3>
              
              <div className="border rounded p-4 space-y-3">
                <p className="text-sm font-medium">Strategic Narrative Framework</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center p-2 bg-blue-50 rounded">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">1</span>
                    Gaming Revolution Context
                  </li>
                  <li className="flex items-center p-2 bg-blue-50 rounded">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">2</span>
                    Client's Current Landscape
                  </li>
                  <li className="flex items-center p-2 bg-blue-50 rounded">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">3</span>
                    Gaming Cultural Insight
                  </li>
                  <li className="flex items-center p-2 bg-blue-50 rounded">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">4</span>
                    Strategic Solution Path
                  </li>
                  <li className="flex items-center p-2 bg-blue-50 rounded">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">5</span>
                    Tangible Vision
                  </li>
                  <li className="flex items-center p-2 bg-blue-50 rounded">
                    <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">6</span>
                    Proof of Concept
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="export">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Export Options</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-4 cursor-pointer hover:border-blue-200 hover:bg-blue-50 transition-colors">
                  <h4 className="font-medium mb-2">Google Slides</h4>
                  <p className="text-sm text-slate-600 mb-3">Export your presentation to Google Slides for further editing and sharing.</p>
                  <Button variant="outline" className="w-full" disabled={slideCount === 0}>
                    Export to Google Slides
                  </Button>
                </div>
                
                <div className="border rounded p-4 cursor-pointer hover:border-blue-200 hover:bg-blue-50 transition-colors">
                  <h4 className="font-medium mb-2">PowerPoint</h4>
                  <p className="text-sm text-slate-600 mb-3">Download your presentation as a PowerPoint file (.pptx).</p>
                  <Button variant="outline" className="w-full" disabled={slideCount === 0}>
                    Download as PowerPoint
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PresentationTabContent;
