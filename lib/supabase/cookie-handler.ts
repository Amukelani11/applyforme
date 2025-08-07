import { cookies } from 'next/headers'

export function createCookieHandler() {
  return {
    async get(name: string) {
      try {
        const cookieStore = await cookies()
        const cookie = cookieStore.get(name)
        if (!cookie?.value) return undefined
        
        // Return cookie value as-is; Supabase expects base64 values unchanged
        return cookie.value
      } catch (error) {
        // Only return undefined for specific errors, not for all production cases
        if (error instanceof Error && error.message?.includes('Dynamic server usage')) {
          return undefined
        }
        console.error('Error getting cookie:', name, error)
        return undefined
      }
    },
    async set(name: string, value: string, options: any) {
      try {
        const cookieStore = await cookies()
        
        // Ensure proper cookie options for production
        const cookieOptions = {
          ...options,
          // Ensure cookies work in production with proper security settings
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          httpOnly: true,
          path: '/'
        }
        
        cookieStore.set(name, value, cookieOptions)
      } catch (error) {
        // Only ignore specific errors, not all production cases
        if (error instanceof Error && error.message?.includes('Dynamic server usage')) {
          return
        }
        console.error('Error setting cookie:', name, error)
      }
    },
    async remove(name: string, options: any) {
      try {
        const cookieStore = await cookies()
        cookieStore.set(name, "", { ...options, maxAge: 0 })
      } catch (error) {
        console.error('Error removing cookie:', name, error)
      }
    },
    async getAll() {
      try {
        const cookieStore = await cookies()
        const allCookies = cookieStore.getAll()

        // Keep every cookie except ones that are empty or the literal string "undefined"
        const validCookies = allCookies.filter(
          (cookie) => cookie.value && cookie.value !== 'undefined'
        )

        return validCookies
      } catch (error) {
        // Only return empty array for specific errors, not all production cases
        if (error instanceof Error && error.message?.includes('Dynamic server usage')) {
          return []
        }
        console.error('Error getting cookies:', error)
        return []
      }
    },
    async setAll(cookiesToSet: any[]) {
      try {
        // Check if we're in a context where cookies can be set
        if (typeof window !== 'undefined') {
          // We're on the client side, cookies should be handled by the browser client
          return
        }
        
        const cookieStore = await cookies()
        cookiesToSet.forEach((cookie) => {
          try {
            cookieStore.set(cookie)
          } catch (cookieError) {
            // Only log the error if it's not the expected "Server Action or Route Handler" error
            if (cookieError instanceof Error && !cookieError.message?.includes('Server Action or Route Handler')) {
              console.error('Error setting individual cookie:', cookieError)
            }
          }
        })
      } catch (error) {
        // The `setAll` method was called from a Server Component.
        // This can be ignored if you have middleware refreshing
        // user sessions.
        if (error instanceof Error && !error.message?.includes('Server Action or Route Handler')) {
          console.error('Error setting cookies:', error)
        }
      }
    }
  }
} 