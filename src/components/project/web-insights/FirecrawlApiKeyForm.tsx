
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { CheckCircle, Server, Link, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const FirecrawlApiKeyForm = () => {
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);

  // Check for existing API key on mount
  useEffect(() => {
    const existingKey = FirecrawlService.getApiKey();
    setSavedApiKey(existingKey);
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
        
        <Separator className="my-4" />
        
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            <strong>Troubleshooting Note:</strong> The Edge Function looks for either 
            <code className="px-1 py-0.5 bg-gray-100 rounded">FIRECRAWL_API_KEY</code> or 
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
      </CardContent>
    </Card>
  );
};
