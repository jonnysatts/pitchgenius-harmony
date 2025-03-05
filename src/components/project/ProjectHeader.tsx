
import React from "react";
import { useLocation } from "react-router-dom";
import { Project, AIProcessingStatus, StrategicInsight } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, PresentationIcon } from "lucide-react";

// Industry-specific fallback images
const industryImages: Record<string, string> = {
  retail: "/lovable-uploads/6d7ce806-44e1-437e-8a15-81ec129c8d0b.png", // User's uploaded image
  finance: "https://images.unsplash.com/photo-1638913662295-9630035ef770?q=80&w=2070",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475",
  entertainment: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071",
  other: "https://images.unsplash.com/photo-1561357747-a5b8151f2b9f?q=80&w=1986"
};

interface ProjectHeaderProps {
  project: Project;
  activeTab?: string;
  aiStatus?: AIProcessingStatus;
  insights?: StrategicInsight[];
  isNewProject?: boolean;
  setActiveTab?: (tab: string) => void;
  navigateToPresentation?: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ 
  project,
  activeTab,
  aiStatus,
  insights,
  isNewProject,
  setActiveTab,
  navigateToPresentation
}) => {
  const location = useLocation();
  
  const newProjectTitle = location.state?.newProjectTitle;
  const newProjectClient = location.state?.newProjectClient;
  
  const handleGotoPresentationClick = () => {
    if (navigateToPresentation) {
      navigateToPresentation();
    }
  };

  // Determine the image to use - project cover image or fallback based on industry  
  const coverImage = project.coverImage || industryImages[project.clientIndustry] || industryImages.other;
  
  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden mb-6 h-48 w-full bg-gradient-to-r from-slate-200 to-slate-300">
        {coverImage && (
          <img 
            src={coverImage}
            alt={project.title} 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            {newProjectTitle || project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-600">
              {newProjectClient || project.clientName}
            </span>
            <span className="text-slate-400">•</span>
            <Badge variant="outline" className="bg-slate-50 hover:bg-slate-100">
              {project.clientIndustry.charAt(0).toUpperCase() + project.clientIndustry.slice(1)}
            </Badge>
            
            {project.clientWebsite && (
              <a 
                href={project.clientWebsite.startsWith('http') ? project.clientWebsite : `https://${project.clientWebsite}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Globe size={14} className="mr-1.5" />
                <span className="underline underline-offset-2">{project.clientWebsite}</span>
              </a>
            )}
          </div>
        </div>
        
        {navigateToPresentation && (
          <Button 
            onClick={handleGotoPresentationClick}
            variant="outline" 
            className="flex items-center gap-2 ml-auto"
          >
            <PresentationIcon className="h-4 w-4" />
            <span>View Presentation</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProjectHeader;
