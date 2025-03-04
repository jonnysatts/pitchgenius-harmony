
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface AnalysisProgressIndicatorProps {
  progress: number;
  isProcessingPhase: boolean;
  isInsightPhase: boolean;
  isFinalizingPhase: boolean;
  message: string;
}

export const AnalysisProgressIndicator: React.FC<AnalysisProgressIndicatorProps> = ({
  progress,
  isProcessingPhase,
  isInsightPhase, 
  isFinalizingPhase,
  message
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className={`font-medium ${isProcessingPhase ? 'text-blue-600' : 
                        isInsightPhase ? 'text-indigo-600' :
                        isFinalizingPhase ? 'text-emerald-600' :
                        'text-amber-600'}`}>
          {Math.min(Math.round(progress), 99)}%
        </span>
        <span className="text-slate-600">
          {isProcessingPhase ? "Claude AI Analysis" : 
          isInsightPhase ? "Insight Generation" :
          isFinalizingPhase ? "Finalizing" :
          "Website Crawling"}
        </span>
      </div>
      <Progress 
        value={progress} 
        className="w-full h-2.5"
        indicatorColor={isProcessingPhase ? "bg-blue-500" : 
                      isInsightPhase ? "bg-indigo-500" :
                      isFinalizingPhase ? "bg-emerald-500" : 
                      "bg-amber-500"}
        showAnimation={isProcessingPhase}
      />
      <p className={`text-xs italic ${isProcessingPhase ? 'text-blue-600 font-medium' : 
                  isInsightPhase ? 'text-indigo-600' :
                  isFinalizingPhase ? 'text-emerald-600' :
                  'text-amber-600'}`}>
        {isProcessingPhase ? 
          "Claude AI is analyzing your website content. This may take up to 2 minutes..." : 
        isInsightPhase ?
          "Processing data and generating strategic insights..." :
        isFinalizingPhase ?
          "Preparing insights for display..." :
          "Crawling website and extracting content..."}
      </p>
    </div>
  );
};
