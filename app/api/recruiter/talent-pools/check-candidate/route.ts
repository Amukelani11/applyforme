import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recruiter ID
    const { data: recruiter } = await supabase
      .from('recruiters')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 });
    }

    // Get email from query params
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    // Check if candidate exists in any of the recruiter's pools
    const { data: pools, error } = await supabase
      .from('talent_pool_members')
      .select(`
        id,
        pool_id,
        candidate_name,
        candidate_email,
        added_notes,
        created_at,
        talent_pools!inner(
          id,
          name,
          color,
          description
        )
      `)
      .eq('candidate_email', email)
      .eq('talent_pools.recruiter_id', recruiter.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error checking candidate pools:', error);
      return NextResponse.json({ error: 'Failed to check candidate pools' }, { status: 500 });
    }

    return NextResponse.json({ 
      pools: pools || [],
      count: pools?.length || 0
    });

  } catch (error: any) {
    console.error('Error checking candidate pools:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 