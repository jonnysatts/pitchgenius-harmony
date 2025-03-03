
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { useToast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label';

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
          Enter your Firecrawl API key to enable comprehensive website analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Firecrawl API key"
              className="w-full"
            />
          </div>
          
          {savedApiKey && (
            <div className="text-sm text-green-600 dark:text-green-400">
              ✓ API key is saved and ready to use
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveApiKey} 
          disabled={isVerifying}
          className="w-full md:w-auto"
        >
          {isVerifying ? "Verifying..." : "Save API Key"}
        </Button>
      </CardFooter>
    </Card>
  );
};
