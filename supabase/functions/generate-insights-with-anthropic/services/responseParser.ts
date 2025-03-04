
/**
 * Parse and format Claude API responses
 */

/**
 * Parse Claude's response text into strategic insights
 */
export function parseClaudeResponse(responseText: string) {
  try {
    console.log('Parsing Claude response...');
    // Log a snippet of the response for debugging
    console.log('Response sample:', responseText.substring(0, 200));
    
    // First, try to extract a JSON array or object from the response
    const jsonMatch = responseText.match(/```json([\s\S]*?)```/) || 
                      responseText.match(/```([\s\S]*?)```/) ||  // Try without json tag
                      responseText.match(/(\{[\s\S]*\})/) ||    // Try raw JSON
                      responseText.match(/(\[[\s\S]*\])/);      // Try raw JSON array
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        // Try to parse the extracted JSON
        const jsonText = jsonMatch[1].trim();
        console.log('Extracted potential JSON:', jsonText.substring(0, 150) + '...');
        const jsonData = JSON.parse(jsonText);
        
        // Check if we have an array of insights
        if (Array.isArray(jsonData)) {
          console.log(`Found JSON array with ${jsonData.length} insights`);
          return jsonData;
        }
        
        // If it's an object with an insights property that's an array
        if (jsonData.insights && Array.isArray(jsonData.insights)) {
          console.log(`Found JSON object with ${jsonData.insights.length} insights`);
          return jsonData.insights;
        }
        
        // If it's a single insight object, wrap it in an array
        if (jsonData.title || jsonData.content || jsonData.category) {
          console.log('Found single JSON insight object');
          return [jsonData];
        }
        
        // If we get here, we have some JSON but not in the format we expect
        console.log('JSON found but format is unexpected, trying to normalize');
        return normalizeClaudeJsonResponse(jsonData);
      } catch (jsonError) {
        console.error('Error parsing JSON from response:', jsonError);
        // Continue to fallback parsing if JSON parsing fails
      }
    }
    
    // If JSON extraction/parsing failed, try to parse structured text
    console.log('Falling back to structured text parsing');
    return parseStructuredTextResponse(responseText);
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    return [];
  }
}

/**
 * Attempt to normalize unexpected JSON structures into insights format
 */
function normalizeClaudeJsonResponse(jsonData: any) {
  const insights = [];
  const timestamp = Date.now();
  
  // Check for business_challenges format
  if (jsonData.business_challenges && Array.isArray(jsonData.business_challenges)) {
    jsonData.business_challenges.forEach((challenge: any, index: number) => {
      insights.push({
        id: `challenge_${timestamp}_${index}`,
        title: challenge.challenge || `Business Challenge ${index + 1}`,
        category: 'business_challenges',
        content: challenge.relevance_to_gaming || challenge.description || JSON.stringify(challenge),
        confidence: challenge.priority ? (challenge.priority / 5) * 100 : 70,
        source: 'document' as const,
        status: 'pending' as const
      });
    });
  }
  
  // Check for audience_gaps format
  if (jsonData.audience_gaps && Array.isArray(jsonData.audience_gaps)) {
    jsonData.audience_gaps.forEach((gap: any, index: number) => {
      insights.push({
        id: `gap_${timestamp}_${index}`,
        title: gap.segment || `Audience Gap ${index + 1}`,
        category: 'audience_gaps',
        content: gap.gaming_opportunity || gap.description || JSON.stringify(gap),
        confidence: 80,
        source: 'document' as const,
        status: 'pending' as const
      });
    });
  }
  
  // Check for competitive_threats format
  if (jsonData.competitive_threats && Array.isArray(jsonData.competitive_threats)) {
    jsonData.competitive_threats.forEach((threat: any, index: number) => {
      insights.push({
        id: `threat_${timestamp}_${index}`,
        title: threat.competitor || `Competitive Threat ${index + 1}`,
        category: 'competitive_threats',
        content: threat.gaming_approach || threat.description || JSON.stringify(threat),
        confidence: threat.threat_level ? (threat.threat_level / 5) * 100 : 75,
        source: 'document' as const,
        status: 'pending' as const
      });
    });
  }
  
  // Check for gaming_opportunities format
  if (jsonData.gaming_opportunities && Array.isArray(jsonData.gaming_opportunities)) {
    jsonData.gaming_opportunities.forEach((opportunity: any, index: number) => {
      insights.push({
        id: `opportunity_${timestamp}_${index}`,
        title: opportunity.opportunity || `Gaming Opportunity ${index + 1}`,
        category: 'gaming_opportunities',
        content: opportunity.alignment_to_games_age_principles || opportunity.description || JSON.stringify(opportunity),
        confidence: opportunity.potential_impact ? (opportunity.potential_impact / 5) * 100 : 85,
        source: 'document' as const,
        status: 'pending' as const
      });
    });
  }
  
  // Check for strategic_recommendations format (which may be nested)
  if (jsonData.strategic_recommendations) {
    if (jsonData.strategic_recommendations.quick_wins && Array.isArray(jsonData.strategic_recommendations.quick_wins)) {
      jsonData.strategic_recommendations.quick_wins.forEach((rec: any, index: number) => {
        insights.push({
          id: `quick_win_${timestamp}_${index}`,
          title: rec.recommendation || `Quick Win ${index + 1}`,
          category: 'strategic_recommendations',
          content: `${rec.recommendation || ''}\n\nTimeframe: ${rec.timeframe || 'Short-term'}\nExpected outcome: ${rec.expected_outcome || ''}`,
          confidence: 90,
          source: 'document' as const,
          status: 'pending' as const
        });
      });
    }
    
    if (jsonData.strategic_recommendations.long_term_initiatives && Array.isArray(jsonData.strategic_recommendations.long_term_initiatives)) {
      jsonData.strategic_recommendations.long_term_initiatives.forEach((rec: any, index: number) => {
        insights.push({
          id: `initiative_${timestamp}_${index}`,
          title: rec.recommendation || `Long-term Initiative ${index + 1}`,
          category: 'strategic_recommendations',
          content: `${rec.recommendation || ''}\n\nTimeframe: ${rec.timeframe || 'Long-term'}\nExpected outcome: ${rec.expected_outcome || ''}`,
          confidence: 85,
          source: 'document' as const,
          status: 'pending' as const
        });
      });
    }
  }
  
  // Check for key_narratives format
  if (jsonData.key_narratives && Array.isArray(jsonData.key_narratives)) {
    jsonData.key_narratives.forEach((narrative: any, index: number) => {
      insights.push({
        id: `narrative_${timestamp}_${index}`,
        title: narrative.narrative || `Key Narrative ${index + 1}`,
        category: 'key_narratives',
        content: `${narrative.narrative || ''}\n\nSupporting evidence: ${narrative.supporting_evidence || ''}\nSlide recommendation: ${narrative.slide_recommendation || ''}`,
        confidence: 85,
        source: 'document' as const,
        status: 'pending' as const
      });
    });
  }
  
  // If we still have no insights, try to just create generic insights from properties
  if (insights.length === 0) {
    Object.entries(jsonData).forEach(([key, value], index) => {
      if (typeof value === 'string' && value.length > 30) {
        insights.push({
          id: `generic_${timestamp}_${index}`,
          title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          category: 'business_imperatives',
          content: value,
          confidence: 70,
          source: 'document' as const,
          status: 'pending' as const
        });
      }
    });
  }
  
  return insights.length > 0 ? insights : [];
}

