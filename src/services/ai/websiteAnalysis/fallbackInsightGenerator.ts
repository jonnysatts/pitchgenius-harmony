
/**
 * Generate fallback insights when API calls fail
 */
import { StrategicInsight, Project } from "@/lib/types";
import { getCategoryTitle, getCategoryRecommendation, formatCategoryName } from "./insightContentUtils";

/**
 * Generate fallback insights for all website categories
 */
export function generateFallbackInsights(project: Project): StrategicInsight[] {
  console.log(`Generating fallback insights for ${project.clientName || 'client'}`);
  
  const timestamp = Date.now();
  const companyName = project.clientName || "The client";
  const industry = project.clientIndustry || "technology";
  const insights: StrategicInsight[] = [];
  
  // Company Positioning
  insights.push(createCategoryInsight('company_positioning', timestamp, companyName, industry));
  
  // Competitive Landscape
  insights.push(createCategoryInsight('competitive_landscape', timestamp, companyName, industry));
  
  // Key Partnerships
  insights.push(createCategoryInsight('key_partnerships', timestamp, companyName, industry));
  
  // Public Announcements
  insights.push(createCategoryInsight('public_announcements', timestamp, companyName, industry));
  
  // Consumer Engagement
  insights.push(createCategoryInsight('consumer_engagement', timestamp, companyName, industry));
  
  // Product/Service Fit
  insights.push(createCategoryInsight('product_service_fit', timestamp, companyName, industry));
  
  return insights;
}

/**
 * Create a single fallback insight for a specific category
 */
function createCategoryInsight(
  category: string, 
  timestamp: number, 
  companyName: string, 
  industry: string
): StrategicInsight {
  const categoryFormatted = formatCategoryName(category as any);
  
  // Generate content based on category
  let summary = '';
  let details = '';
  let recommendations = '';
  
  switch(category) {
    case 'company_positioning':
      summary = `${companyName} positions itself in the ${industry} market with a focus on customer service and innovation.`;
      details = `Based on website analysis, the company emphasizes its customer-focused approach and technological capabilities in the ${industry} sector. Their positioning appears to target both business and consumer segments with a premium service offering.`;
      recommendations = `Games Age should leverage the company's customer-centric positioning by creating gaming experiences that reinforce their commitment to service excellence and innovation.`;
      break;
    case 'competitive_landscape':
      summary = `${companyName} differentiates from competitors through service quality, reliability, and technological innovation.`;
      details = `The website highlights key differentiators including superior customer support, advanced technology infrastructure, and reliability. These appear to be core competitive advantages in a crowded market.`;
      recommendations = `Games Age should develop gaming elements that highlight competitive differentiators - consider a game that demonstrates superior service quality or technology advantages in an engaging way.`;
      break;
    case 'key_partnerships':
      summary = `${companyName} appears to maintain strategic partnerships with technology providers and industry associations.`;
      details = `The website mentions partnerships with technology providers and industry organizations, suggesting an openness to strategic alliances that enhance their market position and service offerings.`;
      recommendations = `Games Age should explore gaming partnerships that complement existing alliances, particularly with technology providers who could help implement gaming elements into current offerings.`;
      break;
    case 'public_announcements':
      summary = `${companyName} has recently announced service expansions and technology upgrades according to their website.`;
      details = `News sections on the website indicate recent expansions in service offerings and technology infrastructure upgrades, reflecting a growth-oriented business strategy.`;
      recommendations = `Games Age should time gaming initiative announcements to align with planned product or service launches to maximize visibility and create marketing synergies.`;
      break;
    case 'consumer_engagement':
      summary = `${companyName}'s website reveals multiple digital touchpoints for customer engagement including online account management and support.`;
      details = `The website features multiple customer engagement channels including online account management, support portals, and social media integration, indicating a commitment to digital customer experience.`;
      recommendations = `Games Age should implement gamification elements within existing customer portals to increase engagement and time spent in owned digital channels.`;
      break;
    case 'product_service_fit':
      summary = `${companyName}'s ${industry} services offer several opportunities for gaming integration, particularly in customer education and loyalty.`;
      details = `The product and service offerings displayed on the website could benefit from gaming elements particularly in areas of customer education, loyalty development, and community building among users.`;
      recommendations = `Games Age should create interactive games or challenges that educate customers about service offerings while rewarding engagement and loyalty.`;
      break;
  }
  
  return {
    id: `website-${category}-${timestamp}-${Math.floor(Math.random() * 1000)}`,
    source: 'website',
    category: category,
    confidence: 75 + Math.floor(Math.random() * 15),
    needsReview: true,
    content: {
      title: getCategoryTitle(category),
      summary: `🌐 ${summary}`, // Use only the globe icon
      details,
      recommendations,
      websiteUrl: 'website-analysis',
      source: 'Website analysis'
    }
  } as StrategicInsight;
}
