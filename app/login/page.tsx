"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MailIcon, LockIcon, UserIcon } from "lucide-react"
import Link from "next/link"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('Attempting login for:', formData.email)

      // Check if the user is a recruiter
      const { data: recruiter, error: recruiterError } = await supabase
        .from('recruiters')
        .select('email')
        .eq('email', formData.email)
        .single();
      
      if (recruiter) {
        // It's a recruiter, redirect to recruiter login
        setError("You are a recruiter. Redirecting you to the recruiter login...");
        setTimeout(() => {
          router.push('/recruiter/login');
        }, 2000);
        return;
      }

      console.log('Attempting sign in with password...')
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) {
        console.error('Sign in error:', signInError)
        throw signInError
      }

      console.log('Sign in successful, user:', data.user?.id)

      // On successful login, redirect to the dashboard.
      router.push('/dashboard');
    } catch (err: any) {
      console.error("Login error:", err)
      if (err.message.includes("Invalid login credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else if (err.message.includes("Email not confirmed")) {
        setError("Please check your email and confirm your account before signing in.");
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3e8ff] via-[#f8fafc] to-[#e0e7ff] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#c084fc] to-[#a855f7] rounded-full mb-4 shadow-lg">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-lg text-gray-600">Sign in to your account</p>
        </div>

        <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-600">
              Access your dashboard and continue your job search
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address *
                </Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-10 h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                  Password *
                </Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10 h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#c084fc] to-[#a855f7] hover:from-[#a855f7] hover:to-[#9333ea] text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <div className="text-center pt-4 w-full">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#c084fc] hover:text-[#a855f7] font-medium transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#f3e8ff] via-[#f8fafc] to-[#e0e7ff] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
          </div>
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
