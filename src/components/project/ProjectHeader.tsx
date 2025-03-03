
import React from "react";
import { useLocation } from "react-router-dom";
import { Project, AIProcessingStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import ApiConnectionTest from "./ApiConnectionTest";
import { Globe } from "lucide-react";

interface ProjectHeaderProps {
  project: Project;
  activeTab?: string;
  aiStatus?: AIProcessingStatus;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ 
  project,
  activeTab,
  aiStatus
}) => {
  const location = useLocation();
  
  const newProjectTitle = location.state?.newProjectTitle;
  const newProjectClient = location.state?.newProjectClient;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {newProjectTitle || project.title}
          </h1>
          <div className="flex items-center mt-1">
            <span className="text-slate-500 mr-3">
              {newProjectClient || project.clientName}
            </span>
            <Badge>
              {project.clientIndustry.charAt(0).toUpperCase() + project.clientIndustry.slice(1)}
            </Badge>
            
            {project.clientWebsite && (
              <a 
                href={project.clientWebsite.startsWith('http') ? project.clientWebsite : `https://${project.clientWebsite}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-4 flex items-center text-sm text-blue-500 hover:text-blue-700 transition-colors"
              >
                <Globe size={14} className="mr-1" />
                Visit website
              </a>
            )}
          </div>
        </div>
        
        <div className="mt-1">
          <ApiConnectionTest />
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
