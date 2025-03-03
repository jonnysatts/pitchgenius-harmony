
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { MOCK_PROJECTS } from "@/data/mockProjects";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/lib/types";

const NewProject = () => {
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get project details from URL search params
    const projectTitle = searchParams.get('title') || 'New Project';
    const clientName = searchParams.get('client') || 'Client';
    const clientIndustry = (searchParams.get('industry') || 'retail') as Project['clientIndustry'];
    
    // Create a new project with a unique ID
    const createNewProject = () => {
      // Simulate API call delay
      setTimeout(() => {
        // In a real app, this would call an API to create a project
        // For now, we'll create a mock project with a new ID
        const newProject: Project = {
          id: `new_${Date.now()}`,
          title: projectTitle,
          clientName: clientName,
          clientIndustry: clientIndustry,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "1", // Current user ID
          collaborators: [],
          status: "draft"
        };
        
        // In a real app, we would save this to a database
        // For now, we'll just navigate to the first mock project, but with the new title
        // This simulates that we've created a new project
        
        toast({
          title: "Project created",
          description: `${projectTitle} has been created successfully`,
        });
        
        // Navigate to the first mock project
        const firstProject = MOCK_PROJECTS[0];
        if (firstProject) {
          // Navigate to the first project but with a message that we are using a mock for demo purposes
          navigate(`/projects/${firstProject.id}`, { 
            state: { 
              newProjectTitle: projectTitle,
              newProjectClient: clientName,
              mockProjectWarning: true 
            } 
          });
        } else {
          toast({
            title: "Error",
            description: "Unable to create a new project. No demo projects available.",
            variant: "destructive"
          });
          navigate("/dashboard");
        }
        
        setLoading(false);
      }, 1500);
    };
    
    createNewProject();
  }, [searchParams, toast, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-brand-orange border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Creating your project...</h2>
          <p className="text-gray-500 mt-2">This will only take a moment</p>
        </div>
      </div>
    );
  }
  
  // This point shouldn't be reached as we navigate away in the useEffect
  return null;
};

export default NewProject;
