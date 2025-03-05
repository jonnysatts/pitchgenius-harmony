
import React from "react";
import { Progress } from "@/components/ui/progress";
import { AIProcessingStatus } from "@/lib/types";

interface AnalysisLoadingStateProps {
  aiStatus?: AIProcessingStatus;
}

const AnalysisLoadingState: React.FC<AnalysisLoadingStateProps> = ({ aiStatus }) => {
  const progress = aiStatus?.progress || 0;
  const message = aiStatus?.message || "Analyzing documents...";
  
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-lg text-center">
      <div className="w-full max-w-md space-y-4">
        <h3 className="text-lg font-medium mb-2">Analyzing Your Documents</h3>
        <p className="text-slate-500 mb-6">
          Our AI is carefully reviewing your documents and extracting strategic insights.
          This may take a few minutes.
        </p>
        
        <Progress value={progress} className="w-full h-2" />
        
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
};

export default AnalysisLoadingState;
