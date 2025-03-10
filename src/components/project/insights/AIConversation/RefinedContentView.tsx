
import React from "react";

interface RefinedContentViewProps {
  refinedContent: Record<string, any>;
}

export const RefinedContentView: React.FC<RefinedContentViewProps> = ({ 
  refinedContent 
}) => {
  // Helper function to render the current state of each section
  const renderCurrentSection = (title: string, fieldKey: string) => (
    <div className="mb-3">
      <h5 className="text-xs font-semibold text-slate-600">{title}</h5>
      <p className="text-xs text-slate-700 whitespace-pre-wrap break-words">
        {refinedContent[fieldKey] || "Not provided"}
      </p>
    </div>
  );

  return (
    <div className="bg-slate-50 p-3 rounded border border-slate-200 mt-2 mb-3">
      <h4 className="text-sm font-medium mb-2">Current Refined Version</h4>
      <div className="grid gap-2 text-xs max-h-[250px] overflow-y-auto p-2">
        {renderCurrentSection("Title", "title")}
        {renderCurrentSection("Summary", "summary")}
        {renderCurrentSection("Details", "details")}
        {renderCurrentSection("Evidence", "evidence")}
        {renderCurrentSection("Impact", "impact")}
        {renderCurrentSection("Recommendations", "recommendations")}
      </div>
    </div>
  );
};
