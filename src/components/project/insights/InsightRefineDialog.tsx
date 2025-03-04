
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface InsightRefineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  insightTitle: string;
  insightContent: string;
  onRefine: (refinedContent: string) => void;
}

const InsightRefineDialog: React.FC<InsightRefineDialogProps> = ({
  isOpen,
  onClose,
  insightTitle,
  insightContent,
  onRefine
}) => {
  const [refinedContent, setRefinedContent] = useState(insightContent);
  const [isRefining, setIsRefining] = useState(false);

  const handleRefine = () => {
    setIsRefining(true);
    
    // Call the onRefine callback with the updated content
    onRefine(refinedContent);
    
    // Close the dialog and reset state
    setTimeout(() => {
      setIsRefining(false);
      onClose();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Refine Insight</DialogTitle>
          <DialogDescription>
            Edit the insight content below to refine it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Insight Title</h4>
            <div className="bg-slate-50 p-2 rounded text-sm">{insightTitle}</div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Insight Content</h4>
            <Textarea
              value={refinedContent}
              onChange={(e) => setRefinedContent(e.target.value)}
              className="min-h-[200px]"
              placeholder="Edit the insight content..."
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isRefining}>
            Cancel
          </Button>
          <Button onClick={handleRefine} disabled={isRefining}>
            {isRefining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refining...
              </>
            ) : (
              "Apply Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InsightRefineDialog;
