
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, KeyRound, LoaderCircle, AlertTriangle } from "lucide-react";
import { testSupabaseConnection } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ApiConnectionTestProps {
  onApiConnectionResult?: (result: any) => void;
}

const ApiConnectionTest: React.FC<ApiConnectionTestProps> = ({ onApiConnectionResult }) => {
  const { toast } = useToast();
  const [testingApi, setTestingApi] = useState(false);
  const [apiConnectionResult, setApiConnectionResult] = useState<{
    success?: boolean;
    message?: string;
    keysDetails?: Record<string, any>;
  } | null>(null);

  const handleTestApiConnection = async () => {
    setTestingApi(true);
    setApiConnectionResult(null);
    
    try {
      toast({
        title: "Testing Supabase Connection",
        description: "Checking connection to Supabase and access to secrets...",
      });

      console.log("Starting API connection test...");
      const result = await testSupabaseConnection();
      console.log("Test connection result:", result);
      
      if (result.success) {
        setApiConnectionResult({
          success: true,
          message: result.message || "Successfully connected to Supabase",
          keysDetails: result.keysStatus
        });
        toast({
          title: "API Connection Successful",
          description: result.message || "Successfully connected to Supabase",
        });
      } else {
        setApiConnectionResult({
          success: false,
          message: `Failed to connect: ${result.error?.message || result.message || "Unknown error"}`,
          keysDetails: result.keysStatus
        });
        toast({
          title: "API Connection Failed",
          description: `Could not verify Supabase connection: ${result.error?.message || result.message || "Unknown error"}`,
          variant: "destructive"
        });
      }
      
      // Call the callback if provided
      if (onApiConnectionResult) {
        onApiConnectionResult(result);
      }
    } catch (error: any) {
      console.error("Error in handleTestApiConnection:", error);
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
    <>
      {apiConnectionResult && (
        <Alert className={`mb-4 ${apiConnectionResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {apiConnectionResult.success ? 
            <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
            <XCircle className="h-4 w-4 text-red-500" />
          }
          <div className="w-full">
            <AlertDescription className={apiConnectionResult.success ? 'text-green-700' : 'text-red-700'}>
              {apiConnectionResult.message}
            </AlertDescription>
            
            {apiConnectionResult.keysDetails && (
              <div className="mt-2 text-sm">
                <h4 className="font-semibold mb-1 flex items-center gap-1">
                  <KeyRound size={14} /> API Keys Status:
                </h4>
                <ul className="space-y-1">
                  {Object.entries(apiConnectionResult.keysDetails).map(([key, details]: [string, any]) => (
                    <li key={key} className="flex items-center gap-1">
                      {details.exists ? 
                        <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                        <XCircle className="h-3 w-3 text-red-500" />
                      }
                      <span className="font-mono text-xs">{key}:</span>
                      <span className={details.exists ? 'text-green-600' : 'text-red-600'}>
                        {details.exists ? 
                          <span className="font-mono text-xs">{details.preview}</span> : 
                          'Not found'
                        }
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {!apiConnectionResult.success && (
              <div className="mt-2 flex items-start gap-1 text-amber-700">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500" />
                <div className="text-xs">
                  <p>Make sure your Edge Function is deployed properly and check the Edge Function logs in Supabase dashboard.</p>
                  <p className="mt-1">If you recently deployed the function, it may take a few moments to become available.</p>
                </div>
              </div>
            )}
          </div>
        </Alert>
      )}

      <Button 
        onClick={handleTestApiConnection} 
        disabled={testingApi}
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
      >
        {testingApi ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : "Test Supabase Secrets"}
      </Button>
    </>
  );
};

export default ApiConnectionTest;
