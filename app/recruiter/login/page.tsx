"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { BriefcaseIcon, MailIcon, LockIcon } from "lucide-react"

export default function RecruiterLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Attempting recruiter login for:', email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        throw error
      }

      console.log('Sign in successful, checking if user is recruiter...')

      // Check if user is a recruiter
      const { data: recruiterData, error: recruiterError } = await supabase
        .from("recruiters")
        .select("id")
        .eq("user_id", data.user.id)
        .single()

      if (recruiterError || !recruiterData) {
        console.log('User is not a recruiter, signing out...')
        await supabase.auth.signOut()
        throw new Error("This account is not registered as a recruiter")
      }

      console.log('Recruiter login successful')

      toast({
        title: "Success",
        description: "Logged in successfully!",
      })

      router.refresh()
    } catch (error: any) {
      console.error("Error signing in:", error)
      let errorMessage = error.message
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Incorrect email or password. Please try again."
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please check your email and confirm your account before signing in."
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-[#f3e8ff] via-[#f8fafc] to-[#e0e7ff] py-12 px-4 sm:px-6 lg:px-8"
      suppressHydrationWarning
    >
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#c084fc] to-[#a855f7] rounded-full mb-4 shadow-lg">
            <BriefcaseIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-lg text-gray-600">Sign in to your recruiter account</p>
        </div>

        <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Recruiter Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              Access your dashboard to manage job postings and candidates
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address *
                </Label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl"
                    placeholder="Enter your email"
                    required
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#c084fc] to-[#a855f7] hover:from-[#a855f7] hover:to-[#9333ea] text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/recruiter/register"
                    className="text-[#c084fc] hover:text-[#a855f7] font-medium transition-colors"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 