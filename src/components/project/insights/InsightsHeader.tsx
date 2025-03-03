
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface InsightsHeaderProps {
  title: string;
  showProceedButton: boolean;
  onProceedToPresentation: () => void;
}

const InsightsHeader: React.FC<InsightsHeaderProps> = ({
  title,
  showProceedButton,
  onProceedToPresentation
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      
      {showProceedButton && (
        <Button 
          onClick={onProceedToPresentation} 
          className="flex items-center gap-2"
        >
          Proceed to Presentation
          <ArrowRight size={16} />
        </Button>
      )}
    </div>
  );
};

export default InsightsHeader;
