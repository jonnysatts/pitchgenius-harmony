
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { useToast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Server, Link } from 'lucide-react';

export const FirecrawlApiKeyForm = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Check for existing API key on mount
  useEffect(() => {
    const existingKey = FirecrawlService.getApiKey();
    setSavedApiKey(existingKey);
    if (existingKey) {
      setApiKey(existingKey);
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Test the API key before saving
      const isValid = await FirecrawlService.testApiKey(apiKey);
      
      if (isValid) {
        FirecrawlService.saveApiKey(apiKey);
        setSavedApiKey(apiKey);
        toast({
          title: "Success",
          description: "Firecrawl API key verified and saved successfully",
        });
      } else {
        toast({
          title: "Invalid API Key",
          description: "The provided API key could not be verified with Firecrawl",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify API key",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Firecrawl API Key</CardTitle>
        <CardDescription>
          Firecrawl is used to enhance website analysis by providing better content extraction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-2 p-4 bg-blue-50 rounded-md border border-blue-100">
          <Server className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-800 font-medium">Using Supabase Firecrawl Integration</p>
            <p className="text-sm text-blue-600 mt-1">
              For the best experience, add your Firecrawl API key to Supabase Edge Function secrets
              with the name "FIRECRAWL_API_KEY". This enables enhanced website scraping.
            </p>
            <div className="mt-3 flex items-center">
              <Link className="h-4 w-4 text-blue-700 mr-1" />
              <a 
                href="https://supabase.com/dashboard/project/nryafptwknnftdjugoyn/settings/functions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-700 underline"
              >
                Add FIRECRAWL_API_KEY to Supabase secrets
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
        
        <div className="mt-4 text-sm text-gray-500">
          <p>Note: The Firecrawl local key below is optional as the primary integration now uses the Supabase configuration.</p>
        </div>
      </CardContent>
      {!savedApiKey && (
        <CardFooter className="flex flex-col space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="apiKey">Local API Key (Optional)</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Firecrawl API key for local use"
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={handleSaveApiKey} 
            disabled={isVerifying}
            className="w-full md:w-auto"
            variant="outline"
          >
            {isVerifying ? "Verifying..." : "Save Local API Key"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
