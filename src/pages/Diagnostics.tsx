
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import {
  TestResultCard,
  ProgressIndicator,
  DiagnosticsHeader,
  testSupabaseConnection,
  testFirecrawlAPI,
  testClaudeDirectAPI,
  testWebsiteAnalysis,
  testDocumentAnalysis
} from "@/components/diagnostics";

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
      
      // Test 2: Firecrawl API Test
      setTestStep(2);
      const firecrawlResult = await testFirecrawlAPI();
      setTestResults(prev => ({ ...prev, firecrawlAPI: firecrawlResult }));
      
      // Test 3: Direct Claude API Test
      setTestStep(3);
      const claudeResult = await testClaudeDirectAPI();
      setTestResults(prev => ({ ...prev, claudeAPI: claudeResult }));
      
      // Test 4: Website Analysis Test with a test URL
      setTestStep(4);
      const websiteAnalysisResult = await testWebsiteAnalysis();
      setTestResults(prev => ({ ...prev, websiteAnalysis: websiteAnalysisResult }));

      // Test 5: Document Analysis Test
      setTestStep(5);
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

  return (
    <AppLayout>
      <div className="container py-6">
        <DiagnosticsHeader 
          isRunningTests={isRunningTests} 
          runAllTests={runAllTests} 
        />

        <div className="grid grid-cols-1 gap-4">
          <ProgressIndicator 
            testStep={testStep}
            isRunningTests={isRunningTests}
            testResults={testResults}
          />

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            <TestResultCard 
              title="Supabase Connection" 
              result={testResults.supabaseConnection} 
              sectionKey="supabase"
              isExpanded={expandedSections.supabase || false}
              toggleSection={toggleSection}
            />
            
            <TestResultCard 
              title="Firecrawl API Connection" 
              result={testResults.firecrawlAPI} 
              sectionKey="firecrawl"
              isExpanded={expandedSections.firecrawl || false}
              toggleSection={toggleSection}
            />
            
            <TestResultCard 
              title="Claude API Connection" 
              result={testResults.claudeAPI} 
              sectionKey="claude"
              isExpanded={expandedSections.claude || false}
              toggleSection={toggleSection}
            />
            
            <TestResultCard 
              title="Website Analysis" 
              result={testResults.websiteAnalysis} 
              sectionKey="website"
              isExpanded={expandedSections.website || false}
              toggleSection={toggleSection}
            />
            
            <TestResultCard 
              title="Document Analysis" 
              result={testResults.documentAnalysis} 
              sectionKey="document"
              isExpanded={expandedSections.document || false}
              toggleSection={toggleSection}
            />
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
