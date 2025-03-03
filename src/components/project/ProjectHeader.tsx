
import React from "react";
import { useLocation } from "react-router-dom";
import { Project, AIProcessingStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import ApiConnectionTest from "./ApiConnectionTest";

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
