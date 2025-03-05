
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface InsightsTabHeaderProps {
  hasInsights: boolean;
  onRetryAnalysis?: () => void;
  onRefreshInsights?: () => void; // Add refresh function
}

const InsightsTabHeader: React.FC<InsightsTabHeaderProps> = ({ 
  hasInsights, 
  onRetryAnalysis,
  onRefreshInsights
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <Heading size="md" className="mb-1">Document Insights</Heading>
        <p className="text-slate-500 text-sm">
          Strategic insights generated from analyzing the client documents
        </p>
      </div>
      
      <div className="mt-4 md:mt-0 flex items-center gap-2">
        {hasInsights && onRefreshInsights && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={onRefreshInsights}
          >
            <RefreshCcw size={16} />
            Refresh View
          </Button>
        )}
        
        {hasInsights && onRetryAnalysis && (
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <RefreshCcw size={16} />
                Rerun Analysis
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rerun Document Analysis</DialogTitle>
                <DialogDescription>
                  This will restart the document analysis process using Claude AI. 
                  The current insights will be replaced with new ones. Are you sure?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button 
                    onClick={onRetryAnalysis}
                  >
                    Confirm Rerun
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default InsightsTabHeader;
