
import { v4 as uuidv4 } from 'uuid';
import { StrategicInsight, WebsiteInsightCategory } from '@/lib/types';

/**
 * Generate fallback website insights when the API call fails
 */
export const generateFallbackWebsiteInsights = (
  clientName: string,
  clientIndustry: string,
  projectId: string
): StrategicInsight[] => {
  // Normalize inputs
  const name = clientName || 'the client';
  const industry = clientIndustry || 'technology';

  // Generate a set of fallback insights
  return [
    createBusinessImperativeInsight(name, industry, projectId),
    createAudienceOpportunityInsight(name, industry, projectId),
    createActivationPathwayInsight(name, industry, projectId)
  ];
};

/**
 * Create a business imperative insight
 */
const createBusinessImperativeInsight = (
  clientName: string,
  clientIndustry: string,
  projectId: string
): StrategicInsight => {
  return {
    id: `fallback-business-${uuidv4()}`,
    source: 'website',
    category: 'business_imperatives',
    confidence: 85,
    needsReview: true,
    content: {
      title: `${clientName} Digital Experience Enhancement`,
      summary: `🌐 Analysis suggests ${clientName} needs to modernize their digital experience to better connect with their ${clientIndustry} audience.`,
      details: `The website analysis indicates that ${clientName} could benefit from a more interactive and engaging digital presence. This could help them better showcase their offerings and connect with their target audience in the ${clientIndustry} space.`,
      recommendations: `Games Age should develop a gaming-based digital campaign to enhance ${clientName}'s brand perception and audience engagement in the ${clientIndustry} sector.`
    }
  };
};

/**
 * Create an audience opportunity insight
 */
const createAudienceOpportunityInsight = (
  clientName: string,
  clientIndustry: string,
  projectId: string
): StrategicInsight => {
  return {
    id: `fallback-audience-${uuidv4()}`,
    source: 'website',
    category: 'gaming_audience_opportunity',
    confidence: 80,
    needsReview: true,
    content: {
      title: `Untapped Gaming Audience for ${clientName}`,
      summary: `🌐 ${clientName} has potential to reach new audiences through strategic gaming initiatives.`,
      details: `Analysis suggests that ${clientName} is not fully capitalizing on gaming audience opportunities in the ${clientIndustry} sector. Their current positioning could resonate well with gaming enthusiasts if properly activated.`,
      recommendations: `Games Age should create a targeted gaming activation strategy to help ${clientName} engage with gaming audiences relevant to their ${clientIndustry} focus.`
    }
  };
};

/**
 * Create an activation pathway insight
 */
const createActivationPathwayInsight = (
  clientName: string,
  clientIndustry: string,
  projectId: string
): StrategicInsight => {
  return {
    id: `fallback-activation-${uuidv4()}`,
    source: 'website',
    category: 'strategic_activation_pathways',
    confidence: 75,
    needsReview: true,
    content: {
      title: `Multi-Channel Gaming Experience for ${clientName}`,
      summary: `🌐 ${clientName} could leverage gaming experiences across digital and physical touchpoints to enhance customer engagement.`,
      details: `A strategic gaming activation could help ${clientName} create new touchpoints with their audience, building on their existing strengths in the ${clientIndustry} space while opening new channels for engagement.`,
      recommendations: `Games Age should propose an integrated gaming experience strategy that spans Fortress venues and digital platforms to help ${clientName} create meaningful connections with their audience.`
    }
  };
};
