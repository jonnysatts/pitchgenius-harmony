
import React, { useState } from "react";
import { StrategicInsight, AIProcessingStatus, NarrativeSection, InsightCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowRight, Layers, Lightbulb, Users, TrendingUp, FileSliders } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InsightsStats from "@/components/project/InsightsStats";
import InsightsEmptyState from "@/components/project/InsightsEmptyState";
import InsightsErrorAlert from "@/components/project/InsightsErrorAlert";
import InsightsCategoryGroup from "@/components/project/InsightsCategoryGroup";
import InsightsNavigation from "@/components/project/InsightsNavigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

// Define the strategic categories for Phase 1 (Analysis)
const strategicCategories: {id: InsightCategory, label: string, description: string, icon: React.ElementType}[] = [
  {
    id: "business_challenges",
    label: "Business Challenges",
    description: "Current obstacles the client faces and their relevance to gaming",
    icon: TrendingUp
  },
  {
    id: "audience_gaps",
    label: "Audience Engagement Gaps",
    description: "Underserved audience segments and gaming-specific opportunities",
    icon: Users
  },
  {
    id: "competitive_threats",
    label: "Competitive Gaming Landscape",
    description: "Competitors' gaming initiatives and market differentiation opportunities",
    icon: TrendingUp
  },
  {
    id: "gaming_opportunities",
    label: "Gaming Integration Opportunities",
    description: "Specific tactical and strategic opportunities aligned with Games Age principles",
    icon: Lightbulb
  },
  {
    id: "strategic_recommendations",
    label: "Strategic Recommendations",
    description: "Quick wins and long-term initiatives with expected outcomes",
    icon: FileSliders
  },
  {
    id: "key_narratives",
    label: "Key Cultural Insights",
    description: "Gaming culture connections and brand positioning opportunities",
    icon: Layers
  }
];

// Define the narrative sections for Phase 2 (Narrative Building)
const narrativeSections: {id: NarrativeSection, label: string, description: string, sourceCategories: InsightCategory[]}[] = [
  {
    id: "gaming_revolution",
    label: "Gaming Revolution Context",
    description: "Establishing gaming as a mainstream cultural force",
    sourceCategories: ["competitive_threats", "key_narratives"]
  },
  {
    id: "client_landscape",
    label: "Client's Current Landscape",
    description: "Assessment of challenges and opportunities in the gaming context",
    sourceCategories: ["business_challenges", "audience_gaps"]
  },
  {
    id: "cultural_insight",
    label: "Gaming Cultural Insight",
    description: "Key strategic insights connecting client to gaming culture",
    sourceCategories: ["key_narratives", "audience_gaps"]
  },
  {
    id: "solution_path",
    label: "Strategic Solution Path",
    description: "Strategic approach to addressing client challenges through gaming",
    sourceCategories: ["business_challenges", "gaming_opportunities", "strategic_recommendations"]
  },
  {
    id: "tangible_vision",
    label: "Tangible Vision",
    description: "Concrete activation concepts and implementation details",
    sourceCategories: ["gaming_opportunities", "strategic_recommendations"]
  },
  {
    id: "proof_of_concept",
    label: "Proof of Concept",
    description: "Case studies, ROI metrics, and next steps",
    sourceCategories: ["strategic_recommendations"]
  }
];

