import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...'
    }
    
    // Try to get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Try to get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Get all cookies
    const cookies = request.cookies.getAll()
    const supabaseCookies = cookies.filter(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('sb-') ||
      cookie.name.includes('auth')
    )
    
    return NextResponse.json({
      environment: envCheck,
      authentication: {
        user: user ? { id: user.id, email: user.email } : null,
        session: session ? { userId: session.user.id } : null,
        authError: authError?.message || null,
        sessionError: sessionError?.message || null
      },
      cookies: {
        total: cookies.length,
        supabaseCookies: supabaseCookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' }))
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
