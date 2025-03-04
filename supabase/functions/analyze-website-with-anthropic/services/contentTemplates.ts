/**
 * Templates and examples used in Claude prompts
 */

interface Content {
  title: string;
  summary: string;
  details: string;
  recommendations: string;
}

interface Insight {
  id: string;
  category: string;
  confidence: number;
  needsReview: boolean;
  content: Content;
}

/**
 * Generate the structured output format for Claude
 */
export function generateOutputFormat(): string {
  return `
    Structure your response as a JSON array with exactly one high-value insight for each of these categories:
    
    [
      {
        "id": "business-imperative-[unique-id]",
        "category": "business_imperatives",
        "confidence": [60-95],
        "needsReview": [true/false],
        "content": {
          "title": "Specific, compelling business challenge title",
          "summary": "Concise explanation with specific metrics or opportunities",
          "details": "Business context with evidence from website and market knowledge",
          "recommendations": "How Games Age could address this through gaming audience strategy"
        }
      },
      {
        "id": "audience-opportunity-[unique-id]",
        "category": "gaming_audience_opportunity",
        "confidence": [60-95],
        "needsReview": [true/false],
        "content": {
          "title": "Specific gaming audience opportunity title",
          "summary": "Clear opportunity statement with demographic specifics",
          "details": "Gaming audience insights relevant to this client",
          "recommendations": "Specific approach to engage these gaming audiences"
        }
      },
      {
        "id": "activation-pathway-[unique-id]",
        "category": "strategic_activation_pathways",
        "confidence": [60-95],
        "needsReview": [true/false],
        "content": {
          "title": "Specific activation strategy title",
          "summary": "Clear activation concept with expected business impact",
          "details": "How this would work in practice with timeline and approach",
          "recommendations": "Specific activation with projected outcomes"
        }
      }
    ]
    
    IMPORTANT:
    - Avoid generic gaming insights - be specific to the client's business needs
    - Ground recommendations in real Games Age capabilities (venues, events, content, partnerships)
    - Focus on business value rather than technology hype
    - Connect gaming culture authentically to the client's industry
    - Make recommendations practical, scalable, and measurable
    - Identify specific gaming communities, platforms or trends that align with their brand
    
    If a website has minimal content, still provide strategic insights based on industry knowledge and available information.
  `;
}

/**
 * Provide high-quality examples to set the standard for output
 */
export function getHighQualityExamples(): string {
  return `
EXAMPLES OF HIGH-QUALITY GAMES AGE INSIGHTS:

BUSINESS IMPERATIVE EXAMPLE:
{
  "id": "business-imperative-gen-z-audience-gap",
  "category": "business_imperatives",
  "confidence": 87,
  "needsReview": false,
  "content": {
    "title": "58% Gen Z Brand Awareness Gap Despite 70% Product Relevance",
    "summary": "Website analytics and content focus reveal the brand primarily targets 35-55 age demographic despite their products having high relevance for 16-24 year olds.",
    "details": "Analysis shows their primary marketing channels (LinkedIn, traditional media) and website messaging (professional focus, corporate language) create a significant disconnection with younger audiences.",
    "recommendations": "Games Age can bridge this demographic gap through a strategic gaming audience program targeting the 2.8M Australian Gen Z gamers who align with the brand's innovation positioning."
  }
}

GAMING AUDIENCE OPPORTUNITY EXAMPLE:
{
  "id": "audience-opportunity-casual-mobile",
  "category": "gaming_audience_opportunity",
  "confidence": 82,
  "needsReview": false,
  "content": {
    "title": "Mobile-First Casual Gaming Audience Alignment with Product Experience Goals",
    "summary": "The brand's focus on simplifying complex experiences perfectly aligns with the 5.2M Australian casual mobile gamers who value accessibility and frictionless experiences.",
    "details": "The website's emphasis on streamlining complex processes (evident in product pages and UX) shares core values with casual mobile gaming audiences who represent 68% of all Australian gamers.",
    "recommendations": "Partner with Games Age to create a casual mobile gaming activation strategy that positions the brand as the 'complexity reducer' in both everyday life and gaming experiences."
  }
}

STRATEGIC ACTIVATION PATHWAY EXAMPLE:
{
  "id": "activation-pathway-experiential",
  "category": "strategic_activation_pathways",
  "confidence": 89,
  "needsReview": false,
  "content": {
    "title": "Australian GP Gaming Zone Integration with Product Experience Center",
    "summary": "Create a branded racing simulation experience at the Australian GP that showcases products while engaging 45,000+ racing and gaming enthusiasts over the race weekend.",
    "details": "Based on the website's event calendar and sponsorship history, the brand already invests in traditional sports marketing but misses the gaming crossover opportunity. Working with Games Age, they can create a unique engagement at the intersection of sports and gaming.",
    "recommendations": "Games Age would design and execute a Formula 1 simulation activation space allowing attendees to experience virtual racing while naturally engaging with brand products, generating both interest and leads."
  }
}
  `;
}

/**
 * Get industry-specific gaming context to enhance prompts
 * @param industry - The industry to get context for
 */
export function getIndustryGamingContext(industry: string): string {
  const contexts: Record<string, string> = {
    retail: `
      In the retail industry, gaming audience strategy typically focuses on:
      - Creating authentic shopping experiences for gaming communities (not just "gamer products")
      - Leveraging gaming culture at key shopping moments (seasonal, back-to-school, etc.)
      - Building community through shared retail/gaming experiences
      - Using Fortress venues and partner network for product discovery experiences
      - Enhancing loyalty programs with gaming-inspired mechanics and rewards
    `,
    finance: `
      In the finance industry, gaming audience strategy typically focuses on:
      - Building financial literacy and confidence through gaming culture connections
      - Creating authentic experiences that make finance more accessible to younger audiences
      - Positioning financial products as enablers of gaming lifestyle and passions
      - Developing community programs that build trust with traditionally skeptical gaming audiences
      - Using Fortress venues for financial workshops and educational events with gaming elements
    `,
    technology: `
      In the technology industry, gaming audience strategy typically focuses on:
      - Demonstrating technology capabilities through gaming experiences (not just sponsorships)
      - Building developer and creator relationships within gaming communities
      - Creating showcase opportunities at gaming events and Fortress venues
      - Developing content strategies that authentically connect with gaming audiences
      - Positioning technology as an enabler of gaming culture, not just a product
    `,
    entertainment: `
      In the entertainment industry, gaming audience strategy typically focuses on:
      - Creating transmedia storytelling opportunities across entertainment and gaming
      - Building fan communities that engage through both traditional and gaming channels
      - Developing IP extension strategies into gaming formats and experiences
      - Hosting premiere and fan events at Fortress venues
      - Creating content cross-pollination between entertainment properties and gaming culture
    `
  };

  return contexts[industry.toLowerCase()] || `
    For the ${industry} industry, gaming audience strategy typically focuses on:
    - Identifying authentic connection points between ${industry} and gaming audiences
    - Building credibility through partnerships and activations that respect gaming culture
    - Creating experiences that add value to both gaming audiences and ${industry} objectives
    - Developing content strategies that resonate with gaming communities
    - Using Fortress venues and partner network to create physical/digital engagement opportunities
  `;
}
