
/**
 * Generation of strategic insights using AI
 */
import { supabase } from "@/integrations/supabase/client";
import { Document, StrategicInsight, Project } from "@/lib/types";
import { checkSupabaseConnection } from "./config";
import { generateComprehensiveInsights } from "./mockGenerator";

// Gaming industry specialist prompt to guide the AI
const GAMING_SPECIALIST_PROMPT = `You are the world's leading marketing strategist, specializing in the gaming industry and entertainment-driven brand activations. You work exclusively for **Games Age**, the strategic gaming division of **Fortress**, the largest gaming and esports entertainment complex in the Southern Hemisphere.

## 🎯 Your Expertise:
You have over **15 years of experience** in **gaming, esports, and interactive entertainment marketing**, having successfully designed and executed **high-impact brand campaigns** for **Fortune 500 companies** across retail, finance, technology, and entertainment. You are regarded as a **visionary thinker**, blending **data-driven insights** with **creative storytelling** to craft campaigns that not only capture attention but also **drive real business impact**.

## 🏆 Your Mission:
Your goal is to help **Games Age** craft **strategic, high-converting presentations** that articulate **the value of gaming as a marketing channel**. You must identify **business opportunities** that align with gaming culture, optimize **brand engagement strategies**, and position Fortress as a **must-have partner** for brands looking to enter the gaming space.

## 🏰 Fortress & Games Age: Who We Are
- **Fortress** is the **largest gaming and esports venue in the Southern Hemisphere**, offering **state-of-the-art gaming lounges, esports arenas, and immersive brand experiences.**
- **Games Age** is the **strategic consulting arm** of Fortress, providing **brands, publishers, and agencies** with insights on **how to authentically integrate into gaming culture**.

## 🎮 The Games Age Strategic Framework:
Your **recommendations** should always align with **Games Age's core principles**:

1️⃣ **Authentic Integration** – Brands must **add value to gaming experiences** rather than disrupt them. Your strategies must enhance, not exploit, gaming culture.

2️⃣ **Physical-Digital Fusion** – Fortress bridges **real-world activations** with **digital and esports ecosystems**. Your strategies must leverage **both live and online experiences.**

3️⃣ **Community-First Thinking** – The gaming audience is **relationship-driven**. Your strategies should focus on **building long-term brand affinity** rather than short-term campaigns.

## 🔍 How You Analyze & Generate Insights:
When analyzing client materials, competitor landscapes, and industry trends, **you prioritize**:
✅ **Revenue impact & business viability** – All strategies must be tied to measurable business growth.  
✅ **Cultural alignment** – All recommendations must align with gaming **behaviors, trends, and psychology**.  
✅ **Competitive differentiation** – Every campaign should position the client as **unique and innovative in gaming**.  
✅ **Long-term engagement** – Avoid one-off activations; instead, build **sustainable brand equity** in gaming.

## 🛠 Your Approach to Client Pitches:
When generating **strategic recommendations** for Games Age presentations, follow this structured approach:

1. **Industry Context:** Provide **relevant gaming market trends** and audience insights specific to the client's industry (e.g., how gaming can help **finance brands** engage Gen Z).
2. **Client Landscape:** Evaluate the client's **current market position**, challenges, and opportunities.
3. **Gaming Audience Insights:** Identify **who their audience is in the gaming ecosystem** (e.g., casual vs. hardcore gamers, content creators, esports fans).
4. **Strategic Solution:** Develop a clear, **data-backed recommendation** that maps **business challenges to gaming solutions**.
5. **Execution Roadmap:** Provide a **step-by-step activation plan**, including **Fortress venue activations**, influencer collaborations, and **branded gaming experiences.**
6. **Proof of Concept:** Showcase successful **case studies** and **data-backed results** from similar activations.

## 📊 Data-Driven Strategy:
Where applicable, integrate:
- **Gaming market trends**
- **Esports audience statistics**
- **ROI projections for gaming activations**
- **Consumer behavior insights** (e.g., how Gen Z engages with brands in gaming)
- **Competitive analysis** (How other brands have successfully leveraged gaming)

## 🔥 Why This Matters:
Your ability to create **high-impact strategic narratives** will define how **Games Age** wins new business and builds its reputation as the **top-tier gaming agency**. Your work will directly contribute to securing **multi-million-dollar partnerships** for Fortress.

You are not just generating slides—you are architecting the future of **how brands enter the gaming ecosystem**.
`;

/**
 * Generate strategic insights by processing documents with AI
 */
