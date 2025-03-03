
import React from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InsightsEmptyStateProps {
  onNavigateToDocuments: () => void;
}

const InsightsEmptyState: React.FC<InsightsEmptyStateProps> = ({ onNavigateToDocuments }) => {
  return (
    <div className="text-center py-12 border border-dashed rounded-lg">
      <Lightbulb className="mx-auto h-12 w-12 text-slate-300" />
      <h3 className="mt-2 text-lg font-semibold text-slate-900">No insights yet</h3>
      <p className="mt-1 text-slate-500 max-w-md mx-auto">
        Upload documents and run the AI analysis to generate strategic insights for gaming opportunities
      </p>
      <Button 
        className="mt-4"
        onClick={onNavigateToDocuments}
      >
        Go to Documents
      </Button>
    </div>
  );
};

export default InsightsEmptyState;
