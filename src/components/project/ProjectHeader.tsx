
import React from "react";
import { Button } from "@/components/ui/button";
import { Project } from "@/lib/types";

interface ProjectHeaderProps {
  project: Project;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  return (
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
  );
};

export default ProjectHeader;
