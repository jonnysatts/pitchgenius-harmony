
import React from "react";
import { useLocation } from "react-router-dom";
import { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import ApiConnectionTest from "./ApiConnectionTest";

interface ProjectHeaderProps {
  project: Project;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const location = useLocation();
  
  const newProjectTitle = location.state?.newProjectTitle;
  const newProjectClient = location.state?.newProjectClient;
  
  return (
    <div className="flex justify-between items-center mb-4">
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
      
      <ApiConnectionTest />
    </div>
  );
};

export default ProjectHeader;
