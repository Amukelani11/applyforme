import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { AIAnalysisService } from '@/lib/ai-analysis'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const targetUserId = searchParams.get('userId') // For admin requests

    console.log('AI Analysis API called:', { action, targetUserId, currentUserId: user.id })

    // Determine which user to analyze
    let userId = user.id
    if (targetUserId) {
      // Check if current user is admin
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error checking admin status:', userError)
        return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 })
      }

      if (!currentUser?.is_admin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
      
      userId = targetUserId
      console.log('Admin request for user:', userId)
    }

    if (action === 'qualifications') {
      try {
        // Get user qualification summary
        const summary = await AIAnalysisService.analyzeUserQualifications(userId)
        console.log('AI analysis completed successfully for user:', userId)
        return NextResponse.json({ summary })
      } catch (analysisError) {
        console.error('Error in AI analysis:', analysisError)
        return NextResponse.json(
          { error: `AI analysis failed: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}` },
          { status: 500 }
        )
      }
    } else if (action === 'recommendations') {
      try {
        // Get job recommendations
        const limit = parseInt(searchParams.get('limit') || '10')
        const recommendations = await AIAnalysisService.getJobRecommendations(userId, limit)
        return NextResponse.json({ recommendations })
      } catch (recommendationError) {
        console.error('Error in job recommendations:', recommendationError)
        return NextResponse.json(
          { error: `Job recommendations failed: ${recommendationError instanceof Error ? recommendationError.message : 'Unknown error'}` },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('AI Analysis API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Submit job application
    const success = await AIAnalysisService.submitJobApplication(user.id, jobId)
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Application submitted successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
    }

  } catch (error) {
    console.error('Job Application API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
