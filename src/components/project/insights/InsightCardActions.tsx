
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import InsightRefineDialog from "@/components/project/insights/InsightRefineDialog";

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
  const [isRefineDialogOpen, setIsRefineDialogOpen] = useState(false);
  
  if (!showControls || !onAccept || !onReject) {
    return null;
  }

  const handleOpenRefineDialog = () => {
    setIsRefineDialogOpen(true);
  };

  const handleCloseRefineDialog = () => {
    setIsRefineDialogOpen(false);
  };

  const handleRefineInsight = (updatedContent: Record<string, any>) => {
    if (onUpdate && content) {
      console.log("Updating insight with refined content:", updatedContent);
      
      // Call the onUpdate function with the complete updated content object
      onUpdate(updatedContent);
      
      // Close the dialog after applying changes
      setIsRefineDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex justify-end mt-4 space-x-2">
        {onUpdate && content && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenRefineDialog}
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

      {isRefineDialogOpen && content && (
        <InsightRefineDialog
          isOpen={isRefineDialogOpen}
          onClose={handleCloseRefineDialog}
          insightTitle={content.title || ""}
          insightContent={content}
          onRefine={handleRefineInsight}
        />
      )}
    </>
  );
};

export default InsightCardActions;
