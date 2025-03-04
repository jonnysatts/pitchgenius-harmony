
/**
 * Generates fallback insights when Claude API fails
 */

export function generateFallbackInsights(
  clientIndustry: string = 'technology',
  documentCount: number = 3
): any[] {
  console.log(`Generating fallback insights for ${clientIndustry} industry with ${documentCount} documents`);
  
  // Get industry-specific fallback insights
  const insights = getIndustrySpecificInsights(clientIndustry, documentCount);
  
  // Add metadata to clearly mark these as fallbacks
  return insights.map(insight => ({
    ...insight,
    isFallback: true,
    generatedAt: new Date().toISOString()
  }));
}

/**
 * Get industry-specific insights based on client industry
 */
function getIndustrySpecificInsights(industry: string, documentCount: number): any[] {
  // Define different insight types
  const categories = [
    'business_challenges', 
    'audience_gaps', 
    'competitive_threats', 
    'gaming_opportunities', 
    'strategic_recommendations', 
    'key_narratives'
  ];
  
  // Create one insight per category
  return categories.map(category => {
    const insightContent = getInsightContent(category, industry);
    
    return {
      id: `fallback_${category}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      category,
      content: {
        title: insightContent.title,
        summary: insightContent.summary,
        details: `This is a sample insight for demonstration purposes. When Claude AI is properly connected, you'll receive detailed analysis here. ${insightContent.details}`,
        evidence: "Note: This is an automatically generated example. For actual insights, please check your Claude API configuration.",
        impact: insightContent.impact,
        recommendations: insightContent.recommendations,
        dataPoints: [
          "This is a fallback insight generated because Claude AI analysis was unavailable",
          "Contact your administrator to verify Claude API configuration",
          "Check Supabase Edge Function logs for more details"
        ]
      },
      confidence: Math.floor(Math.random() * 15) + 85, // Random confidence between 85-99
      needsReview: true,
      source: 'fallback'
    };
  });
}

/**
 * Get content for a specific insight type and industry
 */
function getInsightContent(category: string, industry: string): Record<string, string> {
  // Industry-specific content templates
  const contentTemplates: Record<string, Record<string, Record<string, string>>> = {
    technology: {
      business_challenges: {
        title: "Tech adoption barriers in gaming integration",
        summary: "Many technology companies struggle to authentically connect with gaming audiences.",
        details: "Sample challenge: Integrating gaming experiences with existing technology platforms while maintaining brand authenticity.",
        impact: "Missed opportunities to connect with Gen Z and millennial audiences who prioritize authentic gaming experiences.",
        recommendations: "Consider collaborative product development with gaming studios or creators to build credibility."
      },
      audience_gaps: {
        title: "Underserved technical gaming audiences",
        summary: "Many technical professionals who game are not targeted effectively.",
        details: "Sample gap: Technical professionals who are also hardcore gamers represent an underserved market segment with high disposable income.",
        impact: "Potential for highly profitable audience segment that appreciates both technical excellence and gaming innovation.",
        recommendations: "Develop targeted messaging that respects both the technical expertise and gaming enthusiasm of this audience."
      },
      // Additional categories...
      competitive_threats: {
        title: "Emerging tech competitors with gaming focus",
        summary: "New technology players are entering with gaming-first strategies.",
        details: "Sample threat: Startups developing technology products specifically for gaming audiences, gaining rapid market share.",
        impact: "Risk of being perceived as out-of-touch with gaming culture compared to newer, more agile competitors.",
        recommendations: "Evaluate partnership opportunities with established gaming brands to accelerate credibility."
      },
      gaming_opportunities: {
        title: "Technical product showcases through gaming",
        summary: "Gaming provides an ideal platform to demonstrate technical capabilities.",
        details: "Sample opportunity: Using gaming environments to showcase technical innovations in graphics, AI, or cloud computing.",
        impact: "Potential to reach technical decision-makers through their recreational interests.",
        recommendations: "Create gaming-based demonstrations of core technology capabilities."
      },
      strategic_recommendations: {
        title: "Technology-gaming integration roadmap",
        summary: "Strategic approaches to authentically enter gaming markets.",
        details: "Sample recommendation: Develop an API specifically for gaming developers to encourage integration with your platform.",
        impact: "Creation of two-way value exchange between your technology and the gaming ecosystem.",
        recommendations: "Establish a dedicated gaming integration team with both technical and gaming expertise."
      },
      key_narratives: {
        title: "Technology enhancing gaming experiences",
        summary: "Position technology as an enabler of better gaming experiences.",
        details: "Sample narrative: Your technology makes gaming more accessible, immersive, or social.",
        impact: "Alignment with positive gaming culture values while highlighting technical strengths.",
        recommendations: "Develop case studies showing how your technology specifically improves gaming experiences."
      }
    },
    retail: {
      // Retail-specific content templates...
      business_challenges: {
        title: "Physical retail engagement in digital gaming era",
        summary: "Brick-and-mortar retail struggling to connect with gaming audiences.",
        details: "Sample challenge: Creating compelling in-store experiences that appeal to digitally-native gaming audiences.",
        impact: "Declining foot traffic as gaming consumers shift to digital purchasing channels.",
        recommendations: "Develop in-store gaming activations that cannot be replicated online."
      },
      // Additional categories for retail...
      audience_gaps: {
        title: "Untapped gaming consumer segments in retail",
        summary: "Various gaming audience segments underserved by traditional retail.",
        details: "Sample gap: Female gamers often find retail gaming sections unwelcoming or not designed with their preferences in mind.",
        impact: "Missing significant revenue from growing demographic segments in gaming.",
        recommendations: "Redesign retail spaces with inclusive gaming community needs in mind."
      }
    },
    finance: {
      // Finance-specific content templates...
      business_challenges: {
        title: "Financial literacy gaps in gaming audiences",
        summary: "Young gamers lack engagement with traditional financial products.",
        details: "Sample challenge: Traditional financial education fails to engage gaming-oriented younger demographics.",
        impact: "Growing generation gap in financial product adoption and loyalty.",
        recommendations: "Develop gamified financial education initiatives that leverage familiar gaming mechanics."
      }
    },
    entertainment: {
      // Entertainment-specific content templates...
      business_challenges: {
        title: "IP integration challenges in gaming spaces",
        summary: "Entertainment brands struggle with authentic gaming presence.",
        details: "Sample challenge: Translating linear entertainment experiences into interactive gaming formats without losing brand essence.",
        impact: "Missed opportunities to extend IP lifecycle and reach through gaming channels.",
        recommendations: "Partner with established game developers for authentic adaptations rather than simple licensing."
      }
    }
  };
  
  // Default content if specific industry/category combination not found
  const defaultContent = {
    title: `${category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} for ${industry} industry`,
    summary: `Key ${category.replace('_', ' ')} identified through strategic analysis.`,
    details: `Sample ${category.replace('_', ' ')}: This is a placeholder for real Claude AI analysis results.`,
    impact: "When properly configured, Claude AI will provide detailed impact analysis here.",
    recommendations: "Configure your Claude API integration properly to receive specific recommendations."
  };
  
  // Return specific content if available, otherwise default
  return contentTemplates[industry]?.[category] || defaultContent;
}
