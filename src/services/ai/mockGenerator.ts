
/**
 * Mock data generation for development/demo purposes
 */
import { Document, StrategicInsight, Project } from "@/lib/types";

/**
 * Generate comprehensive mock insights for development/demo purposes
 */
export const generateComprehensiveInsights = (project: Project, documents: Document[]): StrategicInsight[] => {
  // Categories for insights
  const categories: Array<StrategicInsight['category']> = [
    "business_challenges",
    "audience_gaps",
    "competitive_threats",
    "gaming_opportunities",
    "strategic_recommendations",
    "key_narratives"
  ];
  
  // Generate 2-3 detailed insights per category
  const insights: StrategicInsight[] = [];
  
  categories.forEach(category => {
    const insightsCount = Math.floor(Math.random() * 2) + 2; // 2-3 insights per category
    
    for (let i = 0; i < insightsCount; i++) {
      insights.push(generateDetailedInsight(category, project, documents));
    }
  });
  
  return insights;
};

/**
 * Generate a single detailed mock insight
 */
const generateDetailedInsight = (
  category: StrategicInsight['category'], 
  project: Project,
  documents: Document[]
): StrategicInsight => {
  const id = `insight_${Math.random().toString(36).substr(2, 9)}`;
  const confidence = Math.floor(Math.random() * 30) + 70; // 70-99%
  const needsReview = confidence < 85;
  
  // Determine industry-specific content
  const industrySpecificContent = getIndustrySpecificContent(project.clientIndustry, category);
  
  // Create a detailed content structure
  const content: Record<string, any> = {
    title: industrySpecificContent.title,
    summary: industrySpecificContent.summary,
    details: industrySpecificContent.details,
    evidence: industrySpecificContent.evidence,
    impact: industrySpecificContent.impact,
    recommendations: industrySpecificContent.recommendations,
    // Reference source documents when possible
    sources: documents.length > 0 
      ? documents.slice(0, Math.min(3, documents.length)).map(doc => ({
          id: doc.id,
          name: doc.name,
          relevance: "high"
        }))
      : undefined,
    dataPoints: industrySpecificContent.dataPoints,
  };
  
  return {
    id,
    category,
    content,
    confidence,
    needsReview
  };
};

/**
 * Industry-specific content templates
 */
