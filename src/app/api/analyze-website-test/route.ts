
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
      body: { 
        ...body,
        test_mode: true 
      }
    });
    
    if (error) {
      console.error('Edge function test error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to test website analysis function' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
