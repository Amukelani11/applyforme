import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify this recruiter owns the pool
    const { data: recruiter } = await supabase
      .from('recruiters')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 });
    }

    // Fetch talent pools with member count
    const { data: pools, error } = await supabase
      .from('talent_pools')
      .select(`
        *,
        member_count:talent_pool_members(count)
      `)
      .eq('recruiter_id', recruiter.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching talent pools:', error);
      return NextResponse.json({ error: 'Failed to fetch talent pools' }, { status: 500 });
    }

    // Transform the data to include member count
    const transformedPools = pools.map(pool => ({
      ...pool,
      member_count: pool.member_count?.[0]?.count || 0
    }));

    return NextResponse.json({ pools: transformedPools });

  } catch (error: any) {
    console.error('Error fetching talent pools:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify this recruiter owns the pool
    const { data: recruiter } = await supabase
      .from('recruiters')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, color, is_public } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Pool name is required' }, { status: 400 });
    }

    // Create new talent pool
    const { data: pool, error } = await supabase
      .from('talent_pools')
      .insert({
        recruiter_id: recruiter.id,
        name: name.trim(),
        description: description || null,
        color: color || '#6366f1',
        is_public: is_public || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating talent pool:', error);
      return NextResponse.json({ error: 'Failed to create talent pool' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      pool,
      message: 'Talent pool created successfully'
    });

  } catch (error: any) {
    console.error('Error creating talent pool:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 