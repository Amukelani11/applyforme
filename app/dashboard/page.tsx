"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Briefcase, FileText, Lightbulb, Clock, Star, BookmarkPlus, Plus, Trash2, Upload, Award, Sparkles, Eye, Bookmark, User, ArrowRight, CheckCircle, Lock } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Database } from '@/types/supabase'
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

interface User {
  id: string
  email: string
  full_name: string
  subscription_status: string
  subscription_plan: string
  trial_end: string
  created_at: string
  updated_at: string
}

interface Document {
  id: number
  user_id: string
  name: string
  type: 'cv' | 'cover_letter' | 'certificate' | 'other'
  url: string
  created_at: string
  updated_at: string
}

interface Certification {
  id: number
  user_id: string
  name: string
  issuer: string
  date_obtained: string
  expiry_date: string | null
  credential_id: string | null
  credential_url: string | null
  created_at: string
  updated_at: string
}

interface Application {
  id: number
  job_title: string
  company_name: string
  status: 'applied' | 'viewed' | 'interviewing' | 'rejected' | 'hired'
  applied_date: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState({
    applicationsSent: 0,
    applicationsViewed: 0,
    savedJobs: 0
  })
  const [profileStrength, setProfileStrength] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
    try {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
          .select('full_name, subscription_plan')
        .eq('id', session.user.id)
        .single()

        if (profileError) throw profileError
      setUser(profile)

        const { data: apps, error: appsError } = await supabase
        .from('applications')
          .select('id, job_title, company_name, status, applied_date')
        .eq('user_id', session.user.id)
          .order('applied_date', { ascending: false })

        if (appsError) throw appsError
        setApplications(apps || [])

        setStats({
          applicationsSent: apps?.length || 0,
          applicationsViewed: apps?.filter(app => app.status === 'viewed' || app.status === 'interviewing').length || 0,
          savedJobs: 0, // Placeholder
        })

        const { data: workData, error: workError } = await supabase.from('work_experience').select('id', { count: 'exact' }).eq('user_id', session.user.id)
        const { data: eduData, error: eduError } = await supabase.from('education').select('id', { count: 'exact' }).eq('user_id', session.user.id)
        const { data: docData, error: docError } = await supabase.from('documents').select('id', { count: 'exact' }).eq('user_id', session.user.id).eq('type', 'cv')

        let strength = 20; // Base strength for having an account
        if (profile?.full_name) strength += 10;
        if (workData && workData.length > 0) strength += 25;
        if (eduData && eduData.length > 0) strength += 25;
        if (docData && docData.length > 0) strength += 20;
        setProfileStrength(strength)

    } catch (error: any) {
        console.error("Dashboard error:", error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

    fetchData()
  }, [router, supabase])

  const StatCard = ({ title, value, icon, description, isPremium }: { title: string; value: string | number; icon: React.ReactNode; description: string; isPremium?: boolean }) => (
    <Card className="relative">
      {isPremium && (
        <Badge variant="secondary" className="absolute top-2 right-2 bg-purple-100 text-purple-700">
          <Sparkles className="h-3 w-3 mr-1" /> Premium
        </Badge>
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{isPremium ? <Lock className="h-6 w-6 text-gray-400" /> : value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'viewed': return <Badge variant="outline" className="text-blue-600 border-blue-600">Viewed</Badge>;
      case 'interviewing': return <Badge className="bg-yellow-100 text-yellow-800">Interviewing</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'hired': return <Badge className="bg-green-100 text-green-800">Hired</Badge>;
      default: return <Badge variant="secondary">Applied</Badge>;
    }
  }

  const getChecklistItems = () => {
    const items: { text: string; href: string }[] = [];
    if (profileStrength < 100) items.push({ text: "Complete Your Profile", href: "/dashboard/profile" });
    if (!applications || applications.length === 0) items.push({ text: "Set Your Job Preferences", href: "/dashboard/preferences" });
    items.push({ text: "Configure AI Recommendations", href: "/dashboard/preferences" });
    return items;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

    return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-muted-foreground">Here's your job search at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/documents">
              <Upload className="mr-2 h-4 w-4" /> Upload CV
            </Link>
          </Button>
            </div>
          </div>
          
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Applications Sent" value={stats.applicationsSent} icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} description="Total applications submitted." />
        <StatCard title="Applications Viewed" value={stats.applicationsViewed} icon={<Eye className="h-4 w-4 text-muted-foreground" />} description="Requires Premium to view." isPremium={user?.subscription_plan !== 'premium'} />
        <StatCard title="Saved Jobs" value={stats.savedJobs} icon={<Bookmark className="h-4 w-4 text-muted-foreground" />} description="Jobs you are keeping an eye on." />
            <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Strength</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{profileStrength}%</div>
            <Progress value={profileStrength} className="h-2" />
              </CardContent>
            </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest applications and their status.</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                <ul className="space-y-4">
                  {applications.slice(0, 5).map(app => (
                    <li key={app.id} className="flex items-center justify-between">
                          <div>
                        <p className="font-semibold">{app.job_title}</p>
                        <p className="text-sm text-muted-foreground">{app.company_name}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link href="/dashboard/preferences">Set your preferences</Link>
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        <div>
            <Card>
              <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Your next steps to success.</CardDescription>
              </CardHeader>
              <CardContent>
              <ul className="space-y-3">
                {getChecklistItems().map(item => (
                  <li key={item.text}>
                    <Link href={item.href}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                        <span className="font-medium text-sm">{item.text}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
