
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Project } from "@/lib/types";
import { MOCK_PROJECTS } from "@/data/mockProjects";
import ProjectFilters from "@/components/dashboard/ProjectFilters";
import ProjectList from "@/components/dashboard/ProjectList";
import CreateProjectDialog from "@/components/dashboard/CreateProjectDialog";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    clientName: "",
    clientIndustry: "retail" as "retail" | "finance" | "technology" | "entertainment" | "other",
    clientWebsite: ""
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Filter projects based on search term and status
  const filteredProjects = MOCK_PROJECTS.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleCreateProject = () => {
    // Reset the form data after the user clicks create
    setNewProject({
      title: "",
      clientName: "",
      clientIndustry: "retail",
      clientWebsite: ""
    });
    
    // Navigation is now handled in CreateProjectDialog component
    setIsCreateDialogOpen(false);
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-500">Manage your presentation projects</p>
          </div>
          
          <CreateProjectDialog
            isOpen={isCreateDialogOpen}
            setIsOpen={setIsCreateDialogOpen}
            projectData={newProject}
            setProjectData={setNewProject}
            onCreateProject={handleCreateProject}
          />
        </div>
        
        {/* Filters */}
        <ProjectFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        
        {/* Projects List */}
        <ProjectList
          projects={filteredProjects}
          onCreateNew={() => setIsCreateDialogOpen(true)}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
        />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
