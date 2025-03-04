
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we're on a project page that might have the wrong URL format
    const isProjectPage = location.pathname.includes('/project/') || location.pathname.includes('/projects/');
    
    if (isProjectPage) {
      const projectId = location.pathname.split('/').pop();
      console.error(
        "404 Error: Project not found with ID:", 
        projectId,
        "Full path:", location.pathname
      );
      
      // Show toast with more helpful information
      toast.error("Project not found", {
        description: "The project you're looking for doesn't exist or may have been deleted.",
        duration: 5000
      });
    } else {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
      );
    }
  }, [location.pathname]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-red-500">404</h1>
        <p className="text-xl text-gray-600 mb-4">Page not found</p>
        <p className="text-gray-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          className="bg-brand-orange hover:opacity-90 transition-opacity"
          onClick={handleBackToDashboard}
        >
          <ArrowLeft size={18} className="mr-2" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
