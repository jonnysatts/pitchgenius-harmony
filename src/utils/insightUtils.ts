import { StrategicInsight, Document } from "@/lib/types";

// Define the NarrativeSection type as string enum
export enum NarrativeSection {
  INTRODUCTION = "introduction",
  BUSINESS_CHALLENGES = "business_challenges",
  AUDIENCE_ANALYSIS = "audience_analysis",
  COMPETITIVE_LANDSCAPE = "competitive_landscape",
  STRATEGIC_RECOMMENDATIONS = "strategic_recommendations",
  TACTICAL_IMPLEMENTATION = "tactical_implementation",
  CONCLUSION = "conclusion"
}

// Function to map insight categories to narrative sections
export const mapInsightToNarrativeSection = (insight: StrategicInsight): string => {
  switch (insight.category) {
    case 'business_challenges':
    case 'competitive_threats':
      return NarrativeSection.BUSINESS_CHALLENGES;
    case 'audience_gaps':
      return NarrativeSection.AUDIENCE_ANALYSIS;
    case 'gaming_opportunities':
      return NarrativeSection.STRATEGIC_RECOMMENDATIONS;
    case 'strategic_recommendations':
      return NarrativeSection.TACTICAL_IMPLEMENTATION;
    case 'key_narratives':
      return NarrativeSection.CONCLUSION;
    default:
      return NarrativeSection.STRATEGIC_RECOMMENDATIONS;
  }
};

// Function to generate a narrative framework from strategic insights
export const generateNarrativeFramework = (insights: StrategicInsight[]) => {
  // Initialize sections with empty arrays
  const sections: Record<string, StrategicInsight[]> = {
    [NarrativeSection.INTRODUCTION]: [],
    [NarrativeSection.BUSINESS_CHALLENGES]: [],
    [NarrativeSection.AUDIENCE_ANALYSIS]: [],
    [NarrativeSection.COMPETITIVE_LANDSCAPE]: [],
    [NarrativeSection.STRATEGIC_RECOMMENDATIONS]: [],
    [NarrativeSection.TACTICAL_IMPLEMENTATION]: [],
    [NarrativeSection.CONCLUSION]: []
  };

  // Distribute insights to appropriate sections
  insights.forEach(insight => {
    // Logic to assign insights to narrative sections
    const section = mapInsightToNarrativeSection(insight);
    if (section) {
      sections[section].push(insight);
    }
  });

  return sections;
};

// Function to extract key points from insights
export const extractKeyPoints = (insights: StrategicInsight[]): string[] => {
  return insights.map(insight => insight.content.summary);
};

// Function to generate recommendations based on insights
export const generateRecommendations = (insights: StrategicInsight[]): string[] => {
  return insights.map(insight => insight.content.recommendations);
};

// Function to identify potential risks based on insights
export const identifyPotentialRisks = (insights: StrategicInsight[]): string[] => {
  return insights.filter(insight => insight.confidence < 50).map(insight => insight.content.summary);
};
