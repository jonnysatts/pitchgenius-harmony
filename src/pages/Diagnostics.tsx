
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/layout/AppLayout";

const Diagnostics = () => {
  const { toast } = useToast();
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [testStep, setTestStep] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults({});
    setTestStep(0);
    
    toast({
      title: "Diagnostics Started",
      description: "Running comprehensive tests on all API connections...",
    });

    try {
      // Test 1: Basic Supabase Connection
      setTestStep(1);
      const connectionResult = await testSupabaseConnection();
      setTestResults(prev => ({ ...prev, supabaseConnection: connectionResult }));
      
      // Test 2: Direct Claude API Test
      setTestStep(2);
      const claudeResult = await testClaudeDirectAPI();
      setTestResults(prev => ({ ...prev, claudeAPI: claudeResult }));
      
      // Test 3: Website Analysis Test with a test URL
      setTestStep(3);
      const websiteAnalysisResult = await testWebsiteAnalysis();
      setTestResults(prev => ({ ...prev, websiteAnalysis: websiteAnalysisResult }));

      // Test 4: Document Analysis Test
      setTestStep(4);
      const documentAnalysisResult = await testDocumentAnalysis();
      setTestResults(prev => ({ ...prev, documentAnalysis: documentAnalysisResult }));
      
      toast({
        title: "Diagnostics Complete",
        description: "All API connection tests have finished.",
      });
    } catch (error) {
      console.error("Error running tests:", error);
      toast({
        title: "Diagnostics Error",
        description: "There was an error running the diagnostics tests.",
        variant: "destructive"
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-connection', {
        method: 'POST',
        body: { test: true, timestamp: new Date().toISOString() }
      });
      
      return {
        success: !error,
        data,
        error: error ? error.message : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error testing Supabase connection:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  };

  const testClaudeDirectAPI = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('claude-direct-test', {
        method: 'POST',
        body: { timestamp: new Date().toISOString() }
      });
      
      return {
        success: !error && data?.success,
        data,
        error: error ? error.message : data?.error || null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error testing Claude API:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  };

  const testWebsiteAnalysis = async () => {
    try {
      const testUrl = "https://example.com";
      const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
        method: 'POST',
        body: { 
          website_url: testUrl,
          client_name: "Test Client",
          client_industry: "technology",
          test_mode: true
        }
      });
      
      return {
        success: !error && !!data,
        data,
        error: error ? error.message : null,
        testUrl,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error testing website analysis:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  };

  const testDocumentAnalysis = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights-with-anthropic', {
        method: 'POST',
        body: {
          projectId: "test-project",
          documentContents: [
            { 
              id: "test-doc-1", 
              content: "This is a test document for analysis. It contains some sample text to analyze." 
            }
          ],
          clientIndustry: "technology",
          debugMode: true,
          test_mode: true
        }
      });
      
      return {
        success: !error && !!data,
        data,
        error: error ? error.message : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error testing document analysis:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  };

  const renderStatusIcon = (isSuccess: boolean | undefined, isPending: boolean = false) => {
    if (isPending) return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    if (isSuccess === true) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (isSuccess === false) return <XCircle className="h-5 w-5 text-red-600" />;
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  const renderResultCard = (title: string, result: any, sectionKey: string) => {
    const isExpanded = expandedSections[sectionKey] || false;
    
    if (!result) {
      return (
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {title}
            </h3>
            <div className="text-sm text-gray-500">Not tested yet</div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(sectionKey)}>
          <h3 className="text-lg font-medium flex items-center gap-2">
            {renderStatusIcon(result.success)}
            {title}
          </h3>
          <div>
            <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.success ? 'Success' : 'Failed'}
            </span>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4">
            <Separator className="my-2" />
            
            {result.error && (
              <div className="mt-2 p-2 bg-red-50 text-red-800 rounded">
                <div className="font-semibold">Error:</div>
                <div className="text-sm whitespace-pre-wrap">{result.error}</div>
              </div>
            )}
            
            <div className="mt-2">
              <div className="font-semibold">Response Data:</div>
              <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto max-h-60">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Test ran at: {new Date(result.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">System Diagnostics</h1>
            <p className="text-gray-600">
              Test all API connections and analysis functions before using the application
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={runAllTests}
            disabled={isRunningTests}
          >
            {isRunningTests && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run All Tests
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card className="p-4 bg-blue-50">
            <h2 className="text-lg font-medium mb-2">Current Test Progress</h2>
            <div className="flex space-x-2 mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step}
                  className={`flex-1 h-2 rounded ${
                    testStep >= step 
                      ? (testResults[Object.keys(testResults)[step-1]]?.success 
                          ? 'bg-green-500' 
                          : 'bg-red-500')
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {isRunningTests 
                ? `Running test ${testStep}/4: ${
                    testStep === 1 ? 'Supabase Connection' : 
                    testStep === 2 ? 'Claude API' : 
                    testStep === 3 ? 'Website Analysis' : 
                    'Document Analysis'
                  }`
                : testStep > 0 
                  ? 'All tests completed' 
                  : 'Click "Run All Tests" to begin diagnostics'}
            </div>
          </Card>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            {renderResultCard("Supabase Connection", testResults.supabaseConnection, "supabase")}
            {renderResultCard("Claude API Connection", testResults.claudeAPI, "claude")}
            {renderResultCard("Website Analysis", testResults.websiteAnalysis, "website")}
            {renderResultCard("Document Analysis", testResults.documentAnalysis, "document")}
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>
              If any tests fail, check the Edge Function logs in the Supabase dashboard for more detailed error information.
              Once all tests pass, you can proceed to using the application.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Diagnostics;
