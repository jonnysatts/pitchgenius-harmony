
/**
 * Utility for generating fallback insights when Claude API fails
 */
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

/**
 * Generate fallback insights with proper data structure
 */
export function generateFallbackInsights(industry: string, numDocuments: number) {
  const insights = [];
  
  // Categories to generate insights for
  const categories = [
    'business_challenges',
    'audience_gaps',
    'competitive_threats',
    'gaming_opportunities',
    'strategic_recommendations'
  ];
  
  // Generate insights for each category
  categories.forEach(category => {
    // Generate 1-3 insights per category
    const count = Math.min(Math.floor(Math.random() * 3) + 1, numDocuments);
    
    for (let i = 0; i < count; i++) {
      insights.push({
        id: uuidv4(),
        category,
        content: getContentForCategory(category, industry),
        confidence: Math.floor(Math.random() * 30) + 60, // 60-90% confidence
        needsReview: true,
        source: 'document' as const
      });
    }
  });
  
  return insights;
}

/**
 * Generate content for a specific insight category
 */
function getContentForCategory(category: string, industry: string) {
  const templates = {
    business_challenges: [
      {
        title: "Limited engagement with gaming audiences",
        summary: `${industry} companies are struggling to authentically connect with gaming communities.`,
        details: `Many ${industry} organizations use traditional marketing approaches that don't resonate with gaming audiences. This creates a disconnect between brands and potential customers within the gaming community.`,
        recommendations: "Develop gaming-specific engagement strategies with authentic community participation."
      },
      {
        title: "Underutilized gaming platform opportunities",
        summary: `${industry} brands are missing engagement opportunities on gaming platforms.`,
        details: "Gaming platforms represent massive potential for brand engagement, but many companies lack the expertise to effectively participate in these spaces.",
        recommendations: "Partner with gaming experts to identify platform-specific opportunities aligned with brand goals."
      }
    ],
    audience_gaps: [
      {
        title: "Gen Z engagement deficit",
        summary: `${industry} brands are struggling to meaningfully connect with Gen Z audiences who are deeply involved in gaming.`,
        details: "Gen Z represents significant purchasing power, but traditional marketing techniques are increasingly ineffective with this demographic who spend considerable time in gaming environments.",
        recommendations: "Develop gaming-native marketing strategies that provide value to the gaming experience rather than interrupting it."
      },
      {
        title: "Missing gaming creator relationships",
        summary: `${industry} companies lack relationships with gaming content creators and influencers.`,
        details: "Gaming creators represent trusted voices within their communities. Without these relationships, brands miss opportunities for authentic endorsement and community integration.",
        recommendations: "Build genuine relationships with gaming creators whose audiences align with target demographics."
      }
    ],
    competitive_threats: [
      {
        title: "Competitors gaining gaming audience share",
        summary: `Some ${industry} competitors are establishing early positions in gaming spaces.`,
        details: "Forward-thinking competitors are already establishing gaming partnerships and initiatives, potentially capturing market share and building brand affinity with gaming audiences.",
        recommendations: "Analyze competitor gaming strategies and develop differentiated approaches based on brand strengths."
      },
      {
        title: "Disruptive gaming-native startups",
        summary: `New ${industry} startups built with gaming at their core pose competitive threats.`,
        details: "Gaming-native companies understand the cultural nuances and preferences of gaming audiences. Their authentic positioning gives them advantages in capturing gaming consumer attention.",
        recommendations: "Consider strategic partnerships or acquisitions of gaming-native businesses to accelerate capabilities."
      }
    ],
    gaming_opportunities: [
      {
        title: "Creator partnership program",
        summary: `Develop a structured program for ${industry} brands to partner with gaming creators.`,
        details: "A formalized approach to creator partnerships could help brands develop authentic relationships with gaming audiences through trusted voices.",
        recommendations: "Create a tiered partnership program with clear value exchange for both creators and brands."
      },
      {
        title: "In-game integration opportunities",
        summary: `Explore native ${industry} brand integrations within game environments.`,
        details: "Rather than traditional advertising, brands can create value through in-game items, experiences, or utilities that enhance rather than interrupt gameplay.",
        recommendations: "Identify games with audience alignment and develop integration concepts that add player value."
      }
    ],
    strategic_recommendations: [
      {
        title: "Gaming audience research initiative",
        summary: `Conduct detailed research on gaming audience segments relevant to ${industry}.`,
        details: "Understanding the specific interests, behaviors, and preferences of gaming audiences will inform more effective engagement strategies.",
        recommendations: "Combine quantitative research with qualitative community listening to build detailed audience personas."
      },
      {
        title: "Gaming pilot program",
        summary: `Launch a controlled ${industry} gaming initiative to test approaches.`,
        details: "A small-scale pilot allows for testing gaming strategies with controlled investment before scaling successful approaches.",
        recommendations: "Select 2-3 gaming initiatives to test, establish clear KPIs, and plan for rapid iteration based on results."
      }
    ]
  };
  
  // Get templates for the category
  const categoryTemplates = templates[category as keyof typeof templates] || templates.business_challenges;
  
  // Select a random template
  const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
  
  return template;
}
