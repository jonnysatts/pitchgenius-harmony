
import { corsHeaders } from '../utils/corsHandlers.ts';
import { extractWebsiteContent } from './websiteContentService.ts';
import { analyzeWebsiteWithAnthropic } from './anthropicService.ts';
import { generateFallbackInsights } from './fallbackGenerator.ts';

/**
 * Processes the extracted content and sends it to Claude for analysis
 */
export async function processWebsiteContent(
  website_url: string, 
  system_prompt: string, 
  client_name: string,
  client_industry: string,
  use_firecrawl: boolean
): Promise<Response> {
  try {
    // Extract website content using the appropriate service
    console.log(`Attempting to extract content from website: ${website_url}`);
    const websiteContent = await extractWebsiteContent(website_url, use_firecrawl);
    
    if (!websiteContent || websiteContent.length < 100) {
      console.warn(`Insufficient content extracted: ${websiteContent.length} characters`);
      
      // Generate fallback insights instead of failing completely
      const fallbackResponse = {
        success: false,
        error: `Failed to extract sufficient content from website: ${website_url}`,
        insufficientContent: true,
        insights: generateFallbackInsights(client_industry),
        usingFallback: true,
        timestamp: new Date().toISOString()
      };
      
      console.log('Returning fallback insights due to insufficient content');
      return new Response(JSON.stringify(fallbackResponse), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    console.log(`Successfully extracted ${websiteContent.length} characters from website`);
    
    // Analyze the website with Claude
    console.log('Sending content to Claude API for analysis');
    const result = await analyzeWebsiteWithAnthropic(
      websiteContent,
      system_prompt, 
      client_name,
      client_industry
    );
    
    console.log('Claude analysis completed successfully');
    
    // Parse the result to ensure it's valid JSON
    try {
      const resultObj = JSON.parse(result);
      
      // Make sure insights exist and are an array
      if (!resultObj.insights || !Array.isArray(resultObj.insights) || resultObj.insights.length === 0) {
        console.warn('No insights returned from Claude API, using fallbacks');
        resultObj.insights = generateFallbackInsights(client_industry);
        resultObj.usingFallback = true;
        resultObj.success = true;
        resultObj.insufficientContent = false;
        
        // Return the modified result
        return new Response(JSON.stringify(resultObj), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      
      // Ensure insights have source field
      resultObj.insights = resultObj.insights.map((insight: any) => {
        return {
          ...insight,
          source: 'website'
        };
      });
      
      // Return the validated result
      return new Response(JSON.stringify(resultObj), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    } catch (parseError) {
      console.error('Error parsing Claude API result:', parseError);
      
      // Fallback to returning the raw result
      return new Response(result, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (extractionError) {
    throw extractionError;
  }
}
