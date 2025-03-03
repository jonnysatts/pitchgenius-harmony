
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { testSupabaseConnection } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProjectHeaderProps {
  project: Project;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const location = useLocation();
  const { toast } = useToast();
  const [testingApi, setTestingApi] = useState(false);
  const [apiConnectionResult, setApiConnectionResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  
  const newProjectTitle = location.state?.newProjectTitle;
  const newProjectClient = location.state?.newProjectClient;
  const mockProjectWarning = location.state?.mockProjectWarning;
  
  const handleTestApiConnection = async () => {
    setTestingApi(true);
    setApiConnectionResult(null);
    
    try {
      const result = await testSupabaseConnection();
      
      if (result.success) {
        setApiConnectionResult({
          success: true,
          message: "Successfully connected to Supabase and accessed API keys"
        });
        toast({
          title: "API Connection Successful",
          description: "Successfully connected to Supabase and verified API access",
        });
      } else {
        setApiConnectionResult({
          success: false,
          message: `Failed to connect: ${result.error?.message || "Unknown error"}`
        });
        toast({
          title: "API Connection Failed",
          description: `Could not verify Supabase connection: ${result.error?.message || "Unknown error"}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      setApiConnectionResult({
        success: false,
        message: `Error: ${error.message || "Unknown error"}`
      });
      toast({
        title: "API Connection Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setTestingApi(false);
    }
  };
  
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
      
      {apiConnectionResult && (
        <Alert className={`mb-4 ${apiConnectionResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {apiConnectionResult.success ? 
            <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
            <XCircle className="h-4 w-4 text-red-500" />
          }
          <AlertDescription className={apiConnectionResult.success ? 'text-green-700' : 'text-red-700'}>
            {apiConnectionResult.message}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-slate-900">
          {newProjectTitle || project.title}
        </h1>
        <Button 
          onClick={handleTestApiConnection} 
          disabled={testingApi}
          variant="outline"
          size="sm"
        >
          {testingApi ? "Testing..." : "Test API Connection"}
        </Button>
      </div>
      
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
