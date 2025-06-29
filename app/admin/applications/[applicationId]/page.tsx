"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Download, Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface Application {
  id: number
  user_id: string
  job_title: string
  company: string
  status: string
  applied_date: string
  notes: string | null
  salary_range: string | null
  location: string | null
  contact_name: string | null
  contact_email: string | null
  next_steps: string | null
}

interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: string | null
}

interface Recruiter {
  id: string
  user_id: string
  company_name: string
  contact_email: string
  contact_phone: string | null
  industry: string | null
  location: string | null
  is_verified: boolean
  created_at: string
}

interface JobPosting {
  id: number
  recruiter_id: string
  title: string
  company: string
  location: string | null
  job_type: string
  salary_range: string | null
  is_active: boolean
  created_at: string
}

export default function ApplicationPage({ params }: { params: { applicationId: string } }) {
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [recruiters, setRecruiters] = useState<Recruiter[]>([])
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [nextSteps, setNextSteps] = useState('')
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>('')
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if user is admin
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (!session) {
          router.push('/login')
          return
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()

        if (userError) throw userError
        if (!userData.is_admin) {
          router.push('/dashboard')
          return
        }

        // Fetch application
        const { data: applicationData, error: applicationError } = await supabase
          .from('applications')
          .select('*')
          .eq('id', params.applicationId)
          .single()

        if (applicationError) throw applicationError
        setApplication(applicationData)
        setNotes(applicationData.notes || '')
        setNextSteps(applicationData.next_steps || '')

        // Fetch user data
        const { data: userData2, error: userError2 } = await supabase
          .from('users')
          .select('*')
          .eq('id', applicationData.user_id)
          .single()

        if (userError2) throw userError2
        setUser(userData2)

        // Fetch recruiters
        const { data: recruitersData, error: recruitersError } = await supabase
          .from('recruiters')
          .select('*')
          .order('created_at', { ascending: false })

        if (recruitersError) throw recruitersError
        setRecruiters(recruitersData || [])

        // Fetch job postings
        const { data: jobPostingsData, error: jobPostingsError } = await supabase
          .from('job_postings')
          .select('*')
          .order('created_at', { ascending: false })

        if (jobPostingsError) throw jobPostingsError
        setJobPostings(jobPostingsData || [])

      } catch (error: any) {
        console.error('Application details error:', error)
        setError(error.message || 'An error occurred while loading the application details')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, supabase, params.applicationId])

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', params.applicationId)

      if (error) throw error

      setApplication(prev => prev ? { ...prev, status: newStatus } : null)
    } catch (error: any) {
      console.error('Status update error:', error)
      setError(error.message || 'Failed to update status')
    }
  }

  const handleSaveNotes = async () => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          notes,
          next_steps: nextSteps,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.applicationId)

      if (error) throw error

      setApplication(prev => prev ? { 
        ...prev, 
        notes,
        next_steps: nextSteps,
        updated_at: new Date().toISOString()
      } : null)
    } catch (error: any) {
      console.error('Notes update error:', error)
      setError(error.message || 'Failed to save notes')
    }
  }

  const handleSendCVToRecruiter = async () => {
    if (!user || !selectedRecruiter || !selectedJob) {
      toast({
        title: "Error",
        description: "Please select a recruiter and job",
        variant: "destructive",
      })
      return
    }

    try {
      // Get user's CV URL
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('file_url')
        .eq('user_id', user.id)
        .eq('document_type', 'cv')
        .order('created_at', { ascending: false })
        .limit(1)

      if (documentsError) throw documentsError

      if (!documents || documents.length === 0) {
        toast({
          title: "Error",
          description: "No CV found for this user",
          variant: "destructive",
        })
        return
      }

      // Create candidate application
      const { error: applicationError } = await supabase
        .from('candidate_applications')
        .insert({
          job_posting_id: parseInt(selectedJob),
          user_id: user.id,
          cv_url: documents[0].file_url,
          status: 'pending',
          recruiter_notes: `CV sent by admin from ${user.full_name || user.email}`
        })

      if (applicationError) throw applicationError

      toast({
        title: "Success",
        description: "CV sent to recruiter successfully",
      })

      setIsSendDialogOpen(false)
      setSelectedRecruiter('')
      setSelectedJob('')
    } catch (error: any) {
      console.error('Error sending CV:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to send CV",
        variant: "destructive",
      })
    }
  }

  const getJobsForRecruiter = (recruiterId: string) => {
    return jobPostings.filter(job => job.recruiter_id === recruiterId && job.is_active)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c084fc] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#c084fc] hover:bg-[#a855f7]"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!application || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Application not found</p>
          <Link href="/admin">
            <Button className="bg-[#c084fc] hover:bg-[#a855f7]">
              Back to Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Application Details</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href={`/admin/${user.id}`}>
            <Button variant="outline">
              View User Profile
            </Button>
          </Link>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download CV
          </Button>
          <Button 
            onClick={() => setIsSendDialogOpen(true)}
            className="bg-[#c084fc] hover:bg-[#a855f7]"
          >
            <Send className="h-4 w-4 mr-2" />
            Send CV to Recruiter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Position:</strong> {application.job_title}</p>
              <p><strong>Company:</strong> {application.company}</p>
              <p><strong>Location:</strong> {application.location || 'N/A'}</p>
              <p><strong>Salary Range:</strong> {application.salary_range || 'N/A'}</p>
              <p><strong>Applied Date:</strong> {new Date(application.applied_date).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {application.contact_name || 'N/A'}</p>
              <p><strong>Email:</strong> {application.contact_email || 'N/A'}</p>
              <p><strong>Applicant:</strong> {user.full_name || user.email}</p>
              <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Badge className={
                  application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  application.status === 'interviewed' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-gray-100 text-gray-800'
                }>
                  {application.status}
                </Badge>
              </div>
              <Select
                value={application.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this application..."
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="Add next steps for this application..."
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSaveNotes}>
          Save Changes
        </Button>
      </div>

      {/* Send CV Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send CV to Recruiter</DialogTitle>
            <DialogDescription>
              Send {user?.full_name || user?.email}'s CV to a recruiter for a specific job.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="recruiter" className="text-sm font-medium">
                Select Recruiter
              </label>
              <Select value={selectedRecruiter} onValueChange={setSelectedRecruiter}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a recruiter" />
                </SelectTrigger>
                <SelectContent>
                  {recruiters.map((recruiter) => (
                    <SelectItem key={recruiter.id} value={recruiter.id}>
                      {recruiter.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="job" className="text-sm font-medium">
                Select Job
              </label>
              <Select 
                value={selectedJob} 
                onValueChange={setSelectedJob}
                disabled={!selectedRecruiter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a job" />
                </SelectTrigger>
                <SelectContent>
                  {selectedRecruiter && getJobsForRecruiter(selectedRecruiter).map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      {job.title} at {job.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendCVToRecruiter}>
              Send CV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 