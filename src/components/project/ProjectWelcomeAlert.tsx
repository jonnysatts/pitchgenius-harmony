
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface ProjectWelcomeAlertProps {
  mockProjectWarning: boolean;
  newProjectTitle?: string;
  newProjectClient?: string;
  isNewProject?: boolean;
}

const ProjectWelcomeAlert: React.FC<ProjectWelcomeAlertProps> = ({ 
  mockProjectWarning, 
  newProjectTitle, 
  newProjectClient,
  isNewProject
}) => {
  // Only show the alert if mockProjectWarning is true or it's a newly created project
  if (!mockProjectWarning && !isNewProject) return null;
  
  return (
    <Alert className="mb-4 bg-amber-50 border-amber-200">
      <InfoIcon className="h-4 w-4 text-amber-500" />
      <AlertDescription className="text-amber-700">
        {mockProjectWarning ? (
          <>
            For demonstration purposes, we're showing you a mock project. In a production environment, 
            your new project "{newProjectTitle}" would be created and displayed here.
          </>
        ) : (
          <>
            Welcome to your new project "{newProjectTitle}" for {newProjectClient}! 
            You can start by uploading documents to analyze.
          </>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ProjectWelcomeAlert;
