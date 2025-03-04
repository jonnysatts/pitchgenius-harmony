
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

interface ManualRefinementModeProps {
  insightTitle: string;
  insightContent: string;
  setRefinedContent: (content: string) => void;
  onStartAIConversation: () => void;
}

export const ManualRefinementMode: React.FC<ManualRefinementModeProps> = ({
  insightTitle,
  insightContent,
  setRefinedContent,
  onStartAIConversation
}) => {
  return (
    <div className="space-y-4 py-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Insight Title</h4>
        <div className="bg-slate-50 p-2 rounded text-sm">{insightTitle}</div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Insight Content</h4>
        <Textarea
          value={insightContent}
          onChange={(e) => setRefinedContent(e.target.value)}
          className="min-h-[200px]"
          placeholder="Edit the insight content..."
        />
      </div>
      
      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          onClick={onStartAIConversation}
          className="flex items-center gap-2 border-purple-200 text-purple-600 hover:bg-purple-50"
        >
          <MessageSquare size={16} />
          Get AI guidance instead
        </Button>
      </div>
    </div>
  );
};
