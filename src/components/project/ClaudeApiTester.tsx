
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const ClaudeApiTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testClaudeApi = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Calling claude-direct-test function...");
      
      const { data, error } = await supabase.functions.invoke("claude-direct-test", {
        method: "POST"
      });

      if (error) {
        console.error("Edge function error:", error);
        setError(`Edge function error: ${error.message}`);
        return;
      }

      console.log("Claude test result:", data);
      setResult(data);
      
      if (!data.success) {
        setError(data.error || "Unknown error occurred");
      }
    } catch (err) {
      console.error("Error testing Claude API:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Claude API Direct Test</CardTitle>
        <CardDescription>
          Test direct connection to Claude API without any complex processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Testing API connection...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>API Test Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className="font-medium">
                Status: {result.success ? "Success" : "Failed"}
              </span>
            </div>

            {result.apiKeyPrefix && (
              <div className="text-sm">
                <span className="font-medium">API Key (prefix):</span> {result.apiKeyPrefix}
              </div>
            )}

            {result.rawContent && (
              <div className="mt-2">
                <div className="font-medium mb-1">Claude Response:</div>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {result.rawContent}
                </pre>
              </div>
            )}

            {result.status && (
              <div className="text-sm">
                <span className="font-medium">HTTP Status:</span> {result.status}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={testClaudeApi} 
          disabled={isLoading}
          variant="default"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : "Test Claude API"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClaudeApiTester;
