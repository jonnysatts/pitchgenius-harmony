
import { v4 as uuidv4 } from 'uuid';
import { StrategicInsight } from "@/lib/types";

/**
 * Mock API response for when real API calls fail
 */
export const mockApiResponse = {
  insights: [
    {
      id: uuidv4(),
      category: 'business_challenges',
      confidence: 85,
      needsReview: true,
      content: {
        title: 'Australian Gamers Require Low-Latency Connections',
        summary: 'Australian gamers prioritize low-latency connections for competitive gaming, with many willing to pay premium prices for optimized routing.',
        details: 'Due to Australia\'s geographic isolation, gamers face higher latency when connecting to international servers. This creates an opportunity for ISPs to offer gaming-specific packages with optimized routing.',
        evidence: 'Meeting notes indicate client feedback highlighting latency as a primary concern for competitive gamers.',
        recommendations: 'Develop gaming-specific internet packages with guaranteed latency thresholds to major gaming servers.'
      }
    },
    {
      id: uuidv4(),
      category: 'audience_gaps',
      confidence: 78,
      needsReview: true,
      content: {
        title: 'Rural Gamers Underserved by Current Offerings',
        summary: 'Rural Australian gamers represent an underserved market segment with specific connectivity challenges that current ISPs aren\'t addressing.',
        details: 'Regional connectivity challenges persist for rural gamers despite the growing gaming market in Australia. Current ISP offerings don\'t adequately address the specific needs of this audience segment.',
        evidence: 'Strategic memo notes indicate regional connectivity challenges for rural gamers.',
        recommendations: 'Develop specific packages for rural gamers with optimized routing and potentially partnering with satellite providers for improved coverage.'
      }
    },
    {
      id: uuidv4(),
      category: 'competitive_threats',
      confidence: 82,
      needsReview: true,
      content: {
        title: 'Competitors Launching Gaming-Specific Internet Packages',
        summary: 'Major competitors are already launching gaming-specific internet packages, threatening market share in this growing segment.',
        details: 'Key competitors are developing tailored offerings for gamers with features like prioritized gaming traffic, static IPs, and partnerships with gaming platforms.',
        evidence: 'Strategic memo indicates competitors are launching gaming-specific packages.',
        recommendations: 'Accelerate development of gaming-focused offerings with unique differentiators like game subscription bundles and dedicated technical support.'
      }
    },
    {
      id: uuidv4(),
      category: 'gaming_opportunities',
      confidence: 90,
      needsReview: true,
      content: {
        title: 'Cloud Gaming Services Require More Reliable Connections',
        summary: 'The rise of cloud gaming services presents a significant opportunity for ISPs to offer specialized high-reliability connections.',
        details: 'Cloud gaming services like Xbox Cloud Gaming, GeForce NOW, and others require more consistent and reliable connections than traditional downloaded games. This creates an opportunity for premium service tiers.',
        evidence: 'Strategic memo notes that cloud gaming services require more reliable connections.',
        recommendations: 'Develop a premium "Cloud Gaming" tier with guaranteed uptime, low jitter, and optimized routing to major cloud gaming platforms.'
      }
    },
    {
      id: uuidv4(),
      category: 'strategic_recommendations',
      confidence: 88,
      needsReview: true,
      content: {
        title: 'Gaming-Specific Technical Support Team',
        summary: 'Creating a dedicated technical support team specializing in gaming-related issues would be a significant market differentiator.',
        details: 'Gamers often face unique technical issues that general ISP support teams aren\'t equipped to handle. A specialized support team would improve customer satisfaction and retention.',
        evidence: 'Proposal document mentions premium technical support for gaming-related issues as a potential offering.',
        recommendations: 'Establish a dedicated "Gamer Support" team with specialized training on common gaming connectivity issues, popular games, and gaming hardware.'
      }
    },
    {
      id: uuidv4(),
      category: 'key_narratives',
      confidence: 75,
      needsReview: true,
      content: {
        title: 'Gaming Is Becoming More Social and Communal',
        summary: 'The narrative of gaming as a social and communal activity is replacing the old stereotype of the isolated gamer.',
        details: 'Modern gaming is increasingly social, with friends and communities gathering online to play together. This shift creates opportunities for ISPs to position their services as enablers of social connections.',
        evidence: 'Trend data in the strategic memo suggests a shift towards more social gaming experiences.',
        recommendations: 'Develop marketing narratives around enabling social connections through gaming, positioning internet services as the foundation of online communities.'
      }
    }
  ]
};
