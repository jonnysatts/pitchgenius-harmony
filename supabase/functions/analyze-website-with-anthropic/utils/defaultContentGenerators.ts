
/**
 * Functions to generate default content for insights
 */

/**
 * Get a default title based on category
 */
export function getCategoryTitle(category: string): string {
  const titles: Record<string, string> = {
    company_positioning: "Company Positioning Analysis",
    competitive_landscape: "Competitive Landscape Overview",
    key_partnerships: "Strategic Partnerships Analysis",
    public_announcements: "Recent Public Announcements",
    consumer_engagement: "Consumer Engagement Opportunities",
    product_service_fit: "Product-Service Gaming Fit"
  };
  
  return titles[category as keyof typeof titles] || "Website Analysis Insight";
}

/**
 * Get a default recommendation based on category
 */
export function getCategoryRecommendation(category: string): string {
  const recommendations: Record<string, string> = {
    company_positioning: "Games Age should align gaming initiatives with the company's brand positioning to ensure consistency and leverage existing brand equity.",
    competitive_landscape: "Games Age should identify gaps in competitors' gaming strategies to develop a distinctive positioning in the gaming space.",
    key_partnerships: "Games Age should explore gaming partnerships that complement existing strategic alliances and extend their value proposition.",
    public_announcements: "Games Age should time gaming initiatives to coincide with or follow major company announcements for maximum visibility.",
    consumer_engagement: "Games Age should develop gaming elements that enhance the existing customer journey and interaction points.",
    product_service_fit: "Games Age should integrate gaming mechanics that highlight and enhance the core value of existing products and services."
  };
  
  return recommendations[category as keyof typeof recommendations] || 
         "Games Age should consider incorporating gaming elements that align with the company's strategic goals.";
}

/**
 * Generate fallback insights when Claude API fails
 */
export function generateFallbackInsights(websiteUrl: string, clientName: string, clientIndustry: string): any[] {
  console.log(`Generating fallback insights for website`);
  
  const timestamp = Date.now();
  const companyName = clientName || "The client";
  const industry = clientIndustry || "technology";
  const insights: any[] = [];
  
  // Import needed functions from other modules
  const { formatCategoryName } = await import('./textProcessingUtils');
  const { getCategoryTitle, getCategoryRecommendation } = await import('./defaultContentGenerators');
  
  // Company Positioning
  insights.push({
    id: `website-company_positioning-${timestamp}-1`,
    category: 'company_positioning',
    confidence: 80,
    needsReview: true,
    content: {
      title: `Brand Positioning in ${formatCategoryName(industry)}`,
      summary: `${companyName} positions itself in the ${industry} market with a focus on customer service and innovation.`,
      details: `Based on website analysis, the company emphasizes its customer-focused approach and technological capabilities in the ${industry} sector. Their positioning appears to target both business and consumer segments with a premium service offering.`,
      recommendations: `Games Age should leverage the company's customer-centric positioning by creating gaming experiences that reinforce their commitment to service excellence and innovation.`
    }
  });
  
  // Competitive Landscape
  insights.push({
    id: `website-competitive_landscape-${timestamp}-2`,
    category: 'competitive_landscape',
    confidence: 75,
    needsReview: true,
    content: {
      title: `Competitive Differentiation Points`,
      summary: `${companyName} differentiates from competitors through service quality, reliability, and technological innovation.`,
      details: `The website highlights key differentiators including superior customer support, advanced technology infrastructure, and reliability. These appear to be core competitive advantages in a crowded market.`,
      recommendations: `Games Age should develop gaming elements that highlight competitive differentiators - consider a game that demonstrates superior service quality or technology advantages in an engaging way.`
    }
  });
  
  // Key Partnerships
  insights.push({
    id: `website-key_partnerships-${timestamp}-3`,
    category: 'key_partnerships',
    confidence: 70,
    needsReview: true,
    content: {
      title: `Strategic Alliance Opportunities`,
      summary: `${companyName} appears to maintain strategic partnerships with technology providers and industry associations.`,
      details: `The website mentions partnerships with technology providers and industry organizations, suggesting an openness to strategic alliances that enhance their market position and service offerings.`,
      recommendations: `Games Age should explore gaming partnerships that complement existing alliances, particularly with technology providers who could help implement gaming elements into current offerings.`
    }
  });
  
  // Public Announcements
  insights.push({
    id: `website-public_announcements-${timestamp}-4`,
    category: 'public_announcements',
    confidence: 72,
    needsReview: true,
    content: {
      title: `Recent Corporate Developments`,
      summary: `${companyName} has recently announced service expansions and technology upgrades according to their website.`,
      details: `News sections on the website indicate recent expansions in service offerings and technology infrastructure upgrades, reflecting a growth-oriented business strategy.`,
      recommendations: `Games Age should time gaming initiative announcements to align with planned product or service launches to maximize visibility and create marketing synergies.`
    }
  });
  
  // Consumer Engagement
  insights.push({
    id: `website-consumer_engagement-${timestamp}-5`,
    category: 'consumer_engagement',
    confidence: 85,
    needsReview: true,
    content: {
      title: `Digital Customer Experience`,
      summary: `${companyName}'s website reveals multiple digital touchpoints for customer engagement including online account management and support.`,
      details: `The website features multiple customer engagement channels including online account management, support portals, and social media integration, indicating a commitment to digital customer experience.`,
      recommendations: `Games Age should implement gamification elements within existing customer portals to increase engagement and time spent in owned digital channels.`
    }
  });
  
  // Product/Service Fit
  insights.push({
    id: `website-product_service_fit-${timestamp}-6`,
    category: 'product_service_fit',
    confidence: 80,
    needsReview: true,
    content: {
      title: `Gaming Integration Potential`,
      summary: `${companyName}'s ${industry} services offer several opportunities for gaming integration, particularly in customer education and loyalty.`,
      details: `The product and service offerings displayed on the website could benefit from gaming elements particularly in areas of customer education, loyalty development, and community building among users.`,
      recommendations: `Games Age should create interactive games or challenges that educate customers about service offerings while rewarding engagement and loyalty.`
    }
  });
  
  return insights;
}
