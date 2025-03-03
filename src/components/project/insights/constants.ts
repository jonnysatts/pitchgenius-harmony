
import { Layers, Lightbulb, Users, TrendingUp, FileSliders } from "lucide-react";
import { InsightCategory, NarrativeSection } from "@/lib/types";

// Define the strategic categories for Phase 1 (Analysis)
export const strategicCategories = [
  {
    id: "business_challenges" as InsightCategory,
    label: "Business Challenges",
    description: "Current obstacles the client faces and their relevance to gaming",
    icon: TrendingUp
  },
  {
    id: "audience_gaps" as InsightCategory,
    label: "Audience Engagement Gaps",
    description: "Underserved audience segments and gaming-specific opportunities",
    icon: Users
  },
  {
    id: "competitive_threats" as InsightCategory,
    label: "Competitive Gaming Landscape",
    description: "Competitors' gaming initiatives and market differentiation opportunities",
    icon: TrendingUp
  },
  {
    id: "gaming_opportunities" as InsightCategory,
    label: "Gaming Integration Opportunities",
    description: "Specific tactical and strategic opportunities aligned with Games Age principles",
    icon: Lightbulb
  },
  {
    id: "strategic_recommendations" as InsightCategory,
    label: "Strategic Recommendations",
    description: "Quick wins and long-term initiatives with expected outcomes",
    icon: FileSliders
  },
  {
    id: "key_narratives" as InsightCategory,
    label: "Key Cultural Insights",
    description: "Gaming culture connections and brand positioning opportunities",
    icon: Layers
  }
];

// Define the narrative sections for Phase 2 (Narrative Building)
export const narrativeSections = [
  {
    id: "gaming_revolution" as NarrativeSection,
    label: "Gaming Revolution Context",
    description: "Establishing gaming as a mainstream cultural force",
    sourceCategories: ["competitive_threats", "key_narratives"] as InsightCategory[]
  },
  {
    id: "client_landscape" as NarrativeSection,
    label: "Client's Current Landscape",
    description: "Assessment of challenges and opportunities in the gaming context",
    sourceCategories: ["business_challenges", "audience_gaps"] as InsightCategory[]
  },
  {
    id: "cultural_insight" as NarrativeSection,
    label: "Gaming Cultural Insight",
    description: "Key strategic insights connecting client to gaming culture",
    sourceCategories: ["key_narratives", "audience_gaps"] as InsightCategory[]
  },
  {
    id: "solution_path" as NarrativeSection,
    label: "Strategic Solution Path",
    description: "Strategic approach to addressing client challenges through gaming",
    sourceCategories: ["business_challenges", "gaming_opportunities", "strategic_recommendations"] as InsightCategory[]
  },
  {
    id: "tangible_vision" as NarrativeSection,
    label: "Tangible Vision",
    description: "Concrete activation concepts and implementation details",
    sourceCategories: ["gaming_opportunities", "strategic_recommendations"] as InsightCategory[]
  },
  {
    id: "proof_of_concept" as NarrativeSection,
    label: "Proof of Concept",
    description: "Case studies, ROI metrics, and next steps",
    sourceCategories: ["strategic_recommendations"] as InsightCategory[]
  }
];
