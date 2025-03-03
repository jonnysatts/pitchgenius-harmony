
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ErrorAlertProps {
  error: string | null;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTitle>Error: Analysis Failed</AlertTitle>
      <AlertDescription>
        {error}
        {error.includes("Edge Function") && (
          <div className="mt-2">
            <p>This could be due to a connection issue with the Supabase Edge Function. 
               Please check that the function is deployed and has the correct permissions.</p>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
