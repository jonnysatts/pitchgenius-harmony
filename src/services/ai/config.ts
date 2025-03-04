
/**
 * Configuration and environment checks for AI services
 */
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if we have a connection to Supabase with necessary API keys
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Checking Supabase connection and API keys');
    
    // Add more detailed logging of the request
    console.log('Invoking test-connection function with timestamp:', new Date().toISOString());
    
    const { data, error } = await supabase.functions.invoke('test-connection', {
      body: { 
        timestamp: new Date().toISOString(),
        testType: 'api-key-check'
      }
    });
    
    if (error) {
      console.error('Error checking connection:', error);
      console.error('Error details:', JSON.stringify(error));
      return false;
    }
    
    // Log the complete response for debugging
    console.log('Connection test full response:', JSON.stringify(data));
    
    // Check specifically for the Anthropic API key
    const anthropicKeyExists = data?.environmentChecks?.ANTHROPIC_API_KEY?.exists;
    
    if (!anthropicKeyExists) {
      console.error('ANTHROPIC_API_KEY not found in Supabase secrets');
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error calling test-connection function:', err);
    console.error('Error stack:', err.stack);
    return false;
  }
};
