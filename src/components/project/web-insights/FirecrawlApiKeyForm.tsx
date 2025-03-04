
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { CheckCircle, Server, Link, AlertTriangle, Bug } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { testSupabaseConnection } from '@/integrations/supabase/client';

export const FirecrawlApiKeyForm = () => {
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    checked: boolean;
    success?: boolean;
    message?: string;
    anthropicKeyExists?: boolean;
  }>({ checked: false });
  const [showDebug, setShowDebug] = useState(false);

  // Check for existing API key on mount
  useEffect(() => {
    const existingKey = FirecrawlService.getApiKey();
    setSavedApiKey(existingKey);
    
    // Test Supabase connection and key availability
    const checkConnection = async () => {
      try {
        const result = await testSupabaseConnection();
        setConnectionStatus({
          checked: true,
          success: result.success,
          message: result.message,
          anthropicKeyExists: result.anthropicKeyExists
        });
        console.log('Supabase connection test result:', result);
      } catch (err) {
        console.error('Error testing Supabase connection:', err);
        setConnectionStatus({
          checked: true,
          success: false,
          message: `Error testing connection: ${err instanceof Error ? err.message : String(err)}`
        });
      }
    };
    
    checkConnection();
  }, []);
  
  const toggleDebug = () => setShowDebug(!showDebug);
  
  const runConnectionTest = async () => {
    try {
      const result = await testSupabaseConnection();
      setConnectionStatus({
        checked: true,
        success: result.success,
        message: result.message,
        anthropicKeyExists: result.anthropicKeyExists
      });
      console.log('Connection test result:', result);
    } catch (err) {
      console.error('Error testing connection:', err);
      setConnectionStatus({
        checked: true,
        success: false,
        message: `Error testing connection: ${err instanceof Error ? err.message : String(err)}`
      });
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Firecrawl API Configuration</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleDebug} 
            className="flex items-center gap-1"
          >
            <Bug className="h-4 w-4" />
            {showDebug ? "Hide Debug" : "Debug Info"}
          </Button>
        </CardTitle>
        <CardDescription>
          Firecrawl enhances website analysis by providing better content extraction
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connectionStatus.checked && connectionStatus.success && connectionStatus.anthropicKeyExists ? (
          <div className="flex items-start space-x-2 p-4 bg-green-50 rounded-md border border-green-100">
            <Server className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">Using Supabase Firecrawl Integration</p>
              <p className="text-sm text-green-600 mt-1">
                Your Firecrawl API key is configured in Supabase Edge Function secrets.
                This enables enhanced website scraping capabilities.
              </p>
              <div className="mt-3 flex items-center">
                <Link className="h-4 w-4 text-green-700 mr-1" />
                <a 
                  href="https://supabase.com/dashboard/project/nryafptwknnftdjugoyn/settings/functions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 underline"
                >
                  View Supabase Edge Function Secrets
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start space-x-2 p-4 bg-amber-50 rounded-md border border-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-800 font-medium">Supabase Integration Status: {connectionStatus.success ? 'Connected' : 'Issue Detected'}</p>
              <p className="text-sm text-amber-600 mt-1">
                {connectionStatus.message || 'Checking Supabase connection status...'}
              </p>
              {connectionStatus.checked && !connectionStatus.anthropicKeyExists && (
                <p className="text-sm text-amber-700 mt-2 font-medium">
                  ANTHROPIC_API_KEY not found in Supabase secrets. 
                  Website analysis requires this key to function.
                </p>
              )}
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={runConnectionTest}
                  className="text-amber-700 border-amber-300 hover:bg-amber-100"
                >
                  Test Connection Again
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <Separator className="my-4" />
        
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            <strong>Troubleshooting Note:</strong> The Edge Function looks for either{' '}
            <code className="px-1 py-0.5 bg-gray-100 rounded">FIRECRAWL_API_KEY</code> or{' '}
            <code className="px-1 py-0.5 bg-gray-100 rounded">FIRECRAWL_API_KPI</code> in your Supabase secrets.
          </p>
          <p>
            If website analysis isn't working, check the Edge Function logs for more detailed errors.
          </p>
          <div className="mt-2 flex items-center">
            <Link className="h-4 w-4 text-blue-600 mr-1" />
            <a 
              href="https://supabase.com/dashboard/project/nryafptwknnftdjugoyn/functions/analyze-website-with-anthropic/logs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 underline"
            >
              View Edge Function Logs
            </a>
          </div>
        </div>
        
        {savedApiKey && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Local API key is also available as fallback</span>
          </div>
        )}
        
        {showDebug && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200 font-mono text-xs">
            <h4 className="font-bold mb-2">Debug Information</h4>
            <p>Connection Status: {connectionStatus.checked ? 'Checked' : 'Not Checked'}</p>
            <p>Connection Success: {connectionStatus.success ? 'Yes' : 'No'}</p>
            <p>Anthropic Key Found: {connectionStatus.anthropicKeyExists ? 'Yes' : 'No'}</p>
            <p>Local API Key: {savedApiKey ? 'Present' : 'Not Found'}</p>
            <p>Message: {connectionStatus.message || 'N/A'}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={runConnectionTest}>
                Test Connection
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => {
                  if (savedApiKey) {
                    FirecrawlService.clearApiKey();
                    setSavedApiKey(null);
                  }
                }}
                disabled={!savedApiKey}
              >
                Clear Local Key
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