/**
 * Parse a structured text response from Claude
 */
function parseStructuredTextResponse(responseText: string) {
  // Split by numbered or titled insights
  const insightPattern = /\n\s*(?:Insight\s*#?\s*\d+|Strategic Insight\s*#?\s*\d+|#\d+|INSIGHT\s*\d+)[\s:-]*(.*?)(?=\n\s*(?:Insight\s*#?\s*\d+|Strategic Insight\s*#?\s*\d+|#\d+|INSIGHT\s*\d+)|\n\s*$|$)/gis;
  
  const insights = [];
  let match;
  
  while ((match = insightPattern.exec(responseText)) !== null) {
    const insightText = match[0].trim();
    
    // Extract title, category, and content
    const titleMatch = insightText.match(/^(?:Insight\s*#?\s*\d+|Strategic Insight\s*#?\s*\d+|#\d+|INSIGHT\s*\d+)[\s:-]*(.+?)(?:\n|$)/i);
    const categoryMatch = insightText.match(/Category[\s:-]*([^\n]+)/i);
    
    // Create the insight object
    const insight = {
      id: `insight_${Date.now()}_${insights.length}`,
      title: titleMatch ? titleMatch[1].trim() : `Insight ${insights.length + 1}`,
      category: categoryMatch ? mapCategoryToStandard(categoryMatch[1].trim()) : 'business_imperatives',
      content: insightText,
      confidence: Math.round(0.7 * 100) / 100,
      source: 'document' as const,
      status: 'pending' as const
    };
    
    insights.push(insight);
  }
  
  // If no insights were found with the pattern, split by newlines and create simpler insights
  if (insights.length === 0) {
    const lines = responseText.split('\n\n').filter(line => line.trim().length > 20);
    
    lines.forEach((line, index) => {
      const insight = {
        id: `insight_${Date.now()}_${index}`,
        title: `Insight ${index + 1}`,
        category: 'business_imperatives',
        content: line.trim(),
        confidence: Math.round(0.6 * 100) / 100,
        source: 'document' as const,
        status: 'pending' as const
      };
      
      insights.push(insight);
    });
  }
  
  return insights;
}

/**
 * Map natural language categories to our standard categories
 */
function mapCategoryToStandard(category: string): string {
  const categoryMap: Record<string, string> = {
    'business': 'business_challenges',
    'business challenge': 'business_challenges',
    'business challenges': 'business_challenges',
    'challenge': 'business_challenges',
    'challenges': 'business_challenges',
    
    'audience': 'audience_gaps',
    'audience gap': 'audience_gaps',
    'audience gaps': 'audience_gaps',
    'audience insight': 'audience_gaps',
    'audience opportunity': 'audience_gaps',
    
    'competitive': 'competitive_threats',
    'competitive threat': 'competitive_threats',
    'competitive threats': 'competitive_threats',
    'competition': 'competitive_threats',
    'competitor': 'competitive_threats',
    
    'gaming': 'gaming_opportunities',
    'gaming opportunity': 'gaming_opportunities',
    'gaming opportunities': 'gaming_opportunities',
    'opportunity': 'gaming_opportunities',
    'opportunities': 'gaming_opportunities',
    
    'strategic': 'strategic_recommendations',
    'strategy': 'strategic_recommendations',
    'strategic recommendation': 'strategic_recommendations',
    'strategic recommendations': 'strategic_recommendations',
    'recommendation': 'strategic_recommendations',
    'recommendations': 'strategic_recommendations',
    
    'narrative': 'key_narratives',
    'narratives': 'key_narratives',
    'key narrative': 'key_narratives',
    'key narratives': 'key_narratives',
    'story': 'key_narratives',
  };
  
  // Check for partial matches to handle variations
  const lowerCategory = category.toLowerCase();
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerCategory.includes(key)) {
      return value;
    }
  }
  
  // Default category
  return 'business_imperatives';
}
