
/**
 * Configuration settings and environment checking for AI services
 */
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if we can connect to Supabase and verify access to ANTHROPIC_API_KEY
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('test-connection', {
      method: 'POST',
      body: { test: true, timestamp: new Date().toISOString() },
    });
    
    if (error) {
      console.error('Error testing Supabase connection:', error);
      return false;
    }
    
    // Check if ANTHROPIC_API_KEY is available
    const anthropicKeyExists = data?.environmentChecks?.ANTHROPIC_API_KEY?.exists;
    
    if (!anthropicKeyExists) {
      console.warn('ANTHROPIC_API_KEY not found in Supabase secrets');
    }
    
    return !!anthropicKeyExists;
  } catch (error) {
    console.error('Exception testing Supabase connection:', error);
    return false;
  }
};
