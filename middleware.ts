import { createClient } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Skip middleware for static assets and API routes
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    req.nextUrl.pathname.startsWith('/static') ||
    req.nextUrl.pathname.includes('.') ||
    req.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  console.log('🔒 MIDDLEWARE TRIGGERED:', req.nextUrl.pathname)
  
  const { supabase, response } = createClient(req)

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  const { data: { user } } = await supabase.auth.getUser()

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/pricing',
    '/privacy',
    '/terms',
    '/signup',
    '/login',
    '/jobs',
    '/submit-job'
  ]

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route + '/')
  )

  // If it's a public route, allow access
  if (isPublicRoute) {
    return response
  }

  // Handle recruiter routes
  if (req.nextUrl.pathname.startsWith('/recruiter')) {
    // Allow public access to recruiter landing page, login and register pages
    if (req.nextUrl.pathname === '/recruiter' || 
        req.nextUrl.pathname === '/recruiter/login' || 
        req.nextUrl.pathname === '/recruiter/register') {
      // Only redirect to dashboard if user is logged in AND trying to access login
      if (user && req.nextUrl.pathname === '/recruiter/login') {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/recruiter/dashboard'
        return NextResponse.redirect(redirectUrl)
      }
      return response
    }

    // For other recruiter routes, require authentication
    if (!user) {
      console.log('No session, redirecting to recruiter login')
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/recruiter/login'
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user is a recruiter
    const { data: userData } = await supabase
      .from('users')
      .select('is_recruiter')
      .eq('id', user.id)
      .single()

    if (!userData?.is_recruiter) {
      return new NextResponse('Access denied. Recruiters only.', { status: 403 })
    }
  }

  // Handle admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    console.log('🔒 Checking admin access for path:', req.nextUrl.pathname)
    
    if (!user) {
      console.log('No session user found')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    console.log('User ID:', user.id)

    // Fetch the user's admin status
    const { data: userData, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    console.log('User data:', userData)
    console.log('Error if any:', error)

    if (error) {
      console.error('Error fetching user data:', error)
      return new NextResponse('Error checking admin status', { status: 500 })
    }

    if (!userData?.is_admin) {
      console.log('User is not an admin')
      return new NextResponse('Access denied. Admins only.', { status: 403 })
    }

    console.log('Admin access granted')
  }

  // Handle protected routes (require authentication)
  const protectedRoutes = [
    '/dashboard',
    '/onboarding',
    '/checkout',
    '/cv-review',
    '/apply'
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    console.log('Protected route accessed without session, redirecting to login')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and trying to access login pages, redirect to dashboard
  if (user && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/login')) {
    console.log('User signed in, checking role for redirection');
    const { data: userData } = await supabase
      .from('users')
      .select('is_recruiter')
      .eq('id', user.id)
      .single();

    const redirectUrl = req.nextUrl.clone();
    if (userData?.is_recruiter) {
      redirectUrl.pathname = '/recruiter/dashboard';
    } else {
      redirectUrl.pathname = '/dashboard';
    }
    console.log(`Redirecting to ${redirectUrl.pathname}`);
    return NextResponse.redirect(redirectUrl);
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - jobs/public/apply (public job application forms with file uploads)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|jobs/public/apply).*)',
  ],
} 