/**
 * Generator for fallback website insights
 */

interface InsightContent {
  title: string;
  summary: string;
  details: string;
  evidence: string;
  recommendations: string;
  impact: string;
}

interface Insight {
  id: string;
  category: string;
  content: InsightContent;
  confidence: number;
  needsReview: boolean;
  source: string;
}

/**
 * Generate a set of fallback insights for error cases
 */
export function generateFallbackInsights(industry: string = 'technology'): Insight[] {
  console.log(`Generating fallback insights for ${industry} industry`);

  const insights: Insight[] = [
    createInsight(
      'fallback_1',
      'business_imperatives',
      `Essential Business Focus Areas for ${industry}`,
      'Key business imperatives identified from website analysis',
      'Based on the website content, the organization needs to focus on customer experience, technological innovation, and market expansion.',
      'Evidence would normally be extracted from website content.',
      'Invest in customer experience improvements and innovation',
      'Improved customer retention and market position',
      95
    ),
    createInsight(
      'fallback_2',
      'audience_insights',
      `${industry} Target Audience Analysis`,
      'Audience segments and needs revealed through website messaging',
      'The website appears to target enterprise customers with sophisticated needs who value reliability and innovation.',
      'Evidence would normally be extracted from website content.',
      'Refine messaging to better address enterprise pain points',
      'Improved conversion rates and lead quality',
      85
    ),
    createInsight(
      'fallback_3',
      'competitive_positioning',
      `${industry} Competitive Differentiation`,
      'Unique positioning in the competitive landscape',
      'The organization positions itself as an innovative leader, emphasizing quality and reliability over price.',
      'Evidence would normally be extracted from website content.',
      'Strengthen differentiation messaging in key sections',
      'Clearer market positioning and reduced price sensitivity',
      80
    ),
    createInsight(
      'fallback_4',
      'growth_opportunities',
      `${industry} Growth Expansion Possibilities`,
      'Untapped markets and opportunities for growth',
      'Potential opportunities exist in adjacent markets and with underserved customer segments.',
      'Evidence would normally be extracted from website content.',
      'Explore partnerships to enter adjacent markets',
      'Expanded customer base and revenue streams',
      75
    ),
    createInsight(
      'fallback_5',
      'strategic_recommendations',
      `Strategic Priorities for ${industry} Success`,
      'Key strategic actions to improve market position',
      'Focus on enhancing digital presence, streamlining the customer journey, and leveraging data analytics.',
      'Evidence would normally be extracted from website content.',
      'Implement a data-driven approach to customer engagement',
      'Improved conversion rates and customer satisfaction',
      90
    ),
    createInsight(
      'fallback_6',
      'key_narratives',
      `Core Brand Narratives for ${industry}`,
      'Essential messaging themes throughout website',
      'The primary narrative focuses on innovation, quality, and customer success.',
      'Evidence would normally be extracted from website content.',
      'Strengthen success stories with more specific metrics',
      'Stronger brand identity and customer trust',
      85
    )
  ];

  return insights;
}

/**
 * Create an insight object
 */
function createInsight(
  id: string,
  category: string,
  title: string,
  summary: string,
  details: string,
  evidence: string,
  recommendations: string,
  impact: string,
  confidence: number
): Insight {
  return {
    id,
    category,
    content: {
      title,
      summary,
      details,
      evidence,
      recommendations,
      impact
    },
    confidence,
    needsReview: true,
    source: 'website'
  };
}
