"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase, 
  Users, 
  Settings, 
  Crown, 
  Zap, 
  Plus,
  Menu,
  X,
  LogOut
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RecruiterSidebar } from "@/components/recruiter/sidebar"
import { Navbar } from "@/components/navbar"

interface RecruiterDashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Job Postings',
    href: '/recruiter/dashboard',
    icon: Briefcase,
    current: true
  },
  {
    name: 'Applications',
    href: '/recruiter/dashboard/applications',
    icon: Users,
    current: false
  },
  {
    name: 'Job Credits',
    href: '/recruiter/dashboard/credits',
    icon: Crown,
    current: false
  },
  {
    name: 'Settings',
    href: '/recruiter/dashboard/settings',
    icon: Settings,
    current: false
  }
]

export default function RecruiterDashboardLayout({ children }: RecruiterDashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState('free')
  const [jobsPostedThisMonth, setJobsPostedThisMonth] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (!session?.user) {
          router.push("/recruiter/login")
          return
        }

        // Get recruiter profile
        const { data: recruiterData, error: recruiterError } = await supabase
          .from("recruiters")
          .select("id")
          .eq("user_id", session.user.id)
          .single()

        if (recruiterError) throw recruiterError

        // Set current plan (default to free since plan_type column doesn't exist)
        setCurrentPlan('free')

        // Count jobs posted this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { data: monthlyJobs, error: monthlyJobsError } = await supabase
          .from("job_postings")
          .select("id")
          .eq("recruiter_id", recruiterData.id)
          .gte("created_at", startOfMonth.toISOString())

        if (monthlyJobsError) throw monthlyJobsError
        setJobsPostedThisMonth(monthlyJobs?.length || 0)
      } catch (error: any) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, supabase, toast])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/recruiter/login")
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  const getPlanLimits = () => {
    const limits = {
      free: 10,
      premium: 50,
      unlimited: 999999
    }
    return limits[currentPlan as keyof typeof limits] || 10
  }

  const canPostJob = () => {
    if (currentPlan === 'unlimited') return true
    return jobsPostedThisMonth < getPlanLimits()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c084fc]"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" suppressHydrationWarning>
      <RecruiterSidebar />
      <div className="flex-1 relative ml-72">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 