
import React, { useState } from "react";
import { StrategicInsight } from "@/lib/types";
import StrategicInsightCard from "@/components/project/StrategicInsightCard";
import { Button } from "@/components/ui/button";
import { Check, X, MessageSquare } from "lucide-react";
import InsightConversation from "./InsightConversation";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface InsightsCategoryGroupProps {
  category: string;
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
  section?: string;
}

const InsightsCategoryGroup: React.FC<InsightsCategoryGroupProps> = ({
  category,
  insights,
  reviewedInsights,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight,
  section = "Strategic Insight"
}) => {
  const [activeInsightId, setActiveInsightId] = useState<string | null>(null);
  
  const handleOpenConversation = (insightId: string) => {
    setActiveInsightId(insightId);
  };
  
  const handleCloseConversation = () => {
    setActiveInsightId(null);
  };
  
  const activeInsight = insights.find(insight => insight.id === activeInsightId);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold capitalize border-b pb-2">
        {category.replace(/_/g, ' ')}
      </h3>
      <div className="space-y-6">
        {insights.map(insight => (
          <div key={insight.id} className="relative">
            <div className={
              reviewedInsights[insight.id] === 'rejected' 
                ? 'opacity-50'
                : ''
            }>
              <StrategicInsightCard insight={insight} />
            </div>
            
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="border-purple-500 text-purple-500 hover:bg-purple-50"
                onClick={() => handleOpenConversation(insight.id)}
              >
                <MessageSquare size={16} />
                <span className="ml-1">Discuss</span>
              </Button>
              
              <Button
                size="sm"
                variant={reviewedInsights[insight.id] === 'accepted' ? "default" : "outline"}
                className={
                  reviewedInsights[insight.id] === 'accepted' 
                    ? "bg-green-500 hover:bg-green-600" 
                    : "border-green-500 text-green-500 hover:bg-green-50"
                }
                onClick={() => onAcceptInsight(insight.id)}
              >
                <Check size={16} />
                <span className="ml-1">Accept</span>
              </Button>
              
              <Button
                size="sm"
                variant={reviewedInsights[insight.id] === 'rejected' ? "default" : "outline"}
                className={
                  reviewedInsights[insight.id] === 'rejected' 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "border-red-500 text-red-500 hover:bg-red-50"
                }
                onClick={() => onRejectInsight(insight.id)}
              >
                <X size={16} />
                <span className="ml-1">Reject</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <Dialog open={activeInsightId !== null} onOpenChange={() => handleCloseConversation()}>
        <DialogContent className="sm:max-w-[800px] p-0">
          {activeInsight && (
            <InsightConversation 
              insight={activeInsight}
              section={section}
              onUpdateInsight={onUpdateInsight}
              onClose={handleCloseConversation}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InsightsCategoryGroup;
