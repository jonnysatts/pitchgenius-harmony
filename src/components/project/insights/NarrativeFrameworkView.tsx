
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { NarrativeSection, StrategicInsight } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NarrativeFrameworkViewProps {
  insights: StrategicInsight[];
}

const NarrativeFrameworkView: React.FC<NarrativeFrameworkViewProps> = ({ insights }) => {
  const [sections, setSections] = useState<NarrativeSection[]>([]);
  const [activeSection, setActiveSection] = useState<string>("intro");

  // Generate narrative sections from insights
  useEffect(() => {
    if (insights && insights.length > 0) {
      // Create static sections
      const narrativeSections: NarrativeSection[] = [
        {
          id: "intro",
          title: "Introduction",
          content: "Strategic overview of gaming audience opportunities and challenges."
        },
        {
          id: "challenge",
          title: "Core Challenges",
          content: generateChallengesContent(insights)
        },
        {
          id: "audience",
          title: "Target Audience",
          content: generateAudienceContent(insights)
        },
        {
          id: "strategy",
          title: "Recommended Strategy",
          content: generateStrategyContent(insights)
        },
        {
          id: "execution",
          title: "Execution Plan",
          content: "Phased implementation approach for the recommended strategies."
        }
      ];
      
      setSections(narrativeSections);
    }
  }, [insights]);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  // Helper functions to extract content from insights
  const generateChallengesContent = (insights: StrategicInsight[]): string => {
    const challengeInsights = insights.filter(i => 
      i.category === 'business_challenges' || 
      i.category === 'competitive_threats'
    );
    
    return challengeInsights.length > 0
      ? challengeInsights.map(i => i.content.summary).join("\n\n")
      : "No specific challenges identified.";
  };

  const generateAudienceContent = (insights: StrategicInsight[]): string => {
    const audienceInsights = insights.filter(i => 
      i.category === 'audience_gaps' || 
      i.category === 'gaming_audience_opportunity'
    );
    
    return audienceInsights.length > 0
      ? audienceInsights.map(i => i.content.summary).join("\n\n")
      : "No specific audience insights identified.";
  };

  const generateStrategyContent = (insights: StrategicInsight[]): string => {
    const strategyInsights = insights.filter(i => 
      i.category === 'strategic_recommendations' || 
      i.category === 'strategic_activation_pathways'
    );
    
    return strategyInsights.length > 0
      ? strategyInsights.map(i => i.content.summary).join("\n\n")
      : "No specific strategy recommendations identified.";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Narrative Framework</h2>
      </div>
      
      <Tabs value={activeSection} onValueChange={handleSectionChange} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          {sections.map(section => (
            <TabsTrigger key={section.id} value={section.id} className="text-sm">
              {section.title}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {sections.map(section => (
          <TabsContent key={section.id} value={section.id}>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-3">{section.title}</h3>
                <div className="whitespace-pre-line text-slate-700">
                  {section.content}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default NarrativeFrameworkView;
