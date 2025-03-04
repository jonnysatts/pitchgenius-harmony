
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase.functions.invoke('analyze-website-with-anthropic', {
      body: { 
        website_url: body.website_url,
        check_progress: true
      }
    });
    
    if (error) {
      console.error('Progress check error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to check analysis progress' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      progress: data.progress || 0,
      status: data.status || 'checking' 
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
