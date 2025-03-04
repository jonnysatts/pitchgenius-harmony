
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { CheckCircle, Server, Link } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { testSupabaseConnection } from '@/integrations/supabase/client';

export const FirecrawlApiKeyForm = () => {
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    checked: boolean;
    success?: boolean;
    message?: string;
    anthropicKeyExists?: boolean;
  }>({ checked: false });

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

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Firecrawl API Configuration</CardTitle>
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
            </div>
          </div>
        ) : (
          <div className="flex items-start space-x-2 p-4 bg-amber-50 rounded-md border border-amber-100">
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
            </div>
          </div>
        )}
        
        <Separator className="my-4" />
        
        <div className="text-sm text-gray-600">
          <p>
            If website analysis isn't working, please visit the Diagnostics page to run comprehensive tests.
          </p>
          <div className="mt-2 flex items-center">
            <Link className="h-4 w-4 text-blue-600 mr-1" />
            <a 
              href="/diagnostics" 
              className="text-sm text-blue-600 underline"
            >
              Go to Diagnostics Page
            </a>
          </div>
        </div>
        
        {savedApiKey && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Local API key is also available as fallback</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
