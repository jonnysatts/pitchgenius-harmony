
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
  const [aiConversationMode, setAIConversationMode] = useState(false);
  
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

  const startAIConversation = () => {
    console.log("Starting AI conversation mode");
    setAIConversationMode(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Refine Insight with AI Assistance</DialogTitle>
          <DialogDescription>
            {!aiConversationMode 
              ? "Choose how you'd like to refine this insight" 
              : "Have a conversation with AI to refine your insight"}
          </DialogDescription>
        </DialogHeader>
        
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
        
        <DialogFooter>
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
