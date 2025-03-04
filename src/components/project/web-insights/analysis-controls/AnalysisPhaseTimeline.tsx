
import React from 'react';

interface AnalysisPhaseTimelineProps {
  progress: number;
}

export const AnalysisPhaseTimeline: React.FC<AnalysisPhaseTimelineProps> = ({ progress }) => {
  return (
    <>
      <div className="grid grid-cols-4 gap-1 pt-1">
        <div className={`h-1 rounded-l ${progress >= 20 ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
        <div className={`h-1 ${progress >= 40 ? 'bg-blue-400' : 'bg-slate-200'}`}></div>
        <div className={`h-1 ${progress >= 70 ? 'bg-indigo-400' : 'bg-slate-200'}`}></div>
        <div className={`h-1 rounded-r ${progress >= 95 ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
      </div>
      <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-500">
        <div className="text-left">Crawling</div>
        <div className="text-center">Processing</div>
        <div className="text-center">Analysis</div>
        <div className="text-right">Complete</div>
      </div>
    </>
  );
};
