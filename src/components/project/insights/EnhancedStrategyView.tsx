
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const EnhancedStrategyView: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Gaming Audience Pyramid */}
      <Card>
        <CardHeader>
          <CardTitle>Gaming Audience Pyramid</CardTitle>
          <CardDescription>
            Mapping client opportunities across gaming audience segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <div className="w-0 h-0 border-l-[100px] border-r-[100px] border-b-[160px] border-l-transparent border-r-transparent border-b-slate-200 mx-auto relative">
                <div className="absolute -bottom-[160px] -left-[100px] w-[200px]">
                  <div className="p-2 bg-slate-300 text-xs mb-1">Creators</div>
                  <div className="p-2 bg-slate-200 text-xs mb-1">Committed</div>
                  <div className="p-2 bg-slate-100 text-xs mb-1">Regular</div>
                  <div className="p-2 bg-white text-xs border border-slate-100">Casual</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              No audience mapping insights available yet. Create insights with audience segment 
              tags to populate this framework.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Engagement Spectrum */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Spectrum</CardTitle>
          <CardDescription>
            Plotting strategy across gaming engagement levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-sm font-medium">Spectate</span>
              <span className="text-xs text-slate-500">Awareness</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-sm font-medium">Participate</span>
              <span className="text-xs text-slate-500">Engagement</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-sm font-medium">Create</span>
              <span className="text-xs text-slate-500">Contribution</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-sm font-medium">Advocate</span>
              <span className="text-xs text-slate-500">Evangelism</span>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              No engagement insights available yet. Create insights with engagement level 
              tags to populate this framework.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Physical-Digital Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Physical-Digital Integration</CardTitle>
          <CardDescription>
            Fortress venue integration and omnichannel experiences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-50 rounded-lg space-y-4">
            <p className="text-sm text-center text-slate-600">
              No physical-digital integration insights available yet.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Community-First Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>Community-First Strategy</CardTitle>
          <CardDescription>
            Building authentic relationships with gaming communities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-50 rounded-lg space-y-4">
            <p className="text-sm text-center text-slate-600">
              No community strategy insights available yet.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedStrategyView;
