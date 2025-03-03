
import React from "react";
import { Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WebsiteUrlCardProps {
  websiteUrl?: string;
}

const WebsiteUrlCard: React.FC<WebsiteUrlCardProps> = ({ websiteUrl }) => {
  if (!websiteUrl) return null;
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Client Website</CardTitle>
        <CardDescription>
          Analysis based on the client's online presence
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <Globe size={16} className="mr-2 text-slate-400" />
          <a 
            href={(websiteUrl || '').startsWith('http') 
              ? websiteUrl 
              : `https://${websiteUrl}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {websiteUrl}
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebsiteUrlCard;
