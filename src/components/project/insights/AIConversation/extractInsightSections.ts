
/**
 * Helper function to extract structured content from free-form text
 */
export const extractInsightSections = (text: string, currentContent: Record<string, any>) => {
  const updates: Record<string, any> = {};
  
  // Look for common section headers in AI responses
  const titleMatch = text.match(/Title:(.+?)(?=Summary:|Details:|Evidence:|Impact:|Recommendations:|$)/is);
  if (titleMatch && titleMatch[1]?.trim()) {
    updates.title = titleMatch[1].trim();
  }
  
  const summaryMatch = text.match(/Summary:(.+?)(?=Details:|Evidence:|Impact:|Recommendations:|$)/is);
  if (summaryMatch && summaryMatch[1]?.trim()) {
    updates.summary = summaryMatch[1].trim();
  }
  
  const detailsMatch = text.match(/Details:(.+?)(?=Evidence:|Impact:|Recommendations:|$)/is);
  if (detailsMatch && detailsMatch[1]?.trim()) {
    updates.details = detailsMatch[1].trim();
  }
  
  const evidenceMatch = text.match(/Evidence:(.+?)(?=Impact:|Recommendations:|$)/is);
  if (evidenceMatch && evidenceMatch[1]?.trim()) {
    updates.evidence = evidenceMatch[1].trim();
  }
  
  const impactMatch = text.match(/Impact:(.+?)(?=Recommendations:|$)/is);
  if (impactMatch && impactMatch[1]?.trim()) {
    updates.impact = impactMatch[1].trim();
  }
  
  const recommendationsMatch = text.match(/Recommendations:(.+?)$/is);
  if (recommendationsMatch && recommendationsMatch[1]?.trim()) {
    updates.recommendations = recommendationsMatch[1].trim();
  }
  
  return updates;
};
