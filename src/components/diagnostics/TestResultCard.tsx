
import React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";

interface TestResultCardProps {
  title: string;
  result: any;
  sectionKey: string;
  isExpanded: boolean;
  toggleSection: (section: string) => void;
}

export const TestResultCard: React.FC<TestResultCardProps> = ({
  title,
  result,
  sectionKey,
  isExpanded,
  toggleSection
}) => {
  if (!result) {
    return (
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {title}
          </h3>
          <div className="text-sm text-gray-500">Not tested yet</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection(sectionKey)}>
        <h3 className="text-lg font-medium flex items-center gap-2">
          {renderStatusIcon(result.success)}
          {title}
        </h3>
        <div>
          <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
            {result.success ? 'Success' : 'Failed'}
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4">
          <Separator className="my-2" />
          
          {result.error && (
            <div className="mt-2 p-2 bg-red-50 text-red-800 rounded">
              <div className="font-semibold">Error:</div>
              <div className="text-sm whitespace-pre-wrap">{result.error}</div>
            </div>
          )}
          
          <div className="mt-2">
            <div className="font-semibold">Response Data:</div>
            <pre className="text-xs bg-gray-100 p-3 rounded mt-1 overflow-auto max-h-60">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            Test ran at: {new Date(result.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </Card>
  );
};

export const renderStatusIcon = (isSuccess: boolean | undefined, isPending: boolean = false) => {
  if (isPending) return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
  if (isSuccess === true) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
  if (isSuccess === false) return <XCircle className="h-5 w-5 text-red-600" />;
  return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
};
