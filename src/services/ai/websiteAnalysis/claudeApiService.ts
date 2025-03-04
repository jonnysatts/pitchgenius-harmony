
import { generateWebsiteResearchPrompt } from "../promptUtils";
import { WebsiteInsightCategory, StrategicInsight } from "@/lib/types";
import { v4 as uuidv4 } from 'uuid';

/**
 * Helper function to generate fake Claude API response for website analysis
 */
export function mockClaudeWebsiteAnalysis(
  websiteContent: string,
  websiteUrl: string,
  clientName: string,
  clientIndustry: string
): Promise<StrategicInsight[]> {
  return new Promise((resolve) => {
    // Generate a prompt (only used for completeness, not actually sent to an API in the mock)
    const prompt = generateWebsiteResearchPrompt(websiteUrl, clientName, clientIndustry);
    
    // Here we would normally call Claude API, but we'll create mock insights instead
    setTimeout(() => {
      const insights: StrategicInsight[] = [
        {
          id: uuidv4(),
          category: "business_imperatives",
          confidence: 87,
          needsReview: false,
          source: "website",
          content: {
            title: "58% Gen Z Brand Awareness Gap Despite 70% Product Relevance",
            summary: "Website analytics and content focus reveal the brand primarily targets 35-55 age demographic despite products having high relevance for 16-24 year olds.",
            details: "Analysis shows their primary marketing channels and website messaging create a significant disconnection with Gen Z audiences who represent a $142M untapped market opportunity.",
            recommendations: "Games Age can bridge this demographic gap through a strategic gaming audience program targeting the 2.8M Australian Gen Z gamers."
          }
        },
        {
          id: uuidv4(),
          category: "gaming_audience_opportunity",
          confidence: 82,
          needsReview: false,
          source: "website",
          content: {
            title: "Mobile-First Casual Gaming Audience Alignment with Product Experience",
            summary: "The brand's focus on simplifying complex experiences perfectly aligns with 5.2M Australian casual mobile gamers who value accessibility.",
            details: "The website's emphasis on streamlining complex processes shares core values with casual mobile gaming audiences who represent 68% of all Australian gamers.",
            recommendations: "Partner with Games Age to create a casual mobile gaming activation strategy that positions the brand as the 'complexity reducer'."
          }
        },
        {
          id: uuidv4(),
          category: "strategic_activation_pathways",
          confidence: 89,
          needsReview: false,
          source: "website",
          content: {
            title: "Fortress Melbourne Gaming Zone with Product Experience Center",
            summary: "Create a branded gaming experience at Fortress venues that showcases products while engaging 45,000+ gaming enthusiasts monthly.",
            details: "Based on the website's event calendar and sponsorship history, the brand already invests in traditional marketing but misses the gaming crossover opportunity.",
            recommendations: "Games Age would design and execute a simulation activation space allowing attendees to experience gaming while naturally engaging with brand products."
          }
        }
      ];
      
      resolve(insights);
    }, 3000); // Simulate API delay
  });
}

/**
 * Function that would actually call the Claude API via our Supabase Edge Function
 */
export async function analyzeWebsiteWithAnthropic(
  websiteContent: string,
  websiteUrl: string,
  clientName: string,
  clientIndustry: string
): Promise<StrategicInsight[]> {
  try {
    // For now, just return the mock response
    return await mockClaudeWebsiteAnalysis(websiteContent, websiteUrl, clientName, clientIndustry);
  } catch (error) {
    console.error("Error in Claude API call:", error);
    throw new Error("Failed to analyze website with Claude API");
  }
}
