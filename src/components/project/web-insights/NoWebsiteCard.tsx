
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NoWebsiteCard: React.FC = () => {
  return (
    <Card className="mb-6 border-amber-200 bg-amber-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">No Website URL Provided</CardTitle>
        <CardDescription>
          Add a client website URL to analyze their online presence
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-amber-700">
          Return to the Documents tab or Dashboard to add a website URL for the client.
          Website analysis can provide valuable insights about the client's brand positioning,
          target audience, and current marketing strategies.
        </p>
      </CardContent>
    </Card>
  );
};

export default NoWebsiteCard;
