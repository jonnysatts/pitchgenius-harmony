
import { StrategicInsight } from "@/lib/types";

// Simulate AI processing delay
const simulateProcessingDelay = async (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
};

// Mock categories for strategic insights
const insightCategories = [
  "business_challenges",
  "audience_gaps",
  "competitive_threats",
  "gaming_opportunities",
  "strategic_recommendations",
  "key_narratives"
] as const;

// Generate a random confidence score
const generateConfidenceScore = (): number => {
  // Weighted toward higher confidence, but with some variation
  return Math.floor(70 + Math.random() * 30);
};

// Decide if an insight needs review based on confidence
const shouldNeedReview = (confidence: number): boolean => {
  if (confidence < 75) return true;
  return Math.random() < 0.2; // 20% chance for higher confidence insights
};

// Generate mock insights based on documents
export const generateInsights = async (projectId: string, documents: any[]): Promise<StrategicInsight[]> => {
  await simulateProcessingDelay();
  
  // No documents, return empty array
  if (documents.length === 0) {
    return [];
  }
  
  const insights: StrategicInsight[] = [];
  
  // Generate 1-2 insights for each category
  insightCategories.forEach(category => {
    const numInsights = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numInsights; i++) {
      const confidence = generateConfidenceScore();
      const needsReview = shouldNeedReview(confidence);
      
      let content;
      
      // Generate different content based on category
      switch (category) {
        case "business_challenges":
          content = {
            title: "Key Business Challenges",
            summary: "Client faces challenges in digital transformation and audience engagement.",
            points: [
              "Struggle to connect with younger audiences",
              "Limited digital presence in interactive media",
              "Competitors gaining market share through gaming initiatives"
            ]
          };
          break;
          
        case "audience_gaps":
          content = {
            title: "Audience Engagement Gaps",
            summary: "Significant opportunity to engage Gen Z and Millennial audiences.",
            points: [
              "18-34 demographic underserved by current initiatives",
              "Limited engagement on platforms popular with younger audiences",
              "Audience research suggests desire for interactive experiences"
            ]
          };
          break;
          
        case "competitive_threats":
          content = {
            title: "Emerging Competitive Threats",
            summary: "Competitors are rapidly adopting gaming and interactive strategies.",
            points: [
              "Main competitor launched gaming initiative in Q2",
              "Market disruptors using gamification to build loyalty",
              "Industry shifting toward more interactive consumer experiences"
            ]
          };
          break;
          
        case "gaming_opportunities":
          content = {
            title: "Gaming Integration Opportunities",
            summary: "Multiple strategic opportunities for gaming integration identified.",
            points: [
              "Mobile casual game tied to product discovery",
              "AR experience to enhance retail settings",
              "Gamified loyalty program to increase retention"
            ]
          };
          break;
          
        case "strategic_recommendations":
          content = {
            title: "Strategic Approach",
            summary: "Phased approach to gaming integration recommended.",
            points: [
              "Begin with lightweight mobile experience",
              "Develop AR component for in-store engagement",
              "Build toward full gaming ecosystem with social components"
            ]
          };
          break;
          
        case "key_narratives":
          content = {
            title: "Core Narrative Themes",
            summary: "Key storytelling themes to emphasize in gaming initiatives.",
            points: [
              "Authenticity and brand heritage translated to interactive experiences",
              "Community-building through shared experiences",
              "Innovation balanced with brand consistency"
            ]
          };
          break;
          
        default:
          content = {
            title: "General Insight",
            summary: "Additional insights from document analysis.",
            details: "Our AI analysis found patterns suggesting opportunities for innovation."
          };
      }
      
      insights.push({
        id: `insight_${Math.random().toString(36).substr(2, 9)}`,
        category: category,
        content,
        confidence,
        needsReview
      });
    }
  });
  
  return insights;
};
