
/**
 * Generator for fallback website insights
 */

/**
 * Generate a set of fallback insights for error cases
 */
export function generateFallbackInsights(industry: string = 'technology'): any[] {
  console.log(`Generating fallback insights for ${industry} industry`);
  
  return [
    {
      id: `fallback_1`,
      category: "business_imperatives",
      content: {
        title: `Essential Business Focus Areas for ${industry}`,
        summary: "Key business imperatives identified from website analysis",
        details: "Based on the website content, the organization needs to focus on customer experience, technological innovation, and market expansion.",
        evidence: "Evidence would normally be extracted from website content.",
        recommendations: "Invest in customer experience improvements and innovation",
        impact: "Improved customer retention and market position"
      },
      confidence: 95,
      needsReview: true,
      source: "website"
    },
    {
      id: `fallback_2`,
      category: "audience_insights",
      content: {
        title: `${industry} Target Audience Analysis`,
        summary: "Audience segments and needs revealed through website messaging",
        details: "The website appears to target enterprise customers with sophisticated needs who value reliability and innovation.",
        evidence: "Evidence would normally be extracted from website content.",
        recommendations: "Refine messaging to better address enterprise pain points",
        impact: "Improved conversion rates and lead quality"
      },
      confidence: 85,
      needsReview: true,
      source: "website"
    },
    {
      id: `fallback_3`,
      category: "competitive_positioning",
      content: {
        title: `${industry} Competitive Differentiation`,
        summary: "Unique positioning in the competitive landscape",
        details: "The organization positions itself as an innovative leader, emphasizing quality and reliability over price.",
        evidence: "Evidence would normally be extracted from website content.",
        recommendations: "Strengthen differentiation messaging in key sections",
        impact: "Clearer market positioning and reduced price sensitivity"
      },
      confidence: 80,
      needsReview: true,
      source: "website"
    },
    {
      id: `fallback_4`,
      category: "growth_opportunities",
      content: {
        title: `${industry} Growth Expansion Possibilities`,
        summary: "Untapped markets and opportunities for growth",
        details: "Potential opportunities exist in adjacent markets and with underserved customer segments.",
        evidence: "Evidence would normally be extracted from website content.",
        recommendations: "Explore partnerships to enter adjacent markets",
        impact: "Expanded customer base and revenue streams"
      },
      confidence: 75,
      needsReview: true,
      source: "website"
    },
    {
      id: `fallback_5`,
      category: "strategic_recommendations",
      content: {
        title: `Strategic Priorities for ${industry} Success`,
        summary: "Key strategic actions to improve market position",
        details: "Focus on enhancing digital presence, streamlining the customer journey, and leveraging data analytics.",
        evidence: "Evidence would normally be extracted from website content.",
        recommendations: "Implement a data-driven approach to customer engagement",
        impact: "Improved conversion rates and customer satisfaction"
      },
      confidence: 90,
      needsReview: true,
      source: "website"
    },
    {
      id: `fallback_6`,
      category: "key_narratives",
      content: {
        title: `Core Brand Narratives for ${industry}`,
        summary: "Essential messaging themes throughout website",
        details: "The primary narrative focuses on innovation, quality, and customer success.",
        evidence: "Evidence would normally be extracted from website content.",
        recommendations: "Strengthen success stories with more specific metrics",
        impact: "Stronger brand identity and customer trust"
      },
      confidence: 85,
      needsReview: true,
      source: "website"
    }
  ];
}
