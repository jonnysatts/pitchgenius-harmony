
import {
  Brain,
  Users,
  Crosshair,
  Gamepad2,
  Lightbulb,
  MessageSquare,
  Building,
  UserPlus,
  ArrowUpRight
} from "lucide-react";

// Define categories for document insights
export const insightCategories = [
  {
    id: "business_challenges",
    label: "Business Challenges",
    description: "Critical business issues that could be addressed through gaming strategies",
    icon: Building
  },
  {
    id: "audience_gaps",
    label: "Audience Gaps",
    description: "Untapped audience segments and engagement opportunities",
    icon: Users
  },
  {
    id: "competitive_threats",
    label: "Competitive Threats",
    description: "Positions competitors have taken in the gaming space",
    icon: Crosshair
  },
  {
    id: "gaming_opportunities",
    label: "Gaming Opportunities",
    description: "Specific opportunities for gaming integration",
    icon: Gamepad2
  },
  {
    id: "strategic_recommendations",
    label: "Strategic Recommendations",
    description: "Key recommendations based on the analysis",
    icon: Lightbulb
  },
  {
    id: "key_narratives",
    label: "Key Narratives",
    description: "Cultural insights and storytelling opportunities",
    icon: MessageSquare
  }
];

// Define categories for website-specific insights 
export const websiteInsightCategories = [
  {
    id: "business_imperatives",
    label: "Business Imperatives",
    description: "Critical business challenges that gaming audience engagement could solve",
    icon: Building
  },
  {
    id: "gaming_audience_opportunity",
    label: "Gaming Audience Opportunities",
    description: "How specific gaming audiences can help achieve business objectives",
    icon: UserPlus
  },
  {
    id: "strategic_activation_pathways",
    label: "Strategic Activation Pathways",
    description: "Specific Games Age services that would deliver measurable value",
    icon: ArrowUpRight
  }
];