export const generateInsights = async (
  project: Project, 
  documents: Document[]
): Promise<{ insights: StrategicInsight[], error?: string }> => {
  try {
    // Process all documents without limiting
    const documentIds = documents.map(doc => doc.id);
    
    console.log(`Processing ${documents.length} documents for project ${project.id}`);
    
    // Extract text content from documents if possible
    // For a demo, we'll create mock content based on the document names and metadata
    const documentContents = documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      // In a real app, this would be the actual content extracted from the documents
      content: `This is ${doc.name}, a ${doc.type} document about ${project.clientIndustry} industry strategies. 
                It contains important information about market trends, customer engagement, and potential 
                gaming opportunities in the ${project.clientIndustry} sector.
                The document highlights challenges with customer retention and engagement,
                especially with younger demographics. Competitors are starting to implement
                gamification strategies that are showing promising results.
                Priority: ${doc.priority || 0}`
    }));

    // Add client website context information if available
    let websiteContext = '';
    if (project.clientWebsite) {
      websiteContext = `
Additional context: The client's website is ${project.clientWebsite}. 
This website may contain relevant information about their brand positioning, products/services, target audience, 
current marketing approaches, and potential opportunities for gaming industry integration. 
Please consider this information when generating insights.`;
    }

    // Check if we're in development mode without Supabase or if Supabase connection failed
    const useRealApi = await checkSupabaseConnection();
    
    if (!useRealApi) {
      console.log('Supabase connection not available, using mock insights generator');
      const mockInsights = generateComprehensiveInsights(project, documents);
      return { 
        insights: mockInsights,
        error: "Using sample insights - no Supabase connection available"
      };
    }
    
    console.log('Using Anthropic API via Supabase Edge Function to generate insights');
    
    // Create a timeout promise - increased from 45 seconds to 120 seconds (2 minutes)
    const timeoutPromise = new Promise<{ insights: StrategicInsight[], error?: string }>((resolve) => {
      setTimeout(() => {
        console.log('API request taking too long, falling back to mock insights');
        const mockInsights = generateComprehensiveInsights(project, documents);
        resolve({ 
          insights: mockInsights, 
          error: "Claude AI timeout - using generated sample insights instead. If you want to try again with Claude AI, please use the Retry Analysis button." 
        });
      }, 120000); // 120 second timeout (2 minutes)
    });
    
    try {
      // Race between the actual API call and the timeout
      return await Promise.race([
        (async () => {
          console.log('Making API call to Supabase Edge Function for Claude analysis...');
          // Call the Supabase Edge Function that uses Anthropic
          const { data, error } = await supabase.functions.invoke('generate-insights-with-anthropic', {
            body: { 
              projectId: project.id, 
              documentIds,
              clientIndustry: project.clientIndustry,
              clientWebsite: project.clientWebsite,
              projectTitle: project.title,
              documentContents,
              processingMode: 'quick', // Use quick mode to reduce processing time
              includeComprehensiveDetails: true,
              maximumResponseTime: 110, // Tell Claude to try to respond within 110 seconds (just under our 2-minute timeout)
              systemPrompt: GAMING_SPECIALIST_PROMPT + websiteContext // Add the gaming specialist prompt with website context
            }
          });
          
          if (error) {
            console.error('Error from Edge Function:', error);
            const errorMessage = error.message || 'Unknown error';
            const statusCode = error.code || 'No status code';
            console.error(`Edge Function error: ${errorMessage} (Status: ${statusCode})`);
            
            console.log('Falling back to mock insights generator due to Edge Function error');
            const mockInsights = generateComprehensiveInsights(project, documents);
            return { 
              insights: mockInsights,
              error: `Claude AI error - using generated sample insights instead. Error: Edge Function returned a non-2xx status code`
            };
          }
          
          // Check if we received valid insights from the API
          if (!data || !data.insights || data.insights.length === 0) {
            console.log('No insights received from API, falling back to mock generator');
            const mockInsights = generateComprehensiveInsights(project, documents);
            return { 
              insights: mockInsights,
              error: "No insights returned from Claude AI - using generated sample insights instead" 
            };
          }
          
          console.log('Successfully received insights from Anthropic:', data);
          return { 
            insights: data.insights || [],
            error: undefined
          };
        })(),
        timeoutPromise
      ]);
    } catch (apiError: any) {
      console.error('Error calling Anthropic API:', apiError);
      const errorDetails = apiError instanceof Error ? apiError.message : JSON.stringify(apiError);
      console.error(`API call error details: ${errorDetails}`);
      
      console.log('Falling back to mock insights generator due to API error');
      const mockInsights = generateComprehensiveInsights(project, documents);
      return { 
        insights: mockInsights,
        error: "Claude AI error - using generated sample insights instead. Error: " + errorDetails
      };
    }
  } catch (err: any) {
    console.error('Error generating insights:', err);
    // Always return mock insights as a fallback
    const mockInsights = generateComprehensiveInsights(project, documents);
    return { 
      insights: mockInsights,
      error: "Using generated sample insights due to an error: " + (err.message || 'An unexpected error occurred while analyzing documents')
    };
  }
};
