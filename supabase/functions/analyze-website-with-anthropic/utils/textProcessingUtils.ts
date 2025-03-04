
/**
 * Utility functions for text processing and cleaning
 */

/**
 * Clean text content by removing any JSON-like fragments or invalid data
 */
export function cleanTextContent(text: string): string {
  if (!text) return '';
  
  // Remove anything that looks like JSON key-value pairs
  let cleaned = text.replace(/"\w+":\s*"[^"]*"/g, "");
  cleaned = cleaned.replace(/"\w+":\s*\{[^}]*\}/g, "");
  cleaned = cleaned.replace(/"\w+":\s*\[[^\]]*\]/g, "");
  
  // Remove number sequences that look like error codes
  cleaned = cleaned.replace(/-?\d{8,}/g, "");
  
  // Clean up JSON syntax markers
  cleaned = cleaned.replace(/[{}\[\]",]/g, "");
  
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  
  // If nothing meaningful is left, return empty string
  if (cleaned.length < 3 || cleaned === "category" || cleaned === "." || cleaned === ":" || cleaned === ": .") {
    return "";
  }
  
  return cleaned;
}

/**
 * Extract a certain number of sentences from text
 */
export function extractSentences(text: string, count: number): string {
  const sentences = text.split(/[.!?](?:\s|$)/).filter(s => s.trim().length > 0);
  return sentences.slice(0, count).join('. ') + (sentences.length > 0 ? '.' : '');
}

/**
 * Format a category ID into a readable name
 */
export function formatCategoryName(category: string): string {
  return category
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
