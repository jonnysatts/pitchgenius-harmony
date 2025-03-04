
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Bug, Check, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DiagnosticsPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [directTestResults, setDirectTestResults] = useState<any>(null);
  
  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      // Basic connection test
      const { data: connectionData, error: connectionError } = await supabase.functions.invoke('test-connection', {
        method: 'POST',
        body: { test: true }
      });
      
      // Store results
      setResults({
        connection: {
          success: !connectionError,
          data: connectionData,
          error: connectionError
        }
      });
      
    } catch (error) {
      console.error("Diagnostics error:", error);
      setResults({
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const runDirectClaudeTest = async () => {
    setIsLoading(true);
    try {
      // Test direct Claude API call
      const { data: claudeData, error: claudeError } = await supabase.functions.invoke('claude-direct-test', {
        method: 'POST'
      });
      
      // Store results
      setDirectTestResults({
        success: !claudeError,
        data: claudeData,
        error: claudeError
      });
      
    } catch (error) {
      console.error("Claude direct test error:", error);
      setDirectTestResults({
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Bug className="mr-2 h-5 w-5 text-gray-500" />
          Claude API Diagnostics
        </h2>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={runDiagnostics}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Test Connection
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={runDirectClaudeTest}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Test Claude API
          </Button>
        </div>
      </div>
      
      {/* Display connection test results */}
      {results && (
        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Connection Test Results</h3>
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <div className="flex items-center mb-2">
              <span className="font-semibold mr-2">Status:</span>
              {results.connection?.success ? (
                <span className="text-green-600 flex items-center">
                  <Check className="h-4 w-4 mr-1" /> Connected
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" /> Failed
                </span>
              )}
            </div>
            
            {results.connection?.data && (
              <>
                <div className="mb-1">
                  <span className="font-semibold mr-2">API Key:</span>
                  {results.connection.data.anthropicKeyExists ? (
                    <span className="text-green-600">Found ({results.connection.data.anthropicKeyPrefix})</span>
                  ) : (
                    <span className="text-red-600">Missing</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold mr-2">API Key Format:</span>
                  {results.connection.data.anthropicKeyValidFormat ? (
                    <span className="text-green-600">Valid</span>
                  ) : (
                    <span className="text-red-600">Invalid</span>
                  )}
                </div>
              </>
            )}
            
            {results.connection?.error && (
              <div className="mt-2 text-red-600">
                <span className="font-semibold">Error:</span> {results.connection.error.message || String(results.connection.error)}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Display direct Claude API test results */}
      {directTestResults && (
        <div>
          <h3 className="text-md font-medium mb-2">Claude API Direct Test</h3>
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <div className="flex items-center mb-2">
              <span className="font-semibold mr-2">Status:</span>
              {directTestResults.success && directTestResults.data?.success ? (
                <span className="text-green-600 flex items-center">
                  <Check className="h-4 w-4 mr-1" /> Success
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" /> Failed
                </span>
              )}
            </div>
            
            {directTestResults.data?.success ? (
              <div>
                <span className="font-semibold">Response:</span>
                <pre className="mt-1 bg-gray-100 p-2 rounded overflow-auto text-xs">
                  {JSON.stringify(directTestResults.data.rawContent, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-red-600">
                <span className="font-semibold">Error:</span> {directTestResults.data?.error || directTestResults.error?.message || "Unknown error"}
              </div>
            )}
            
            {directTestResults.data?.apiKeyPrefix && (
              <div className="mt-2">
                <span className="font-semibold">API Key Used:</span> {directTestResults.data.apiKeyPrefix}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>If all tests pass but analysis still returns mock data, check the Edge Function logs in Supabase dashboard for detailed error messages.</p>
      </div>
    </div>
  );
};

export default DiagnosticsPanel;
