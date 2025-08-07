import { NextRequest, NextResponse } from 'next/server';
import { startDeepResearch, ResearchActivity } from '@/lib/research/deep-research';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { query, mode = 'quick' }: { query: string; mode?: 'quick' | 'full' } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Create a readable stream for real-time updates
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const activityCallback = (activity: ResearchActivity) => {
          const data = `data: ${JSON.stringify({ type: 'activity', data: activity })}\n\n`;
          controller.enqueue(encoder.encode(data));
        };

        // Start the research process
        startDeepResearch(query, mode, activityCallback)
          .then((result) => {
            // Send the final result
            const data = `data: ${JSON.stringify({ type: 'result', data: result })}\n\n`;
            controller.enqueue(encoder.encode(data));
            
            // Save research to database for history
            saveResearchToDatabase(user.id, query, mode, result).catch(console.error);
            
            // Close the stream
            controller.close();
          })
          .catch((error) => {
            const errorData = `data: ${JSON.stringify({ 
              type: 'error', 
              data: { message: error.message || 'Research failed' } 
            })}\n\n`;
            controller.enqueue(encoder.encode(errorData));
            controller.close();
          });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Deep research API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function saveResearchToDatabase(
  userId: string, 
  query: string, 
  mode: 'quick' | 'full', 
  results: any
) {
  try {
    const supabase = await createClient();
    
    await supabase.from('market_research_history').insert({
      user_id: userId,
      query: query,
      mode: mode,
      results: results,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving research to database:', error);
    // Don't throw error here as it's not critical to the main functionality
  }
}

