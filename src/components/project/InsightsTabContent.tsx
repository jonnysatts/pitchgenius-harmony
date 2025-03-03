
import React, { useState } from "react";
import { StrategicInsight, AIProcessingStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InsightsStats from "@/components/project/InsightsStats";
import InsightsEmptyState from "@/components/project/InsightsEmptyState";
import InsightsErrorAlert from "@/components/project/InsightsErrorAlert";
import InsightsCategoryGroup from "@/components/project/InsightsCategoryGroup";
import InsightsNavigation from "@/components/project/InsightsNavigation";
import { useToast } from "@/hooks/use-toast";

interface InsightsTabContentProps {
  insights: StrategicInsight[];
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>;
  overallConfidence: number;
  needsReviewCount: number;
  error?: string | null;
  usingFallbackInsights?: boolean;
  aiStatus?: AIProcessingStatus;
  onAcceptInsight: (insightId: string) => void;
  onRejectInsight: (insightId: string) => void;
  onUpdateInsight: (insightId: string, updatedContent: Record<string, any>) => void;
  onNavigateToDocuments: () => void;
  onNavigateToPresentation: () => void;
  onRetryAnalysis?: () => void;
}

// Define the strategic narrative sections
const narrativeSections = [
  {
    id: "all_insights",
    label: "All Insights",
    description: "Review all strategic insights across categories"
  },
  {
    id: "gaming_revolution",
    label: "Gaming Revolution Context",
    description: "Industry-specific gaming statistics and trends relevant to the client"
  },
  {
    id: "client_landscape",
    label: "Client's Current Landscape",
    description: "Assessment of challenges and opportunities in the gaming context"
  },
  {
    id: "cultural_insight",
    label: "Gaming Cultural Insight",
    description: "Key strategic insights connecting client to gaming culture"
  },
  {
    id: "solution_path",
    label: "Strategic Solution Path",
    description: "Strategic approach to addressing client challenges through gaming"
  },
  {
    id: "tangible_vision",
    label: "Tangible Vision",
    description: "Concrete activation concepts and implementation details"
  },
  {
    id: "proof_of_concept",
    label: "Proof of Concept",
    description: "Case studies, ROI metrics, and next steps"
  }
];

// Map insight categories to narrative sections
const categoryToSectionMap: Record<string, string> = {
  "business_challenges": "client_landscape",
  "audience_gaps": "client_landscape",
  "competitive_threats": "client_landscape",
  "gaming_opportunities": "gaming_revolution",
  "strategic_recommendations": "solution_path",
  "key_narratives": "cultural_insight"
};

const InsightsTabContent: React.FC<InsightsTabContentProps> = ({
  insights,
  reviewedInsights,
  overallConfidence,
  needsReviewCount,
  error,
  usingFallbackInsights,
  aiStatus,
  onAcceptInsight,
  onRejectInsight,
  onUpdateInsight,
  onNavigateToDocuments,
  onNavigateToPresentation,
  onRetryAnalysis
}) => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>("all_insights");
  
  // Determine if Claude is in the intensive processing phase
  const isClaudeProcessing = aiStatus?.status === 'processing' && 
                            aiStatus.progress >= 30 && 
                            aiStatus.progress < 60;
  
  // Group insights by category
  const insightsByCategory = insights.reduce((groups, insight) => {
    const category = insight.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(insight);
    return groups;
  }, {} as Record<string, StrategicInsight[]>);
  
  // Group insights by narrative section
  const insightsBySection = insights.reduce((sections, insight) => {
    const category = insight.category || 'other';
    const sectionId = categoryToSectionMap[category] || "other";
    
    if (!sections[sectionId]) {
      sections[sectionId] = [];
    }
    sections[sectionId].push(insight);
    return sections;
  }, {} as Record<string, StrategicInsight[]>);
  
  // Calculate stats
  const acceptedCount = Object.values(reviewedInsights).filter(status => status === 'accepted').length;
  const rejectedCount = Object.values(reviewedInsights).filter(status => status === 'rejected').length;
  
  // Check if all insights have been reviewed (none are pending)
  const allInsightsReviewed = insights.length > 0 && 
    insights.every(insight => reviewedInsights[insight.id] === 'accepted' || reviewedInsights[insight.id] === 'rejected');
  
  // Handler for the Proceed to Presentation button
  const handleProceedToPresentation = () => {
    // Log a message before navigating
    console.log('Proceeding to presentation with:', { 
      acceptedInsights: acceptedCount,
      rejectedInsights: rejectedCount,
      totalInsights: insights.length
    });
    
    // Show a toast notification
    toast({
      title: "Proceeding to Presentation",
      description: `Building presentation with ${acceptedCount} strategic insights`,
    });
    
    // Navigate to the presentation tab
    onNavigateToPresentation();
  };
  
  // Get the current section label for context
  const getCurrentSectionLabel = () => {
    const section = narrativeSections.find(s => s.id === activeSection);
    return section ? section.label : "Strategic Insight";
  };
  
  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Strategic Insights</h2>
        
        {allInsightsReviewed && (
          <Button 
            onClick={handleProceedToPresentation} 
            className="flex items-center gap-2"
          >
            Proceed to Presentation
            <ArrowRight size={16} />
          </Button>
        )}
      </div>
      
      {/* Show error or fallback message if applicable */}
      <InsightsErrorAlert 
        error={error} 
        usingFallbackInsights={usingFallbackInsights}
        isClaudeProcessing={isClaudeProcessing}
        onRetryAnalysis={onRetryAnalysis} 
      />
      
      {insights.length > 0 && (
        <InsightsStats 
          overallConfidence={overallConfidence}
          acceptedCount={acceptedCount}
          rejectedCount={rejectedCount}
          totalInsights={insights.length}
          needsReviewCount={needsReviewCount}
        />
      )}
      
      {insights.length === 0 ? (
        <InsightsEmptyState onNavigateToDocuments={onNavigateToDocuments} />
      ) : (
        <div className="mt-6">
          <Tabs defaultValue="all_insights" value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="mb-6 w-full overflow-x-auto flex flex-nowrap">
              {narrativeSections.map((section) => (
                <TabsTrigger 
                  key={section.id} 
                  value={section.id}
                  className="whitespace-nowrap"
                >
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {/* Display the description of the current section */}
            <div className="mb-6 px-4 py-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                {narrativeSections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
            
            <TabsContent value="all_insights" className="space-y-10">
              {Object.entries(insightsByCategory).map(([category, categoryInsights]) => (
                <InsightsCategoryGroup
                  key={category}
                  category={category}
                  insights={categoryInsights}
                  reviewedInsights={reviewedInsights}
                  onAcceptInsight={onAcceptInsight}
                  onRejectInsight={onRejectInsight}
                  onUpdateInsight={onUpdateInsight}
                  section="All Insights"
                />
              ))}
            </TabsContent>
            
            {/* Create a tab content for each narrative section */}
            {narrativeSections.filter(section => section.id !== "all_insights").map((section) => (
              <TabsContent key={section.id} value={section.id} className="space-y-10">
                {insightsBySection[section.id] && insightsBySection[section.id].length > 0 ? (
                  Object.entries(
                    insightsBySection[section.id].reduce((groups, insight) => {
                      const category = insight.category || 'other';
                      if (!groups[category]) {
                        groups[category] = [];
                      }
                      groups[category].push(insight);
                      return groups;
                    }, {} as Record<string, StrategicInsight[]>)
                  ).map(([category, categoryInsights]) => (
                    <InsightsCategoryGroup
                      key={`${section.id}-${category}`}
                      category={category}
                      insights={categoryInsights}
                      reviewedInsights={reviewedInsights}
                      onAcceptInsight={onAcceptInsight}
                      onRejectInsight={onRejectInsight}
                      onUpdateInsight={onUpdateInsight}
                      section={section.label}
                    />
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No insights categorized for this section yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setActiveSection("all_insights")}
                    >
                      View all insights
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
          
          {/* Bottom button for navigating to presentation */}
          <InsightsNavigation 
            showButton={allInsightsReviewed} 
            onNavigateToPresentation={handleProceedToPresentation} 
          />
        </div>
      )}
    </div>
  );
};

export default InsightsTabContent;
