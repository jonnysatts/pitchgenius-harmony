
/**
 * Configuration and environment checks for AI services
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
      toast({
        title: "Connection Error",
        description: `Could not reach Supabase: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
      return false;
    }
    
    // Log the complete response for debugging
    console.log('Connection test full response:', JSON.stringify(data));
    
    // Check specifically for the Anthropic API key
    const anthropicKeyExists = data?.environmentChecks?.ANTHROPIC_API_KEY?.exists;
    
    if (!anthropicKeyExists) {
      console.error('ANTHROPIC_API_KEY not found in Supabase secrets');
      toast({
        title: "Missing API Key",
        description: "ANTHROPIC_API_KEY not found in Supabase secrets. Please add it to use Claude AI features.",
        variant: "destructive",
        duration: 7000,
      });
      return false;
    }
    
    // Show success message
    toast({
      title: "Connection Verified",
      description: "Successfully connected to Supabase and verified Anthropic API key",
      duration: 3000,
    });
    
    return true;
  } catch (err) {
    console.error('Error calling test-connection function:', err);
    console.error('Error stack:', err instanceof Error ? err.stack : 'No stack available');
    toast({
      title: "Connection Error",
      description: `Failed to check Supabase connection: ${err instanceof Error ? err.message : String(err)}`,
      variant: "destructive",
      duration: 5000,
    });
    return false;
  }
};

/**
 * Verify Anthropic API key exists and shows appropriate notifications
 */
export const verifyAnthropicApiKey = async (): Promise<boolean> => {
  try {
    // Direct check for the ANTHROPIC_API_KEY
    const { data, error } = await supabase.functions.invoke('test-connection', {
      body: { 
        timestamp: new Date().toISOString(),
        testType: 'anthropic-key-check'
      }
    });
    
    if (error) {
      console.error('Error verifying Anthropic API key:', error);
      toast({
        title: "Connection Error",
        description: `Could not verify Anthropic API key: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
      return false;
    }
    
    const anthropicKeyExists = data?.anthropicKeyExists === true;
    
    if (!anthropicKeyExists) {
      toast({
        title: "Missing API Key",
        description: "ANTHROPIC_API_KEY not found in Supabase secrets. Claude AI features will not work.",
        variant: "destructive",
        duration: 7000,
      });
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error verifying Anthropic API key:', err);
    return false;
  }
};
