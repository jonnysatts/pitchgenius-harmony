
import React from "react";
import { useLocation } from "react-router-dom";
import { Project, AIProcessingStatus, StrategicInsight } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, ArrowLeftRight, RefreshCw, FileText, PresentationIcon } from "lucide-react";

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
  
  return (
    <div className="space-y-4">
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
