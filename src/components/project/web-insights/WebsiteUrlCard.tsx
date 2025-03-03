
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface WebsiteUrlCardProps {
  websiteUrl: string;
}

const WebsiteUrlCard: React.FC<WebsiteUrlCardProps> = ({ websiteUrl }) => {
  // Format the URL for display - remove protocol and trailing slash
  const displayUrl = websiteUrl
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
  
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Globe className="h-5 w-5 mr-2 text-blue-500" />
          Website URL Provided
        </CardTitle>
        <CardDescription>
          The following website will be analyzed for insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <a 
          href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-medium"
        >
          {displayUrl}
        </a>
      </CardContent>
    </Card>
  );
};

export default WebsiteUrlCard;
