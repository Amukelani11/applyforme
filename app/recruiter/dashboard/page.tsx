"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Briefcase, Users, FileText, Activity, CreditCard, Building, Eye, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface JobPosting {
  id: number
  title: string
  is_active: boolean
  application_count: { count: number }[]
}

interface CandidateApplication {
  id: number
  status: string
  created_at: string
  user: {
    full_name: string
    email: string
  }
  job_posting: {
    title: string
  }
}

export default function RecruiterDashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [applications, setApplications] = useState<CandidateApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    activeJobs: 0,
    newApplications: 0,
    jobCredits: 0,
    currentPlan: "Free"
  })
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "applications")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !session?.user) {
          router.push("/recruiter/login")
          return
        }

        const { data: recruiterData, error: recruiterError } = await supabase
          .from("recruiters")
          .select("id, job_credits")
          .eq("user_id", session.user.id)
          .single()

        if (recruiterError) throw recruiterError
        
        const { data: subscription, error: subError } = await supabase
            .from('recruiter_subscriptions')
            .select('plan_id')
            .eq('recruiter_id', recruiterData.id)
            .eq('status', 'active')
            .single()

        const currentPlan = subscription?.plan_id ? subscription.plan_id.charAt(0).toUpperCase() + subscription.plan_id.slice(1) : "Free";

        const { data: jobsData, error: jobsError } = await supabase
          .from("job_postings")
          .select("id, title, is_active, application_count:candidate_applications(count)")
          .eq("recruiter_id", recruiterData.id)
          .order("created_at", { ascending: false })

        if (jobsError) throw jobsError
        setJobPostings(jobsData || [])
        
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { count: newApplicationsCount, error: newApplicationsError } = await supabase
            .from('candidate_applications')
            .select('*', { count: 'exact', head: true })
            .in('job_posting_id', jobsData.map(j => j.id))
            .gte('created_at', sevenDaysAgo)
        
        if (newApplicationsError) throw newApplicationsError;

        setStats({
          activeJobs: jobsData.filter(job => job.is_active).length,
          newApplications: newApplicationsCount || 0,
          jobCredits: recruiterData.job_credits,
          currentPlan: currentPlan
        })

        if (jobsData.length > 0) {
          const { data: applicationsData, error: applicationsError } = await supabase
            .from("candidate_applications")
            .select(`*, user:users(full_name, email), job_posting:job_postings(title)`)
            .in("job_posting_id", jobsData.map((job) => job.id))
            .order("created_at", { ascending: false })
            .limit(10)

          if (applicationsError) throw applicationsError
          setApplications(applicationsData || [])
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [router, supabase, toast])

  const StatCard = ({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'viewed': return <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">Viewed</Badge>
      case 'shortlisted': return <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">Shortlisted</Badge>
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>
      default: return <Badge className="bg-purple-100 text-purple-800 border border-purple-200">New</Badge>
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">A quick overview of your recruitment activity.</p>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href="/recruiter/jobs/new">
            <Plus className="mr-2 h-4 w-4" /> Post a New Job
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Jobs" value={stats.activeJobs} icon={<Briefcase className="h-4 w-4 text-purple-600" />} description="Total number of live job postings." />
        <StatCard title="New Applications" value={stats.newApplications} icon={<Users className="h-4 w-4 text-purple-600" />} description="Received in the last 7 days." />
        <StatCard title="Job Credits" value={stats.jobCredits} icon={<CreditCard className="h-4 w-4 text-purple-600" />} description="Remaining credits for job posts." />
        <StatCard title="Current Plan" value={stats.currentPlan} icon={<Star className="h-4 w-4 text-purple-600" />} description="Your active subscription plan." />
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications">Recent Applications</TabsTrigger>
          <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>The 10 most recent candidates who have applied to your jobs.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Applying For</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.length > 0 ? applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="font-medium">{app.user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{app.user.email}</div>
                      </TableCell>
                      <TableCell>{app.job_posting.title}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                       <TableCell colSpan={5} className="h-24 text-center">No recent applications.</TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="jobs">
           <Card>
            <CardHeader>
              <CardTitle>Active Jobs</CardTitle>
              <CardDescription>A list of your current live job postings.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobPostings.filter(j => j.is_active).length > 0 ? jobPostings.filter(j => j.is_active).map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.application_count[0]?.count || 0}</TableCell>
                      <TableCell><Badge variant="outline" className="text-green-600 border-green-600">Active</Badge></TableCell>
                       <TableCell>
                        <Button variant="outline" size="sm">
                          <Link href={`/recruiter/jobs/${job.id}`}>View Details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                       <TableCell colSpan={4} className="h-24 text-center">No active jobs.</TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 