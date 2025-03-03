
import { StrategicInsight, InsightCategory, NarrativeSection } from "@/lib/types";

/**
 * Groups insights by their category
 */
export const groupInsightsByCategory = (insights: StrategicInsight[]): Record<string, StrategicInsight[]> => {
  return insights.reduce((groups, insight) => {
    const category = insight.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(insight);
    return groups;
  }, {} as Record<string, StrategicInsight[]>);
};

/**
 * Groups insights by narrative section based on their category
 */
export const groupInsightsByNarrativeSection = (
  insights: StrategicInsight[], 
  narrativeSections: {id: NarrativeSection, sourceCategories: InsightCategory[]}[]
): Record<string, StrategicInsight[]> => {
  return insights.reduce((sections, insight) => {
    // Find matching narrative sections based on insight category
    const matchingSections = narrativeSections.filter(section => 
      section.sourceCategories.includes(insight.category as InsightCategory)
    );
    
    // Add the insight to each matching section
    matchingSections.forEach(section => {
      if (!sections[section.id]) {
        sections[section.id] = [];
      }
      sections[section.id].push(insight);
    });
    
    return sections;
  }, {} as Record<string, StrategicInsight[]>);
};

/**
 * Format category string into readable title
 */
export const formatCategoryTitle = (category: string): string => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Calculate category distribution metrics
 */
export const getCategoryDistribution = (insights: StrategicInsight[]): Record<string, number> => {
  return insights.reduce((distribution, insight) => {
    const category = insight.category || 'other';
    distribution[category] = (distribution[category] || 0) + 1;
    return distribution;
  }, {} as Record<string, number>);
};

/**
 * Calculate confidence level distribution
 */
export const getConfidenceDistribution = (insights: StrategicInsight[]): Record<string, number> => {
  const ranges = {
    'very_high': 0, // 90-100
    'high': 0,      // 80-89
    'medium': 0,    // 70-79
    'low': 0,       // 60-69
    'very_low': 0   // <60
  };
  
  insights.forEach(insight => {
    const confidence = insight.confidence;
    if (confidence >= 90) ranges.very_high++;
    else if (confidence >= 80) ranges.high++;
    else if (confidence >= 70) ranges.medium++;
    else if (confidence >= 60) ranges.low++;
    else ranges.very_low++;
  });
  
  return ranges;
};

/**
 * Calculate priority level distribution
 */
export const getPriorityDistribution = (insights: StrategicInsight[]): Record<string, number> => {
  return insights.reduce((distribution, insight) => {
    const priority = insight.priorityLevel || 'unspecified';
    distribution[priority] = (distribution[priority] || 0) + 1;
    return distribution;
  }, {} as Record<string, number>);
};

/**
 * Calculate review status distribution
 */
export const getReviewStatusDistribution = (
  reviewedInsights: Record<string, 'accepted' | 'rejected' | 'pending'>
): Record<string, number> => {
  const statusCount = {
    accepted: 0,
    rejected: 0,
    pending: 0
  };
  
  Object.values(reviewedInsights).forEach(status => {
    statusCount[status]++;
  });
  
  return statusCount;
};
