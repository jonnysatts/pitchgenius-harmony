
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Call the Supabase Edge Function with a timeout
    const controller = new AbortController();
    const timeoutSeconds = body.timeout_seconds || 70;
    const timeoutId = setTimeout(() => controller.abort(), timeoutSeconds * 1000);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
        body: {
          website_url: body.website_url,
          client_name: body.client_name,
          client_industry: body.client_industry,
          max_pages: body.max_pages || 10
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('Edge function error:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to analyze website' }, 
          { status: 500 }
        );
      }
      
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('Analysis request timed out after', timeoutSeconds, 'seconds');
        return NextResponse.json(
          { error: `Analysis timed out after ${timeoutSeconds} seconds` }, 
          { status: 504 }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