const getIndustrySpecificContent = (
  industry: Project['clientIndustry'],
  category: StrategicInsight['category']
): Record<string, any> => {
  // Define base content templates by industry and category
  const templates: Record<string, Record<string, Record<string, any>>> = {
    retail: {
      business_challenges: {
        title: "Declining in-store foot traffic",
        summary: "Physical retail locations are experiencing a 23% year-over-year decline in customer visits.",
        details: "Analysis of client documents reveals a consistent downward trend in physical store visits across all locations. This decline is accelerating at a rate of approximately 5% quarter-over-quarter, with particularly sharp drops in suburban locations. Traditional promotional strategies haven't reversed this trend.",
        evidence: "Store visitation metrics from Q1-Q3 2023 show decreasing trends across all demographics, with strongest declines among 18-34 year olds (37% reduction YoY).",
        impact: "This decline directly impacts not only sales but also the effectiveness of in-store promotions, store staff utilization, and inventory management strategies.",
        recommendations: "Implement gaming activations that drive physical store visits through collectible rewards, in-store exclusive content, and location-based challenges.",
        dataPoints: [
          "37% reduction in Gen Z and Millennial store visits",
          "12% increase in online vs in-store purchase ratio",
          "43% of former in-store shoppers cite 'lack of engaging experience' as reason for shopping online"
        ]
      },
      audience_gaps: {
        title: "Low engagement with Gen Z consumers",
        summary: "Retail brand struggles to connect with younger demographics through traditional channels.",
        details: "Client data shows minimal brand engagement from 16-24 year old consumers across all current marketing channels. This demographic represents a $4.2B annual market opportunity that is being captured by competitors with stronger gaming presence.",
        evidence: "Social media sentiment analysis reveals 72% of Gen Z consumers view the brand as 'irrelevant' or 'not for me' despite product offerings that would appeal to this demographic.",
        impact: "Continued inability to connect with younger consumers threatens long-term brand viability as core customer base ages out.",
        recommendations: "Develop a presence in relevant gaming ecosystems through Fortress partnerships, including in-venue activations and digital integration with popular gaming communities.",
        dataPoints: [
          "84% of Gen Z consumers engage with gaming content weekly",
          "Brand recall increased 32% among gamers exposed to non-intrusive in-game activations",
          "Competitor gaming activations have yielded 4.7x ROI through increased youth engagement"
        ]
      },
      gaming_opportunities: {
        title: "Gamified loyalty program integration",
        summary: "Transform standard loyalty systems into achievement-based progression that drives repeat purchases.",
        details: "Current loyalty program has low participation rates (23%) and minimal impact on purchase frequency. Gaming mechanics like leveling systems, achievement badges, and limited-time quests could significantly boost engagement.",
        evidence: "Similar implementations in adjacent retail sectors have increased program participation by 67% and boosted average purchase frequency by 3.2x.",
        impact: "A gamified loyalty system tied to both online and in-store purchases could drive cross-channel engagement and increase customer lifetime value.",
        recommendations: "Partner with Games Age to design a progression-based loyalty system with physical rewards redeemable at Fortress locations, creating a seamless physical-digital customer journey.",
        dataPoints: [
          "86% of consumers are more likely to engage with loyalty programs that incorporate gaming elements",
          "Achievement-based systems increase purchase frequency 3.2x compared to traditional points",
          "Physical reward redemption drives 2.7x higher perceived value than digital-only rewards"
        ]
      }
    },
    finance: {
      audience_gaps: {
        title: "Disengagement among Gen Z customers",
        summary: "Financial products and services are failing to resonate with younger demographics.",
        details: "Client data indicates high account churn rates among 18-25 year old customers, with primary feedback citing 'boring interfaces' and 'lack of engagement' as key reasons for switching providers. The typical customer acquisition cost for this demographic is 3.2x higher than for older segments, yet retention rates are 47% lower.",
        evidence: "Customer retention reports show 68% of Gen Z customers discontinue services within the first 8 months, compared to 26% for other demographics.",
        impact: "This represents both a significant cost drain and a strategic threat as competitors successfully capture this market segment through more engaging digital experiences.",
        recommendations: "Implement gamified financial education and rewards programs that transform routine financial activities into engaging experiences with progression systems.",
        dataPoints: [
          "68% early service discontinuation rate among Gen Z",
          "4.2x higher mobile app abandonment compared to industry average",
          "87% of surveyed young customers expressed interest in 'game-like' financial applications"
        ]
      },
      strategic_recommendations: {
        title: "Gamified financial literacy platform",
        summary: "Create an educational gaming ecosystem that teaches financial concepts while building brand affinity.",
        details: "Current financial literacy initiatives have minimal engagement and impact. A gamified approach would transform complex financial concepts into accessible, engaging content aligned with how younger audiences prefer to learn.",
        evidence: "Pilot programs with similar gamified educational approaches have shown 83% higher completion rates and 76% better knowledge retention compared to traditional methods.",
        impact: "Building financial literacy creates more qualified future customers while positioning the brand as an innovative partner in financial journeys.",
        recommendations: "Develop a branded gaming experience hosted at Fortress venues that teaches financial concepts through interactive gameplay, with companion mobile app for continued engagement.",
        dataPoints: [
          "91% of Gen Z prefers to learn through interactive experiences rather than traditional formats",
          "Gamified educational content delivers 4.3x higher engagement than traditional formats",
          "Competitors with gamified financial education see 37% higher conversion rates among younger consumers"
        ]
      },
      competitive_threats: {
        title: "Fintech disruptors capturing market share",
        summary: "Gaming-savvy fintech competitors are rapidly capturing younger market segments.",
        details: "Analysis reveals several fintech companies with strong gaming connections are growing at 3-4x industry rates by integrating gaming mechanics into financial products. These companies have captured 17% of the under-30 market in just 36 months.",
        evidence: "Competitive analysis shows 4 major fintech disruptors have deployed gaming-inspired interfaces, progression systems, and reward mechanics to acquire customers at 63% lower cost.",
        impact: "Without similar innovation, client risks permanent loss of emerging high-value market segments and declining relevance as financial services evolve.",
        recommendations: "Partner with Games Age to develop financial services components that utilize gaming rewards, visualizations, and progression to match competitive offerings.",
        dataPoints: [
          "Fintech disruptors implementing game mechanics show 287% higher engagement metrics",
          "Customer acquisition costs reduced by 63% through gaming-based referral programs",
          "41% of young consumers cite 'engaging experience' as primary reason for choosing fintech providers"
        ]
      }
    },
    technology: {
      key_narratives: {
        title: "From users to community: Building brand loyalty through shared experiences",
        summary: "Technology products must evolve from standalone tools to community-centered ecosystems.",
        details: "Analysis of client's current marketing reveals a focus on product features and specifications, while missing the crucial community aspect that drives sustained engagement in gaming platforms. The most successful tech brands now build communities around shared experiences rather than product capabilities alone.",
        evidence: "Sentiment analysis shows users discussing client products focus 82% on technical features vs. competitor discussions that are 67% focused on community experiences.",
        impact: "Shifting from feature-focused to community-focused positioning could transform transactional customers into passionate brand advocates.",
        recommendations: "Create real-world community activations at Fortress venues that showcase how the technology enables meaningful social connections and shared experiences.",
        dataPoints: [
          "Products with strong community components have 4.7x higher retention rates",
          "Customer acquisition costs decrease 58% when referrals come through community connections",
          "Technology brands with gaming-aligned community approaches see 31% higher brand loyalty scores"
        ]
      },
      gaming_opportunities: {
        title: "Product education through gamified experiences",
        summary: "Transform complex product onboarding into engaging gameplay experiences.",
        details: "Current product onboarding experiences show high abandonment rates (47%) and low feature adoption. Gaming principles like progressive difficulty, achievement systems, and social reinforcement could significantly improve product mastery.",
        evidence: "User testing reveals 78% of customers use less than half of available product features due to complex learning curves and lack of engagement with educational materials.",
        impact: "Improved product mastery directly correlates with renewal rates, expansion revenue, and positive word-of-mouth.",
        recommendations: "Design an immersive product training experience at Fortress that uses gaming principles to teach complex features in an engaging format.",
        dataPoints: [
          "Gamified onboarding increases feature adoption by 86% compared to traditional tutorials",
          "Products with achievement-based learning systems see 43% higher customer satisfaction",
          "In-person gamified training experiences result in 92% knowledge retention vs 23% for video tutorials"
        ]
      },
      strategic_recommendations: {
        title: "Gaming-inspired product optimization",
        summary: "Apply successful gaming UX/UI principles to increase product engagement and satisfaction.",
        details: "Current product interfaces follow traditional patterns that fail to capitalize on proven engagement mechanics from gaming. Strategic adoption of elements like progression systems, social proof, and variable rewards could transform the user experience.",
        evidence: "Competitive analysis shows tech products with gaming-inspired interfaces have 73% higher daily active user metrics and 47% longer session durations.",
        impact: "Implementing these changes would directly impact key metrics including user satisfaction, time-in-app, and customer lifetime value.",
        recommendations: "Partner with Games Age UX specialists to conduct a full product experience audit and transformation roadmap based on gaming engagement principles.",
        dataPoints: [
          "Tech products with game-inspired UX see 216% higher daily engagement",
          "Variable reward systems increase return usage by 41% compared to static interfaces",
          "Social proof elements drive 38% higher feature adoption in complex products"
        ]
      }
    },
    entertainment: {
      business_challenges: {
        title: "Fragmented audience attention across platforms",
        summary: "Entertainment content struggles to maintain consistent audience engagement across proliferating platforms.",
        details: "Client data shows declining view completion rates and increasing content abandonment. Audiences now consume entertainment in smaller segments across multiple platforms rather than in traditional extended viewing sessions.",
        evidence: "View completion metrics have declined 32% year-over-year while content switching has increased by 47%.",
        impact: "This fragmentation directly impacts advertising effectiveness, subscription retention, and content production ROI.",
        recommendations: "Develop a transmedia content strategy that integrates gaming components to create persistent engagement across platforms and viewing sessions.",
        dataPoints: [
          "46% of viewers regularly engage with second-screen experiences while consuming content",
          "Transmedia stories with gaming elements show 83% higher engagement than traditional linear content",
          "Interactive components increase view completion rates by 37% across all demographics"
        ]
      },
      competitive_threats: {
        title: "Gaming platforms becoming primary entertainment destinations",
        summary: "Major gaming platforms are now capturing more entertainment hours than traditional media.",
        details: "Analysis shows audiences under 35 now spend 43% more time on gaming platforms than on all traditional entertainment platforms combined. These platforms are expanding beyond games to include social features, live events, and exclusive content.",
        evidence: "Time-spent analysis across entertainment categories shows gaming platforms capturing 4.7 hours daily vs. 3.3 hours for all traditional entertainment combined among 18-34 year olds.",
        impact: "Without integration into gaming ecosystems, traditional entertainment risks continued audience erosion and declining cultural relevance.",
        recommendations: "Create branded experiences within popular gaming environments through Fortress connections, including virtual events, exclusive content drops, and character/skin integrations.",
        dataPoints: [
          "Major gaming platforms hosted over 1,200 non-gaming entertainment events last year",
          "Virtual concerts in gaming environments achieved 27.8M unique viewers vs 3.2M for comparable streaming events",
          "Entertainment content promoted through gaming channels sees 312% higher engagement than traditional advertising"
        ]
      },
      key_narratives: {
        title: "From passive viewing to active participation",
        summary: "The future of entertainment lies in participatory experiences that blend viewing and gameplay.",
        details: "Traditional passive entertainment experiences are showing declining engagement metrics across all demographics. The most successful entertainment properties now extend beyond viewing into active participation, co-creation, and community development.",
        evidence: "Properties with interactive elements see 67% higher audience retention and 84% stronger community engagement metrics.",
        impact: "Shifting from content creation to experience design would unlock new revenue streams and strengthen audience relationships.",
        recommendations: "Partner with Games Age to design hybrid entertainment experiences at Fortress venues that blend traditional content with interactive gameplay elements.",
        dataPoints: [
          "Interactive entertainment experiences generate 3.7x more social media engagement",
          "Participatory story worlds drive 53% higher merchandise revenue than traditional properties",
          "Fans who actively participate in entertainment properties show 81% higher lifetime value"
        ]
      }
    },
    other: {
      business_challenges: {
        title: "Declining brand relevance with younger demographics",
        summary: "Client struggles to maintain relevance with Gen Z and younger Millennial audiences.",
        details: "Analysis shows the client brand is experiencing declining awareness and consideration metrics among consumers under 35. This demographic now represents the largest consumer segment but has the lowest affinity for the client's offerings.",
        evidence: "Brand tracking studies show a 37% decline in unaided awareness among 18-30 year olds over the past 36 months.",
        impact: "Without correcting this trajectory, the client faces significant growth limitations and increasing irrelevance as market demographics continue to shift.",
        recommendations: "Establish authentic presence in gaming culture through Fortress partnerships, leveraging existing brand equity while connecting to new audiences in relevant contexts.",
        dataPoints: [
          "78% of consumers under 30 engage with gaming weekly compared to 23% who engage with traditional advertising",
          "Brands that successfully integrate into gaming see 42% higher consideration among young demographics",
          "Gaming activations deliver 3.4x higher engagement than traditional digital marketing for youth audiences"
        ]
      },
      audience_gaps: {
        title: "Disconnect with digital-native consumer behaviors",
        summary: "Brand experience doesn't align with how digital-native consumers discover and engage with products.",
        details: "Current marketing and product experiences follow traditional consumer journey patterns that don't match how younger audiences discover, evaluate, and connect with brands. Gaming-influenced behaviors like community validation, participatory experiences, and achievement systems are absent from the client's approach.",
        evidence: "Customer journey mapping shows 7 major friction points where digital-native consumers abandon engagement due to misaligned expectations.",
        impact: "This misalignment creates significant inefficiency in marketing spend and prevents meaningful connection with key growth segments.",
        recommendations: "Redesign customer experience pathways based on gaming engagement principles, with Fortress-hosted activations serving as anchors for in-person community building.",
        dataPoints: [
          "Digital-native consumers check an average of 3.7 community sources before purchase decisions",
          "Community-validated brands convert 58% higher than those relying only on direct marketing",
          "Participatory brand experiences generate 43% higher consideration than passive advertising"
        ]
      },
      gaming_opportunities: {
        title: "Community co-creation through gaming frameworks",
        summary: "Leverage gaming structures to transform passive customers into active community members.",
        details: "Current brand community shows low engagement metrics and minimal impact on business outcomes. Gaming principles like shared goals, collaboration mechanics, and recognition systems could transform this dynamic.",
        evidence: "Benchmarking against brands with gaming-inspired community programs shows potential for 4-5x higher engagement and 37% stronger brand advocacy.",
        impact: "A vibrant, participatory community would significantly reduce customer acquisition costs while increasing lifetime value across all segments.",
        recommendations: "Launch a community program structured around gaming principles, with flagship events at Fortress to bring virtual connections into real-world contexts.",
        dataPoints: [
          "Gaming-inspired community programs show 427% higher member engagement than traditional approaches",
          "Co-creation initiatives yield 73% stronger emotional connection to brands",
          "Community members show 4.2x higher lifetime value than non-community customers"
        ]
      }
    }
  };
  
  // Fallback content if specific template isn't available
  const fallbackContent = {
    title: `${category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} for ${industry} industry`,
    summary: `Key ${category.replace('_', ' ')} identified through document analysis.`,
    details: `Comprehensive analysis of client documents reveals significant patterns related to ${category.replace('_', ' ')} that require strategic attention. Multiple data points across various sources confirm this finding.`,
    evidence: "Document analysis revealed consistent patterns across multiple data sources and market research reports.",
    impact: "This insight has significant implications for business growth, market positioning, and competitive advantage.",
    recommendations: "Implement gaming strategies that directly address this insight through engagement mechanics, retention hooks, and monetization opportunities.",
    dataPoints: [
      "Multiple supporting data points identified across documents",
      "Consistent pattern recognition with 87% confidence interval",
      "Strategic relevance rated as high"
    ]
  };
  
  // Return template if available, otherwise fallback
  return templates[industry]?.[category] || fallbackContent;
};
