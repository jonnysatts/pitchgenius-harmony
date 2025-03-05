
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
import { Loader2 } from "lucide-react";
import { ManualRefinementMode } from "./InsightRefineManual";
import { AIConversationMode } from "./InsightRefineAI";

interface InsightRefineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  insightTitle: string;
  insightContent: Record<string, any>;
  onRefine: (refinedContent: Record<string, any>) => void;
}

const InsightRefineDialog: React.FC<InsightRefineDialogProps> = ({
  isOpen,
  onClose,
  insightTitle,
  insightContent,
  onRefine
}) => {
  // Store the full content object, not just the details field
  const [refinedContent, setRefinedContent] = useState<Record<string, any>>({...insightContent});
  const [isRefining, setIsRefining] = useState(false);
  const [aiConversationMode, setAIConversationMode] = useState(false);
  
  const handleRefine = () => {
    setIsRefining(true);
    
    // Call the onRefine callback with the full updated content
    onRefine(refinedContent);
    
    // Reset the refining state but don't close the dialog here
    setTimeout(() => {
      setIsRefining(false);
      onClose(); // Close dialog after successful refinement
    }, 500);
  };

  const startAIConversation = () => {
    console.log("Starting AI conversation mode");
    setAIConversationMode(true);
  };

  // Handle manual text updates for specific fields
  const handleManualTextUpdate = (field: string, value: string) => {
    setRefinedContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Refine Insight with AI Assistance</DialogTitle>
          <DialogDescription>
            {!aiConversationMode 
              ? "Choose how you'd like to refine this insight" 
              : "Have a conversation with AI to refine your insight"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto min-h-[400px]">
          {!aiConversationMode ? (
            <ManualRefinementMode
              insightTitle={insightTitle}
              insightContent={refinedContent}
              setRefinedContent={setRefinedContent}
              onStartAIConversation={startAIConversation}
            />
          ) : (
            <AIConversationMode
              insightTitle={insightTitle}
              initialContent={insightContent}
              refinedContent={refinedContent}
              setRefinedContent={setRefinedContent}
            />
          )}
        </div>
        
        <DialogFooter className="mt-4 pt-2 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={isRefining}>
            Cancel
          </Button>
          <Button 
            onClick={handleRefine} 
            disabled={isRefining}
            className="gap-2"
          >
            {isRefining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
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
