
import React, { memo } from "react";
import { Project } from "@/lib/types";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ProjectListProps {
  projects: Project[];
  onCreateNew: () => void;
  searchTerm: string;
  statusFilter: string;
  onProjectClick?: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  onCreateNew,
  searchTerm,
  statusFilter,
  onProjectClick
}) => {
  // Deduplicate projects based on their IDs
  const uniqueProjects = projects.reduce((acc: Project[], current) => {
    const isDuplicate = acc.find((item) => item.id === current.id);
    if (!isDuplicate) {
      return acc.concat([current]);
    }
    return acc;
  }, []);
  
  return (
    <>
      {uniqueProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onClick={() => onProjectClick && onProjectClick(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-100 rounded-xl">
          <h3 className="text-lg font-medium text-slate-700 mb-2">No projects found</h3>
          <p className="text-slate-500 mb-6">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your filters or search term"
              : "Create your first project to get started"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button 
              onClick={onCreateNew}
              className="bg-brand-orange hover:opacity-90 transition-opacity"
            >
              <PlusCircle size={18} className="mr-2" />
              New Project
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default memo(ProjectList);
