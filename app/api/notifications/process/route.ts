import { NextRequest, NextResponse } from 'next/server'
import { NotificationProcessor } from '@/lib/notification-processor'

export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorized (you can add your own auth logic here)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    // Add your token verification logic here
    
    // Process pending notifications
    await NotificationProcessor.processPendingNotifications()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notifications processed successfully' 
    })
  } catch (error) {
    console.error('Error processing notifications:', error)
    return NextResponse.json(
      { error: 'Failed to process notifications' },
      { status: 500 }
    )
  }
}

// GET endpoint to check notification status
export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: pendingCount } = await supabase
      .from('email_logs')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')

    const { data: recentLogs } = await supabase
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      pending_count: pendingCount?.length || 0,
      recent_logs: recentLogs || []
    })
  } catch (error) {
    console.error('Error fetching notification status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification status' },
      { status: 500 }
    )
  }
} 