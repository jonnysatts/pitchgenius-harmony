
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

interface ManualRefinementModeProps {
  insightTitle: string;
  insightContent: Record<string, any>;
  setRefinedContent: (content: Record<string, any>) => void;
  onStartAIConversation: () => void;
}

export const ManualRefinementMode: React.FC<ManualRefinementModeProps> = ({
  insightTitle,
  insightContent,
  setRefinedContent,
  onStartAIConversation
}) => {
  // Function to update a specific field
  const updateField = (fieldName: string, value: string) => {
    setRefinedContent(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  return (
    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div>
        <h4 className="text-sm font-medium mb-2">Insight Title</h4>
        <Textarea
          value={insightContent.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          className="min-h-[40px]"
          placeholder="Edit the insight title..."
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Summary</h4>
        <Textarea
          value={insightContent.summary || ""}
          onChange={(e) => updateField("summary", e.target.value)}
          className="min-h-[60px]"
          placeholder="Edit the insight summary..."
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Detailed Analysis</h4>
        <Textarea
          value={insightContent.details || ""}
          onChange={(e) => updateField("details", e.target.value)}
          className="min-h-[120px]"
          placeholder="Edit the detailed analysis..."
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Supporting Evidence</h4>
        <Textarea
          value={insightContent.evidence || ""}
          onChange={(e) => updateField("evidence", e.target.value)}
          className="min-h-[80px]"
          placeholder="Edit the supporting evidence..."
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Business Impact</h4>
        <Textarea
          value={insightContent.impact || ""}
          onChange={(e) => updateField("impact", e.target.value)}
          className="min-h-[80px]"
          placeholder="Edit the business impact..."
        />
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Strategic Recommendations</h4>
        <Textarea
          value={insightContent.recommendations || ""}
          onChange={(e) => updateField("recommendations", e.target.value)}
          className="min-h-[80px]"
          placeholder="Edit the strategic recommendations..."
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
