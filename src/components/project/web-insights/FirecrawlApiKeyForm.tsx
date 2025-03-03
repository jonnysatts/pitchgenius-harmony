
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { CheckCircle, Server, Link } from 'lucide-react';

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
              Your Firecrawl API key is already configured in Supabase Edge Function secrets
              as "FIRECRAWL_API_KPI". This enables enhanced website scraping capabilities.
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
