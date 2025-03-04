
import { supabase } from "@/integrations/supabase/client";

/**
 * Check Supabase connection and if Anthropic API key exists
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Checking Supabase connection and API keys...');
    const { data, error } = await supabase.functions.invoke('test-connection', {
      body: { 
        testType: 'anthropic-key-check',
        timestamp: new Date().toISOString(),
        debugMode: true
      }
    });
    
    if (error) {
      console.error('Error checking Supabase connection:', error);
      return false;
    }
    
    // Check if the API key exists in the response
    const anthropicKeyExists = data?.anthropicKeyExists === true;
    console.log(`Anthropic API key ${anthropicKeyExists ? 'exists' : 'does not exist'}`);
    
    return anthropicKeyExists;
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    return false;
  }
};
