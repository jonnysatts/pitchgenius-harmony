
import React from "react";
import { Button } from "@/components/ui/button";

interface InsightCardActionsProps {
  showControls: boolean;
  reviewStatus: 'accepted' | 'rejected' | 'pending';
  onAccept?: () => void;
  onReject?: () => void;
  onUpdate?: (content: Record<string, any>) => void;
  content?: Record<string, any>;
}

const InsightCardActions: React.FC<InsightCardActionsProps> = ({
  showControls,
  reviewStatus,
  onAccept,
  onReject,
  onUpdate,
  content
}) => {
  if (!showControls || !onAccept || !onReject) {
    return null;
  }

  return (
    <div className="flex justify-end mt-4 space-x-2">
      {onUpdate && content && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdate(content)}
          className="text-purple-600 border-purple-200 hover:bg-purple-50"
        >
          Refine
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={onReject}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        Reject
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onAccept}
        className="text-green-600 border-green-200 hover:bg-green-50"
      >
        Accept
      </Button>
    </div>
  );
};

export default InsightCardActions;
