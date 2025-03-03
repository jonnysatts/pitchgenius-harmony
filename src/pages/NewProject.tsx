
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { MOCK_PROJECTS } from "@/data/mockProjects";
import { useToast } from "@/hooks/use-toast";

const NewProject = () => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
  
  // Find the first project to redirect to
  const firstProject = MOCK_PROJECTS[0];
  
  if (!firstProject) {
    toast({
      title: "Error",
      description: "Unable to create a new project. No demo projects available.",
      variant: "destructive"
    });
    
    // Redirect to dashboard if no projects exist
    return <Navigate to="/dashboard" />;
  }
  
  // Redirect to the first project
  return <Navigate to={`/projects/${firstProject.id}`} />;
};

export default NewProject;
