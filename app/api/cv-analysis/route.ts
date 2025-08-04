import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { CVAnalysisService } from '@/lib/cv-analysis'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient()
    
    // Get authenticated user (optional for public applications)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    const body = await request.json()
    const { fileUrl, jobId, jobTitle } = body

    console.log('CV Analysis API called with:', { fileUrl, jobId, jobTitle })

    if (!fileUrl) {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 })
    }

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Fetch custom fields for this job
    const { data: customFields, error: customFieldsError } = await supabase
      .from('job_custom_fields')
      .select('*')
      .eq('job_posting_id', jobId)
      .order('field_order')

    if (customFieldsError) {
      console.error('Error fetching custom fields:', customFieldsError)
      return NextResponse.json({ error: 'Failed to fetch job custom fields' }, { status: 500 })
    }

    // Analyze CV
    const analysis = await CVAnalysisService.analyzeCV(
      fileUrl, 
      jobTitle || 'Job Position', 
      customFields || [], 
      supabase
    )

    return NextResponse.json({ analysis })

  } catch (error) {
    console.error('CV Analysis API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 