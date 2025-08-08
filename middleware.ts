import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.searchParams.get('mcp-edit-mode') === 'true') {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Proactively clear malformed cookies
  const clearMalformedCookies = () => {
    try {
      const allCookies = request.cookies.getAll()
      const malformedCookies = allCookies.filter(cookie => 
        // Only remove obviously invalid placeholder cookies (empty or "undefined")
        !cookie.value || cookie.value === 'undefined'
      )
      
      if (malformedCookies.length > 0) {
        console.log(`Clearing ${malformedCookies.length} malformed cookies:`, 
          malformedCookies.map(c => c.name).join(', '))
        
        malformedCookies.forEach(cookie => {
          response.cookies.delete(cookie.name)
        })
      }
    } catch (error) {
      console.error('Error clearing malformed cookies:', error)
    }
  }

  // Clear malformed cookies before processing
  clearMalformedCookies()

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            try {
              const cookie = request.cookies.get(name)
              if (!cookie?.value) return undefined
              
              // Return cookie value as-is; Supabase expects base64 values unchanged
              
              return cookie.value
            } catch (error) {
              console.error('Error getting cookie:', name, error)
              return undefined
            }
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              // Ensure proper cookie options for production
              const cookieOptions = {
                ...options,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const,
                httpOnly: true,
                path: '/'
              }
              
              request.cookies.set({ name, value, ...cookieOptions })
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              response.cookies.set({ name, value, ...cookieOptions })
            } catch (error) {
              console.error('Error setting cookie:', name, error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              request.cookies.set({ name, value: '', ...options })
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              response.cookies.set({ name, value: '', ...options })
            } catch (error) {
              console.error('Error removing cookie:', name, error)
            }
          },
        },
      }
    )

    const { pathname } = request.nextUrl
    
    // Always allow team invite acceptance pages without redirects
    if (pathname.startsWith('/team/invite/')) {
      return response
    }
    const isRecruiterPath = pathname.startsWith('/recruiter')

      let user: any = null
  let userData: any = null

    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Auth error:', error)
        // Only clear cookies for specific auth errors, not for missing sessions
        if (error.message && !error.message.includes('Auth session missing')) {
          // Clear ALL potentially corrupted Supabase cookies
          response.cookies.delete('sb-access-token')
          response.cookies.delete('sb-refresh-token')
          response.cookies.delete('supabase-auth-token')
          response.cookies.delete('sb-lkwtmfhxdjbwwjecghda-auth-token')
          response.cookies.delete('sb-lkwtmfhxdjbwwjecghda-auth-token.0')
          response.cookies.delete('sb-lkwtmfhxdjbwwjecghda-auth-token.1')
          response.cookies.delete('sb-lkwtmfhxdjbwwjecghda-auth-token.2')
        }
      } else {
        user = data.user
        console.log('Middleware: User authenticated:', user?.id)
      }
    } catch (error) {
      console.error('Error getting user:', error)
      // Only clear cookies for specific errors, not for missing sessions
      if (error instanceof Error && !error.message.includes('Auth session missing')) {
        // Clear ALL potentially corrupted Supabase cookies
        response.cookies.delete('sb-access-token')
        response.cookies.delete('sb-refresh-token')
        response.cookies.delete('supabase-auth-token')
        response.cookies.delete('sb-lkwtmfhxdjbwwjecghda-auth-token')
        response.cookies.delete('sb-lkwtmfhxdjbwwjecghda-auth-token.0')
        response.cookies.delete('sb-lkwtmfhxdjbwwjecghda-auth-token.1')
        response.cookies.delete('sb-lkwtmfhxdjbwwjecghda-auth-token.2')
      }
    }

    // Handle unauthenticated users
    if (!user) {
      // Allow access to public recruiter pages without authentication
      const publicRecruiterPaths = [
        '/recruiter',
        '/recruiter/login', 
        '/recruiter/register', 
        '/recruiter/free-trial',
        '/recruiter/trial-success'
      ]
      
      if (isRecruiterPath && !publicRecruiterPaths.includes(pathname)) {
        // Only redirect to login for protected recruiter pages
        return NextResponse.redirect(new URL('/recruiter/login', request.url))
      }
      
      // Add other non-recruiter protected paths here if needed, redirecting to /login
      return response
    }

    // Handle authenticated users
    try {
      const { data } = await supabase
      .from('users')
        .select('is_recruiter, onboarding_completed, subscription_status, is_admin')
      .eq('id', user.id)
      .single()

      userData = data
    } catch (error) {
      console.error('Error fetching user data:', error)
    }

    const isRecruiter = userData?.is_recruiter ?? false
    
    if (isRecruiter) {
      // If a recruiter is on a non-recruiter path, redirect them away
      if (!isRecruiterPath && pathname !== '/dashboard') { // allow access to a general dashboard if needed
         // for now, let's just let them be. A better behavior might be needed.
      }
      // If a recruiter is on login/register, send to their dashboard
      if (pathname === '/recruiter/login' || pathname === '/recruiter/register') {
        return NextResponse.redirect(new URL('/recruiter/dashboard', request.url))
      }
    } else {
      // This is a regular user
      const onboardingCompleted = userData?.onboarding_completed ?? false
      const subscriptionStatus = userData?.subscription_status

      // If a regular user tries to access a recruiter path, send them to their dashboard
      if (isRecruiterPath && pathname !== '/recruiter') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
  }

      // If a logged-in user is on the main login/signup, send to their dashboard
      if (pathname === '/login' || pathname === '/signup') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // Check for onboarding if they are not a premium user
      if (
        !onboardingCompleted &&
        pathname !== '/onboarding' &&
        subscriptionStatus !== 'premium' &&
        subscriptionStatus !== 'active'
      ) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Return response without any authentication checks if there's a critical error
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|jobs/public).*)',
  ],
} 