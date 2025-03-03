
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
    const { data, error } = await supabase.functions.invoke('test-connection');
    
    if (error) {
      console.error('Error checking connection:', error);
      return false;
    }
    
    // Log the response for debugging
    console.log('Connection test response:', data);
    
    return data && data.allKeysFound && data.keysFound.includes('ANTHROPIC_API_KEY');
  } catch (err) {
    console.error('Error calling test-connection function:', err);
    return false;
  }
};
