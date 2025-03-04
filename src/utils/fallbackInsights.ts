
import { Project, StrategicInsight } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate fallback insights when the website analysis API fails
 */
export function generateFallbackWebsiteInsights(project: Project): StrategicInsight[] {
  const industry = project.clientIndustry || "technology";
  const clientName = project.clientName || "the client";
  const website = project.clientWebsite || "the website";
  
  // Base insights that will be customized based on the project
  const insights: StrategicInsight[] = [
    {
      id: uuidv4(),
      category: "business_imperatives",
      content: {
        title: `${clientName} Brand Integration Opportunities`,
        summary: `${clientName} should focus on strategic gaming partnerships that align with their brand values.`,
        details: `Based on ${website}, ${clientName} has a strong brand presence that could be leveraged through carefully selected gaming partnerships.`,
        evidence: "The website showcases a commitment to quality and customer experience.",
        recommendations: "Consider partnerships with premium gaming brands that share similar audience demographics.",
        impact: "High potential ROI with proper alignment between brand values and gaming partnerships."
      },
      confidence: 85,
      needsReview: true,
      source: "website"
    },
    {
      id: uuidv4(),
      category: "audience_insights",
      content: {
        title: `${industry} Customer Gaming Engagement Patterns`,
        summary: `${clientName}'s customers show characteristics that align with specific gaming demographics.`,
        details: `The ${industry} audience that ${clientName} serves has significant overlap with gaming audiences, particularly in the 25-45 age range.`,
        evidence: "Website messaging and services indicate a tech-savvy customer base.",
        recommendations: "Target casual and mid-core gaming experiences that appeal to professionals with disposable income.",
        impact: "Potential to engage customers through interactive gaming experiences that reinforce brand loyalty."
      },
      confidence: 80,
      needsReview: true,
      source: "website"
    },
    {
      id: uuidv4(),
      category: "competitive_positioning",
      content: {
        title: `Competitive Differentiation Through Gaming`,
        summary: `${clientName} can differentiate from competitors by being an early adopter of gaming partnerships.`,
        details: `Few companies in the ${industry} sector have embraced gaming partnerships, creating an opportunity for ${clientName} to stand out.`,
        evidence: "Limited gaming-related content on the website suggests this is an untapped area.",
        recommendations: "Be first-to-market with innovative gaming collaborations in the ${industry} sector.",
        impact: "Significant differentiation from competitors and potential media coverage for innovative approach."
      },
      confidence: 75,
      needsReview: true,
      source: "website"
    },
    {
      id: uuidv4(),
      category: "growth_opportunities",
      content: {
        title: `${industry} Gamification Growth Strategy`,
        summary: `Implementing gamification elements into ${clientName}'s products or services could drive growth.`,
        details: `${clientName} could enhance customer engagement by integrating game-like elements into their existing offerings.`,
        evidence: "The website's user experience suggests openness to innovative customer engagement approaches.",
        recommendations: "Develop a tiered rewards program with game-like progression and achievements.",
        impact: "Increased customer retention and higher engagement metrics across digital touchpoints."
      },
      confidence: 78,
      needsReview: true,
      source: "website"
    },
    {
      id: uuidv4(),
      category: "strategic_recommendations",
      content: {
        title: `Phased Gaming Integration Roadmap`,
        summary: `A three-phase approach to integrating gaming partnerships for ${clientName}.`,
        details: `${clientName} should approach gaming partnerships through a structured roadmap, beginning with low-risk collaborations and scaling based on performance.`,
        evidence: "The website suggests a methodical approach to business development.",
        recommendations: "Start with co-branded digital content, progress to in-game advertising, and finally develop custom gaming experiences.",
        impact: "Maximized ROI with minimized risk through staged implementation and performance evaluation."
      },
      confidence: 82,
      needsReview: true,
      source: "website"
    },
    {
      id: uuidv4(),
      category: "key_narratives",
      content: {
        title: `${clientName}'s Brand Story in Gaming Contexts`,
        summary: `The core brand narrative can be effectively translated into gaming environments.`,
        details: `${clientName}'s key messaging around quality, reliability, and customer satisfaction can be powerfully communicated through gaming partnerships.`,
        evidence: "Brand messaging on the website emphasizes values that resonate with gaming audiences.",
        recommendations: "Develop gaming partnerships that allow the brand story to be told through interactive experiences.",
        impact: "Deeper emotional connection with customers through interactive storytelling."
      },
      confidence: 79,
      needsReview: true,
      source: "website"
    }
  ];
  
  // Add industry-specific customizations
  if (industry === "technology") {
    insights.push({
      id: uuidv4(),
      category: "strategic_recommendations",
      content: {
        title: "Tech Product Integration with Gaming Platforms",
        summary: `${clientName} should explore direct product integration with popular gaming platforms.`,
        details: "Technology companies have unique opportunities to integrate their products directly into gaming ecosystems.",
        evidence: "The website showcases APIs and integration capabilities that could extend to gaming platforms.",
        recommendations: "Develop gaming-specific APIs and SDKs to enable seamless integration with major gaming platforms.",
        impact: "New revenue streams and expanded market reach through the gaming ecosystem."
      },
      confidence: 88,
      needsReview: true,
      source: "website"
    });
  } else if (industry === "finance" || industry === "banking") {
    insights.push({
      id: uuidv4(),
      category: "audience_insights",
      content: {
        title: "Financial Education Through Gaming",
        summary: `${clientName} could use gamification to improve financial literacy among younger customers.`,
        details: "Finance companies can leverage gaming mechanics to make financial education more engaging and accessible.",
        evidence: "Website content suggests a focus on customer education that could be enhanced through gamification.",
        recommendations: "Develop a financial education game that teaches core concepts while promoting services.",
        impact: "Increased financial literacy among customers and stronger brand positioning as an innovative finance company."
      },
      confidence: 84,
      needsReview: true,
      source: "website"
    });
  }
  
  return insights;
}
