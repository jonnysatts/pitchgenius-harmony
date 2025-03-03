
import React from "react";

const HelpTabContent: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-xl font-semibold mb-4">Help & Instructions</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-slate-900">Getting Started</h3>
          <p className="text-slate-500">
            Upload your client documents to begin analyzing their gaming opportunities.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-medium text-slate-900">Document Processing</h3>
          <p className="text-slate-500">
            Our AI will analyze your documents to extract strategic insights for gaming narratives.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-medium text-slate-900">Slide Generation</h3>
          <p className="text-slate-500">
            Based on the strategic insights, the system will generate presentation slides following the 6-step narrative framework.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpTabContent;