// Tabs for insights view modes
enum ViewMode {
  STRATEGIC_ANALYSIS = "strategic_analysis",
  NARRATIVE_FRAMEWORK = "narrative_framework",
  ENHANCED_ELEMENTS = "enhanced_elements"
}

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
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.STRATEGIC_ANALYSIS);
  const [activeSection, setActiveSection] = useState<string>("all_insights");
  
  // Determine if Claude is in the intensive processing phase
  const isClaudeProcessing = aiStatus?.status === 'processing' && 
                            aiStatus.progress >= 30 && 
                            aiStatus.progress < 60;
  
  // Group insights by category for Strategic Analysis view
  const insightsByCategory = insights.reduce((groups, insight) => {
    const category = insight.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(insight);
    return groups;
  }, {} as Record<string, StrategicInsight[]>);
  
  // Group insights by narrative section for Narrative Framework view
  const insightsByNarrativeSection = insights.reduce((sections, insight) => {
    // Find matching narrative sections based on insight category
    const matchingSections = narrativeSections.filter(section => 
      section.sourceCategories.includes(insight.category as InsightCategory)
    );
    
    // Add the insight to each matching section
    matchingSections.forEach(section => {
      if (!sections[section.id]) {
        sections[section.id] = [];
      }
      sections[section.id].push(insight);
    });
    
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
          {/* View Mode Selector */}
          <Tabs value={viewMode} onValueChange={setViewMode} className="mb-6">
            <TabsList className="grid grid-cols-3 w-full max-w-lg mb-2">
              <TabsTrigger value={ViewMode.STRATEGIC_ANALYSIS}>
                Strategic Analysis
              </TabsTrigger>
              <TabsTrigger value={ViewMode.NARRATIVE_FRAMEWORK}>
                Narrative Framework
              </TabsTrigger>
              <TabsTrigger value={ViewMode.ENHANCED_ELEMENTS}>
                Enhanced Strategy
              </TabsTrigger>
            </TabsList>
            
            <p className="text-sm text-muted-foreground px-2">
              {viewMode === ViewMode.STRATEGIC_ANALYSIS && 
                "Review insights organized by strategic analysis categories"}
              {viewMode === ViewMode.NARRATIVE_FRAMEWORK && 
                "Build your strategic narrative using insights mapped to presentation sections"}
              {viewMode === ViewMode.ENHANCED_ELEMENTS && 
                "Enhance your strategy with gaming-specific frameworks and models"}
            </p>
          </Tabs>
          
          {/* Strategic Analysis View */}
          {viewMode === ViewMode.STRATEGIC_ANALYSIS && (
            <Tabs defaultValue="all_insights" value={activeSection} onValueChange={setActiveSection}>
              <TabsList className="mb-6 w-full overflow-x-auto flex flex-nowrap">
                <TabsTrigger value="all_insights" className="whitespace-nowrap">
                  All Insights
                </TabsTrigger>
                {strategicCategories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="whitespace-nowrap"
                  >
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {/* Display the description of the current category */}
              <div className="mb-6 px-4 py-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  {activeSection === "all_insights" 
                    ? "Review all strategic insights across categories" 
                    : strategicCategories.find(c => c.id === activeSection)?.description}
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
              
              {/* Create a tab content for each category */}
              {strategicCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="space-y-10">
                  {insightsByCategory[category.id] && insightsByCategory[category.id].length > 0 ? (
                    <InsightsCategoryGroup
                      key={category.id}
                      category={category.id}
                      insights={insightsByCategory[category.id]}
                      reviewedInsights={reviewedInsights}
                      onAcceptInsight={onAcceptInsight}
                      onRejectInsight={onRejectInsight}
                      onUpdateInsight={onUpdateInsight}
                      section={category.label}
                    />
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No insights found for this category.</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
          
          {/* Narrative Framework View */}
          {viewMode === ViewMode.NARRATIVE_FRAMEWORK && (
            <Tabs defaultValue={narrativeSections[0].id} className="space-y-4">
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
              
              {narrativeSections.map((section) => (
                <TabsContent key={section.id} value={section.id} className="space-y-6">
                  <div className="mb-4 px-4 py-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>Draws from:</strong> {section.sourceCategories.map(cat => 
                        strategicCategories.find(c => c.id === cat)?.label
                      ).join(", ")}
                    </p>
                  </div>
                  
                  {insightsByNarrativeSection[section.id] && insightsByNarrativeSection[section.id].length > 0 ? (
                    // Group by original category within the narrative section
                    Object.entries(
                      insightsByNarrativeSection[section.id].reduce((groups, insight) => {
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
                      <p className="text-muted-foreground">No insights mapped to this narrative section yet.</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
          
          {/* Enhanced Strategy Elements View */}
          {viewMode === ViewMode.ENHANCED_ELEMENTS && (
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
          )}
          
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
