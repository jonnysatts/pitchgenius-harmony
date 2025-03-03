
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface InsightsNavigationProps {
  showButton: boolean;
  onNavigateToPresentation: () => void;
}

const InsightsNavigation: React.FC<InsightsNavigationProps> = ({
  showButton,
  onNavigateToPresentation
}) => {
  if (!showButton) return null;
  
  return (
    <div className="flex justify-center mt-8">
      <Button 
        onClick={onNavigateToPresentation}
        size="lg"
        className="flex items-center gap-2"
      >
        Proceed to Presentation Builder
        <ArrowRight size={16} />
      </Button>
    </div>
  );
};

export default InsightsNavigation;
