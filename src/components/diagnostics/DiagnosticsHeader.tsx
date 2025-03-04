
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DiagnosticsHeaderProps {
  isRunningTests: boolean;
  runAllTests: () => Promise<void>;
}

export const DiagnosticsHeader: React.FC<DiagnosticsHeaderProps> = ({
  isRunningTests,
  runAllTests
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">System Diagnostics</h1>
        <p className="text-gray-600">
          Test all API connections and analysis functions before using the application
        </p>
      </div>
      <Button 
        size="lg" 
        onClick={runAllTests}
        disabled={isRunningTests}
      >
        {isRunningTests && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Run All Tests
      </Button>
    </div>
  );
};
