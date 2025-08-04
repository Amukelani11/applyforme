"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash2, Users, Calendar, MapPin, DollarSign, Briefcase } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ChartContainer } from '@/components/ui/chart'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

interface JobPosting {
  id: number
  title: string
  company: string
  location: string
  job_type: string
  salary_range: string
  salary_type: string
  contract_term?: string
  description: string
  requirements: string
  is_active: boolean
  created_at: string
  updated_at: string
  recruiter_id: string
}

interface Application {
  id: number
  user_id: string
  cv_url: string
  status: string
  created_at: string
  user: {
    full_name: string
    email: string
  }
}

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [job, setJob] = useState<JobPosting | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const jobId = params.jobId as string

  useEffect(() => {
    fetchJobDetails()
  }, [jobId])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      
      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', jobId)
        .single()

      if (jobError) {
        console.error('Error fetching job:', jobError)
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        })
        return
      }

      setJob(jobData)

      // Fetch applications for this job
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('candidate_applications')
        .select(`
          id,
          user_id,
          cv_url,
          status,
          created_at,
          user:users(full_name, email)
        `)
        .eq('job_posting_id', jobId)

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError)
      } else {
        // Ensure user is always an object, not an array
        const mappedApps = (applicationsData || []).map(app => ({
          ...app,
          user: Array.isArray(app.user) ? app.user[0] : app.user
        }))
        setApplications(mappedApps)
      }

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async () => {
    if (!confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(true)
      
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Job posting deleted successfully",
      })
      
      router.push('/recruiter/dashboard')
    } catch (error: any) {
      console.error('Error deleting job:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete job posting",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('candidate_applications')
        .update({ status: newStatus })
        .eq('id', applicationId)

      if (error) {
        throw error
      }

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      )

      toast({
        title: "Success",
        description: "Application status updated",
      })
    } catch (error: any) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update application status",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c084fc]"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job posting you're looking for doesn't exist or has been removed.</p>
          <Link href="/recruiter/dashboard">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/recruiter/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-600">{job.company}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/recruiter/jobs/${job.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              onClick={handleDeleteJob}
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Job Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Type:</span>
                    <Badge variant="outline">{job.job_type}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm font-medium">{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Salary:</span>
                    <span className="text-sm font-medium">
                      {job.salary_range} ({job.salary_type})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Posted:</span>
                    <span className="text-sm font-medium">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {job.contract_term && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Contract Term:</span>
                    <span className="text-sm font-medium">{job.contract_term}</span>
                  </div>
                )}

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
                  </div>
                </div>

                <Separator />

                {/* Requirements */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700">{job.requirements}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Analytics</CardTitle>
                <CardDescription>Animated breakdown of application statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    pending: { label: 'Pending', color: '#a855f7' },
                    shortlisted: { label: 'Shortlisted', color: '#f59e42' },
                    interviewed: { label: 'Interviewed', color: '#38bdf8' },
                    hired: { label: 'Hired', color: '#22c55e' },
                    rejected: { label: 'Rejected', color: '#ef4444' },
                  }}
                  style={{ width: '100%', height: 220 }}
                >
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={['pending', 'shortlisted', 'interviewed', 'hired', 'rejected'].map(status => ({
                      status,
                      count: applications.filter(a => a.status === status).length
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" isAnimationActive fill="#a855f7" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Applications ({applications.length})
                </CardTitle>
                <CardDescription>
                  Manage applications for this position
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No applications yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {applications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">{application.user.full_name}</p>
                            <p className="text-xs text-gray-500">{application.user.email}</p>
                          </div>
                          <Badge
                            variant={
                              application.status === "hired"
                                ? "default"
                                : application.status === "rejected"
                                ? "destructive"
                                : application.status === "interviewed"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {application.status}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(application.cv_url, "_blank")}
                          >
                            View CV
                          </Button>
                          <select
                            className="px-2 py-1 text-xs border rounded"
                            value={application.status}
                            onChange={(e) => handleStatusChange(application.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interviewed">Interviewed</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Status */}
            <Card>
              <CardHeader>
                <CardTitle>Job Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={job.is_active ? "default" : "secondary"}>
                    {job.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 