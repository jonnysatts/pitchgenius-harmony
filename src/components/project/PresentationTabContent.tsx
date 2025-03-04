
import React from "react";
import { Project, StrategicInsight } from "@/lib/types";

interface PresentationTabContentProps {
  project: Project;
  insights?: StrategicInsight[];
  acceptedInsights: StrategicInsight[];
}

// This is a mock component - you should implement the actual presentation functionality here
const PresentationTabContent: React.FC<PresentationTabContentProps> = ({
  project,
  insights,
  acceptedInsights
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-xl font-semibold mb-4">Presentation</h2>
      <p className="text-slate-500 mb-6">
        This tab will contain functionality to create and customize presentations
        based on the insights generated for {project.clientName}.
      </p>
      
      <div className="text-center py-12 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium text-slate-700 mb-2">
          Presentation Builder Coming Soon
        </h3>
        <p className="text-sm text-slate-500">
          This feature is currently under development.
          <br />
          {acceptedInsights.length > 0 ? 
            `You have ${acceptedInsights.length} accepted insights ready for presentation.` : 
            'Accept insights to include them in your presentation.'}
        </p>
      </div>
    </div>
  );
};

export default PresentationTabContent;
