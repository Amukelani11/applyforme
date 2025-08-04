import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const { 
      poolId, 
      candidateName, 
      candidateEmail, 
      candidatePhone, 
      candidateLocation,
      applicationId,
      applicationType,
      jobTitle,
      companyName,
      addedNotes 
    } = body;

    // Verify the pool belongs to this recruiter
    const { data: pool, error: poolError } = await supabase
      .from('talent_pools')
      .select('id')
      .eq('id', poolId)
      .eq('recruiter_id', recruiter.id)
      .single();

    if (poolError || !pool) {
      return NextResponse.json({ error: 'Pool not found or unauthorized' }, { status: 404 });
    }

    // Check if candidate already exists in this pool
    const { data: existingMember } = await supabase
      .from('talent_pool_members')
      .select('id')
      .eq('pool_id', poolId)
      .eq('candidate_email', candidateEmail)
      .single();

    if (existingMember) {
      return NextResponse.json({ 
        error: 'Candidate already exists in this pool',
        memberId: existingMember.id 
      }, { status: 409 });
    }

    // Add candidate to pool
    const { data: member, error: insertError } = await supabase
      .from('talent_pool_members')
      .insert({
        pool_id: poolId,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        candidate_phone: candidatePhone || null,
        candidate_location: candidateLocation || null,
        application_id: applicationId || null,
        application_type: applicationType || null,
        job_title: jobTitle || null,
        company_name: companyName || null,
        added_notes: addedNotes || null,
        added_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding member to pool:', insertError);
      return NextResponse.json({ error: 'Failed to add candidate to pool' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      member,
      message: 'Candidate added to talent pool successfully'
    });

  } catch (error: any) {
    console.error('Error adding member to talent pool:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 