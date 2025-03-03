
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface ProjectWelcomeAlertProps {
  mockProjectWarning: boolean;
  newProjectTitle?: string;
  newProjectClient?: string;
}

const ProjectWelcomeAlert: React.FC<ProjectWelcomeAlertProps> = ({ 
  mockProjectWarning, 
  newProjectTitle, 
  newProjectClient 
}) => {
  if (!mockProjectWarning) return null;
  
  return (
    <Alert className="mb-4 bg-amber-50 border-amber-200">
      <InfoIcon className="h-4 w-4 text-amber-500" />
      <AlertDescription className="text-amber-700">
        For demonstration purposes, we're showing you a mock project. In a production environment, 
        your new project "{newProjectTitle}" would be created and displayed here.
      </AlertDescription>
    </Alert>
  );
};

export default ProjectWelcomeAlert;
