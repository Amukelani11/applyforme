"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  BarChart3,
  MessageSquare,
  Star
} from "lucide-react"
import { motion } from "framer-motion"

function RecruiterDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    shortlisted: 0,
    interviews: 0,
    hired: 0,
    conversionRate: 0
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [topJobs, setTopJobs] = useState([])

  const supabase = createClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/recruiter/login')
          return
        }

        // Fetch recruiter data
        const { data: recruiter } = await supabase
          .from('recruiters')
          .select('id, company_name')
          .eq('user_id', user.id)
          .single()

        if (!recruiter) {
          router.push('/recruiter/login')
          return
        }

        // Fetch job statistics
        const { data: jobs } = await supabase
          .from('job_postings')
          .select('id, status')
          .eq('recruiter_id', recruiter.id)

        const totalJobs = jobs?.length || 0
        const activeJobs = jobs?.filter(job => job.status === 'active').length || 0

        // Fetch application statistics
        const { data: applications } = await supabase
          .from('candidate_applications')
          .select('id, status, created_at')
          .in('job_posting_id', jobs?.map(j => j.id) || [])

        const totalApplications = applications?.length || 0
        const newApplications = applications?.filter(app => app.status === 'new').length || 0
        const shortlisted = applications?.filter(app => app.status === 'shortlisted').length || 0
        const interviews = applications?.filter(app => app.status === 'interview').length || 0
        const hired = applications?.filter(app => app.status === 'hired').length || 0

        const conversionRate = totalApplications > 0 ? Math.round((hired / totalApplications) * 100) : 0

        setStats({
          totalJobs,
          activeJobs,
          totalApplications,
          newApplications,
          shortlisted,
          interviews,
          hired,
          conversionRate
        })

        // Mock recent applications
        setRecentApplications([
          {
            id: 1,
            candidate_name: "Sarah Johnson",
            job_title: "Senior Frontend Developer",
            status: "new",
            applied_date: "2 hours ago",
            ai_score: 85
          },
          {
            id: 2,
            candidate_name: "Michael Chen",
            job_title: "Full Stack Engineer",
            status: "shortlisted",
            applied_date: "1 day ago",
            ai_score: 92
          },
          {
            id: 3,
            candidate_name: "Emily Rodriguez",
            job_title: "DevOps Engineer",
            status: "interview",
            applied_date: "2 days ago",
            ai_score: 78
          }
        ])

        // Mock top jobs
        setTopJobs([
          {
            id: 1,
            title: "Senior Frontend Developer",
            applications: 24,
            views: 156,
            status: "active"
          },
          {
            id: 2,
            title: "Full Stack Engineer",
            applications: 18,
            views: 98,
            status: "active"
          },
          {
            id: 3,
            title: "DevOps Engineer",
            applications: 12,
            views: 67,
            status: "active"
          }
        ])

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700'
      case 'shortlisted': return 'bg-green-100 text-green-700'
      case 'interview': return 'bg-purple-100 text-purple-700'
      case 'hired': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4" />
      case 'shortlisted': return <CheckCircle className="h-4 w-4" />
      case 'interview': return <Calendar className="h-4 w-4" />
      case 'hired': return <Star className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
        <p className="text-gray-600">Here's what's happening with your job postings today.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Application Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>Overview of your application pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">New Applications</span>
                  <span className="text-sm text-gray-600">{stats.newApplications}</span>
                </div>
                <Progress value={(stats.newApplications / Math.max(stats.totalApplications, 1)) * 100} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Shortlisted</span>
                  <span className="text-sm text-gray-600">{stats.shortlisted}</span>
                </div>
                <Progress value={(stats.shortlisted / Math.max(stats.totalApplications, 1)) * 100} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Interviews</span>
                  <span className="text-sm text-gray-600">{stats.interviews}</span>
                </div>
                <Progress value={(stats.interviews / Math.max(stats.totalApplications, 1)) * 100} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Hired</span>
                  <span className="text-sm text-gray-600">{stats.hired}</span>
                </div>
                <Progress value={(stats.hired / Math.max(stats.totalApplications, 1)) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" onClick={() => router.push('/recruiter/jobs/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/recruiter/applications')}>
                <Search className="h-4 w-4 mr-2" />
                View Applications
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/recruiter/insights')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/recruiter/messages')}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Applications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Latest applications from candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.map((application: any) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{application.candidate_name}</p>
                      <p className="text-sm text-gray-600">{application.job_title}</p>
                      <p className="text-xs text-gray-500">{application.applied_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(application.status)}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1 capitalize">{application.status}</span>
                    </Badge>
                    <div className="text-sm text-gray-600">
                      AI Score: {application.ai_score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={() => router.push('/recruiter/applications')}>
                View All Applications
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Performing Jobs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Jobs</CardTitle>
            <CardDescription>Jobs with the most applications and views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topJobs.map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {job.applications} applications
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {job.views} views
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function RecruiterDashboardPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    }>
      <RecruiterDashboardContent />
    </Suspense>
  )
} 