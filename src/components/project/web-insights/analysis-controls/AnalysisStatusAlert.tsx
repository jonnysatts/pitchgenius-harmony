
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Globe, CheckCircle2 } from 'lucide-react';

interface AnalysisStatusAlertProps {
  isProcessingPhase: boolean;
  isInsightPhase: boolean;
  isFinalizingPhase: boolean;
  message: string;
}

export const AnalysisStatusAlert: React.FC<AnalysisStatusAlertProps> = ({
  isProcessingPhase,
  isInsightPhase,
  isFinalizingPhase,
  message
}) => {
  return (
    <Alert 
      className={`${isProcessingPhase ? 'bg-blue-50 border-blue-200' : 
                isInsightPhase ? 'bg-indigo-50 border-indigo-200' :
                isFinalizingPhase ? 'bg-emerald-50 border-emerald-200' :
                'bg-amber-50 border-amber-200'}`}
    >
      <div className="flex items-center">
        {isProcessingPhase ? (
          <Globe className="h-4 w-4 text-blue-500 mr-2 animate-pulse" />
        ) : isInsightPhase ? (
          <Globe className="h-4 w-4 text-indigo-500 mr-2" />
        ) : isFinalizingPhase ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
        ) : (
          <Globe className="h-4 w-4 text-amber-500 mr-2 animate-spin" />
        )}
        <AlertTitle 
          className={`${isProcessingPhase ? 'text-blue-700' : 
                    isInsightPhase ? 'text-indigo-700' :
                    isFinalizingPhase ? 'text-emerald-700' :
                    'text-amber-700'}`}
        >
          {isProcessingPhase ? 'AI Processing' : 
          isInsightPhase ? 'Generating Insights' :
          isFinalizingPhase ? 'Almost Complete' :
          'Website Crawling'}
        </AlertTitle>
      </div>
      <AlertDescription 
        className={`mt-1 ${isProcessingPhase ? 'text-blue-600' : 
                    isInsightPhase ? 'text-indigo-600' :
                    isFinalizingPhase ? 'text-emerald-600' :
                    'text-amber-600'}`}
      >
        {message}
      </AlertDescription>
    </Alert>
  );
};
