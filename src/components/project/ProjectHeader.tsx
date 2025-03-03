
import React from "react";
import { useLocation } from "react-router-dom";
import { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface ProjectHeaderProps {
  project: Project;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const location = useLocation();
  const newProjectTitle = location.state?.newProjectTitle;
  const newProjectClient = location.state?.newProjectClient;
  const mockProjectWarning = location.state?.mockProjectWarning;
  
  return (
    <div className="mb-6">
      {mockProjectWarning && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <InfoIcon className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            For demonstration purposes, we're showing you a mock project. In a production environment, 
            your new project "{newProjectTitle}" would be created and displayed here.
          </AlertDescription>
        </Alert>
      )}
      
      <h1 className="text-3xl font-bold text-slate-900 mb-1">
        {newProjectTitle || project.title}
      </h1>
      <div className="flex items-center">
        <span className="text-slate-500 mr-3">
          {newProjectClient || project.clientName}
        </span>
        <Badge>
          {project.clientIndustry.charAt(0).toUpperCase() + project.clientIndustry.slice(1)}
        </Badge>
      </div>
    </div>
  );
};

export default ProjectHeader;
