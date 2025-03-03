
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { MOCK_PROJECTS, addNewProject } from "@/data/mockProjects";
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
    const clientWebsite = searchParams.get('website') || '';
    
    // Create a new project with a unique ID
    const createNewProject = () => {
      // Simulate API call delay
      setTimeout(() => {
        // Create a unique ID with timestamp and randomness
        const newProjectId = `new_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        // Create a new project
        const newProject: Project = {
          id: newProjectId,
          title: projectTitle,
          clientName: clientName,
          clientIndustry: clientIndustry,
          clientWebsite: clientWebsite,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "1", // Current user ID
          collaborators: [],
          status: "draft",
          coverImage: getIndustryCoverImage(clientIndustry)
        };
        
        // Add this project to our stored projects
        addNewProject(newProject);
        
        toast({
          title: "Project created",
          description: `${projectTitle} has been created successfully`,
        });
        
        // Force a reload of the mock projects before navigating
        console.log("Navigating to new project:", newProjectId);
        console.log("Project details:", newProject);
        
        // Navigate to the new project with state information
        navigate(`/projects/${newProjectId}`, {
          state: {
            newProjectTitle: projectTitle,
            newProjectClient: clientName
          }
        });
        setLoading(false);
      }, 1500);
    };
    
    createNewProject();
  }, [searchParams, toast, navigate]);
  
  // Helper function to get appropriate cover image based on industry
  const getIndustryCoverImage = (industry: Project['clientIndustry']): string => {
    switch (industry) {
      case 'technology':
        return "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d";
      case 'finance':
        return "https://images.unsplash.com/photo-1498050108023-c5249f4df085";
      case 'entertainment':
        return "https://images.unsplash.com/photo-1603739903239-8b6e64c3b185";
      case 'retail':
        return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158";
      default:
        return "https://images.unsplash.com/photo-1557804506-669a67965ba0";
    }
  };
  
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
