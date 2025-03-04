
import React from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ProgressIndicatorProps {
  testStep: number;
  isRunningTests: boolean;
  testResults: Record<string, any>;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  testStep,
  isRunningTests,
  testResults
}) => {
  return (
    <Card className="p-4 bg-blue-50">
      <h2 className="text-lg font-medium mb-2">Current Test Progress</h2>
      <div className="flex space-x-2 mb-4">
        {[1, 2, 3, 4].map((step) => (
          <div 
            key={step}
            className={`flex-1 h-2 rounded ${
              testStep >= step 
                ? (testResults[Object.keys(testResults)[step-1]]?.success 
                    ? 'bg-green-500' 
                    : 'bg-red-500')
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="text-sm text-gray-600">
        {isRunningTests 
          ? `Running test ${testStep}/4: ${
              testStep === 1 ? 'Supabase Connection' : 
              testStep === 2 ? 'Claude API' : 
              testStep === 3 ? 'Website Analysis' : 
              'Document Analysis'
            }`
          : testStep > 0 
            ? 'All tests completed' 
            : 'Click "Run All Tests" to begin diagnostics'}
      </div>
    </Card>
  );
};
