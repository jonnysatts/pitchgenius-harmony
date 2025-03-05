
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Project } from "@/lib/types";
import { getAllProjects } from "@/data/mockProjects";
import ProjectFilters from "@/components/dashboard/ProjectFilters";
import ProjectList from "@/components/dashboard/ProjectList";
import CreateProjectDialog from "@/components/dashboard/CreateProjectDialog";
import { useToast } from "@/hooks/use-toast";

// Define ProjectFormData type to match the interface in CreateProjectDialog
interface ProjectFormData {
  title: string;
  clientName: string;
  clientIndustry: "retail" | "finance" | "technology" | "entertainment" | "other";
  clientWebsite?: string; // Make this optional to match CreateProjectDialog
}

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState<ProjectFormData>({
    title: "",
    clientName: "",
    clientIndustry: "retail",
    clientWebsite: "" // Initialize with empty string
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Load projects when component mounts or when dashboard is visited
  const loadProjects = () => {
    const freshProjects = getAllProjects();
    console.log(`Dashboard loaded ${freshProjects.length} projects`);
    setProjects(freshProjects);
  };
  
  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);
  
  // Filter projects based on search term and status
  const filteredProjects = projects.filter(project => {
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
    
    // Check for any errors before closing
    if (isCreateDialogOpen) {
      console.log("CreateProjectDialog was closed");
    }
    
    // Close dialog
    setIsCreateDialogOpen(false);
    
    // Refresh the project list after creating a new project
    loadProjects();
  };

  // Handler function that properly updates the form data
  const updateProjectData = (data: ProjectFormData) => {
    setNewProject(data);
  };
  
  // Handler for clicking directly on a project card
  const handleProjectClick = (projectId: string) => {
    console.log(`Navigating to project ${projectId}`);
    navigate(`/project/${projectId}`);
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
            setProjectData={updateProjectData}
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
          onProjectClick={handleProjectClick}
        />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
