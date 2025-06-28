"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Users, FileText, Clock, CheckCircle, Search, Download, Send, CreditCard, Building2, UserCheck, Eye, Sparkles, Star, FileUp, Mail, Edit3, CheckSquare } from "lucide-react"
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Database } from '@/types/supabase'
import { EmailService } from '@/lib/email-service'

interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: string | null
  subscription_status: string
  subscription_plan: string | null
  trial_end: string | null
  created_at: string
  updated_at: string
  is_admin: boolean
}

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
  recruiter_subscriptions: {
    plan_id: string;
    status: string;
  }[];
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

interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: string
  amount: number
  currency: string
  payment_date: string | null
  trial_end: string | null
  initial_period_end: string | null
}

interface QualificationSummary {
  summary: string
  keySkills: string[]
  experienceLevel: string
  preferredIndustries: string[]
  salaryExpectation: string
}

interface CVImprovement {
  id: number
  user_id: string
  original_cv_id: number
  improved_cv_id: number | null
  status: 'pending' | 'in_progress' | 'completed' | 'sent'
  issues_found: string[] | null
  improvements_made: string[] | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  user: {
    full_name: string
    email: string
  }
  original_cv: {
    name: string
    url: string
  }
  improved_cv: {
    name: string
    url: string
  } | null
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [recruiters, setRecruiters] = useState<Recruiter[]>([])
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [cvImprovements, setCvImprovements] = useState<CVImprovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>('')
  const [selectedJob, setSelectedJob] = useState<string>('')
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [sendingCV, setSendingCV] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<{ [userId: string]: QualificationSummary }>({})
  const [loadingAI, setLoadingAI] = useState<{ [userId: string]: boolean }>({})
  
  // CV Improvement states
  const [isCvImprovementDialogOpen, setIsCvImprovementDialogOpen] = useState(false)
  const [selectedImprovement, setSelectedImprovement] = useState<CVImprovement | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [improvedCvFile, setImprovedCvFile] = useState<File | null>(null)
  const [sendingImprovement, setSendingImprovement] = useState(false)
  
  const supabase = createClientComponentClient<Database>()

  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (!session?.user) {
          router.push('/signin')
          return
        }

        // Check if user is admin
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

        // Fetch all users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })

        if (usersError) throw usersError
        setUsers(usersData || [])

        // Fetch all applications
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('*')
          .order('applied_date', { ascending: false })

        if (applicationsError) throw applicationsError
        setApplications(applicationsData || [])

        // Fetch all recruiters
        const { data: recruitersData, error: recruitersError } = await supabase
          .from('recruiters')
          .select('*, recruiter_subscriptions(*)')
          .order('created_at', { ascending: false })

        if (recruitersError) throw recruitersError
        setRecruiters(recruitersData || [])

        // Fetch all job postings
        const { data: jobPostingsData, error: jobPostingsError } = await supabase
          .from('job_postings')
          .select('*')
          .order('created_at', { ascending: false })

        if (jobPostingsError) throw jobPostingsError
        setJobPostings(jobPostingsData || [])

        // Fetch all subscriptions
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false })

        if (subscriptionsError) throw subscriptionsError
        setSubscriptions(subscriptionsData || [])

        // Fetch CV improvements
        const { data: cvImprovementsData, error: cvImprovementsError } = await supabase
          .from('cv_improvements')
          .select(
            `*,
            user:users(full_name, email),
            original_cv:documents!cv_improvements_original_cv_id_fkey(name, url),
            improved_cv:documents!cv_improvements_improved_cv_id_fkey(name, url)
          `
          )
          .order('created_at', { ascending: false })

        if (cvImprovementsError) throw cvImprovementsError
        setCvImprovements(cvImprovementsData || [])

      } catch (error: any) {
        console.error('Admin dashboard error:', error)
        setError(error.message || 'An error occurred while loading the admin dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, supabase])

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  
  const filteredRecruiters = recruiters.filter(recruiter =>
    recruiter.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recruiter.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendCVToRecruiter = async () => {
    if (!selectedUser || !selectedRecruiter || !selectedJob) {
      toast({
        title: "Selection missing",
        description: "Please select a user, recruiter, and job.",
        variant: "destructive"
      })
      return
    }

    // This is a placeholder for the actual logic to send the CV
    console.log(`Sending CV of ${selectedUser.full_name} for job ${selectedJob} to recruiter ${selectedRecruiter}`)
    toast({
      title: "CV Sent",
      description: `The CV has been sent to the selected recruiter.`,
    })
    setIsSendDialogOpen(false)
  }

  const openSendDialog = (user: User) => {
    setSelectedUser(user)
    setIsSendDialogOpen(true)
  }

  const getJobsForRecruiter = (recruiterId: string) => {
    return jobPostings.filter(job => job.recruiter_id === recruiterId)
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'bg-purple-100 text-purple-800'
      case 'standard': return 'bg-blue-100 text-blue-800'
      case 'free': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'past_due': return 'bg-yellow-100 text-yellow-800'
      case 'canceled': return 'bg-red-100 text-red-800'
      case 'trialing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAIAnalysis = async (userId: string) => {
    if (aiAnalysis[userId]) return;

    setLoadingAI(prev => ({ ...prev, [userId]: true }))
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!response.ok) {
        throw new Error('Failed to fetch AI analysis')
      }
      const data = await response.json()
      setAiAnalysis(prev => ({ ...prev, [userId]: data.analysis }))
    } catch (err: any) {
      toast({ title: "AI Analysis Error", description: err.message, variant: 'destructive' })
    } finally {
      setLoadingAI(prev => ({ ...prev, [userId]: false }))
    }
  }
  
  const openCvImprovementDialog = (improvement: CVImprovement) => {
    setSelectedImprovement(improvement)
    setAdminNotes(improvement.admin_notes || '')
    setEmailSubject(`Your Improved CV from ApplyForMe is Ready!`)
    setEmailBody(getEmailTemplate(improvement))
    setIsCvImprovementDialogOpen(true)
  }

  const getEmailTemplate = (improvement: CVImprovement) => {
    return `Hi ${improvement.user.full_name},\n\nGreat news! Our team has finished improving your CV. We've focused on highlighting your skills and experiences to better match what recruiters are looking for.\n\nThe improved version is attached to this email. We'd love to hear your feedback!\n\nBest regards,\nThe ApplyForMe Team`
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type !== 'application/pdf') {
        toast({ title: "Invalid File Type", description: "Please upload a PDF file.", variant: "destructive" })
        return
      }
      setImprovedCvFile(file)
    }
  }

  const handleSendImprovement = async () => {
    if (!selectedImprovement || !improvedCvFile) {
      toast({ title: "Missing Information", description: "Please select an improvement request and upload the new CV.", variant: 'destructive'})
      return
    }
    
    setSendingImprovement(true)

    try {
      // 1. Upload new CV to Supabase Storage
      const supabase = createClientComponentClient()
      const newCvFileName = `improved_${selectedImprovement.user_id}_${Date.now()}.pdf`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`public/${newCvFileName}`, improvedCvFile)

      if (uploadError) throw new Error(`Failed to upload new CV: ${uploadError.message}`)
      
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(`public/${newCvFileName}`)
      
      // 2. Create a new document record for the improved CV
      const { data: newDoc, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: selectedImprovement.user_id,
          name: newCvFileName,
          type: 'improved_cv',
          url: publicUrl,
        })
        .select('id')
        .single()

      if (docError) throw new Error(`Failed to create document record: ${docError.message}`)

      // 3. Update the cv_improvements table
      const { error: updateError } = await supabase
        .from('cv_improvements')
        .update({
          improved_cv_id: newDoc.id,
          status: 'sent',
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedImprovement.id)
      
      if (updateError) throw new Error(`Failed to update improvement record: ${updateError.message}`)
        
      // 4. Send email to user (using your email service)
      const emailService = new EmailService();
      await emailService.sendEmail({
        to: selectedImprovement.user.email,
        subject: emailSubject,
        text: emailBody,
        attachments: [
          {
            filename: newCvFileName,
            content: Buffer.from(await improvedCvFile.arrayBuffer()),
            contentType: 'application/pdf',
          },
        ],
      });

      // 5. Update local state to reflect changes
      setCvImprovements(prev => 
        prev.map(item => 
          item.id === selectedImprovement.id 
            ? { ...item, status: 'sent', admin_notes: adminNotes } 
            : item
        )
      )

      toast({ title: "Success", description: "Improved CV sent to the user." })
      setIsCvImprovementDialogOpen(false)
      setImprovedCvFile(null)
      
    } catch (err: any) {
      console.error("Error sending improvement:", err)
      toast({ title: "Error", description: err.message, variant: 'destructive' })
    } finally {
      setSendingImprovement(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>
      case 'in_progress':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><Sparkles className="mr-1 h-3 w-3" />In Progress</Badge>
      case 'completed':
        return <Badge className="bg-yellow-400 text-yellow-900"><CheckSquare className="mr-1 h-3 w-3" />Completed</Badge>
      case 'sent':
        return <Badge variant="default" className="bg-green-600"><Send className="mr-1 h-3 w-3" />Sent</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRecruiterPlan = (recruiter: Recruiter) => {
    if (!recruiter.recruiter_subscriptions || recruiter.recruiter_subscriptions.length === 0) {
      return 'free';
    }
    const activeSub = recruiter.recruiter_subscriptions.find(s => s.status === 'active');
    return activeSub ? activeSub.plan_id : 'free';
  };
  
  if (loading) return <div>Loading admin dashboard...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Oversee all platform activities from one central location.</p>
      
      <div className="mb-6">
        <Input 
          type="search"
          placeholder="Search by name, email, or company..."
          className="max-w-lg mx-auto"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Users</TabsTrigger>
          <TabsTrigger value="applications"><FileText className="mr-2 h-4 w-4" />Applications</TabsTrigger>
          <TabsTrigger value="recruiters"><Building2 className="mr-2 h-4 w-4" />Recruiters</TabsTrigger>
          <TabsTrigger value="jobs"><UserCheck className="mr-2 h-4 w-4" />Job Postings</TabsTrigger>
          <TabsTrigger value="subscriptions"><CreditCard className="mr-2 h-4 w-4" />Subscriptions</TabsTrigger>
          {/* <TabsTrigger value="cv-improvements"><Star className="mr-2 h-4 w-4" />CV Improvements</TabsTrigger> */}
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Platform Users</CardTitle>
              <CardDescription>Browse and manage all registered users.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{user.full_name ? user.full_name.charAt(0) : user.email.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.full_name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <Button variant="outline" size="sm" onClick={() => getAIAnalysis(user.id)} disabled={loadingAI[user.id]}>
                        {loadingAI[user.id] ? "Analyzing..." : "AI Qualify"} <Sparkles className="ml-2 h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/users/${user.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>Monitor all applications submitted by users.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Application table or list */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruiters">
          <Card>
            <CardHeader>
              <CardTitle>Recruiters</CardTitle>
              <CardDescription>Manage and view all registered recruiters.</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecruiters.map((recruiter) => (
                      <tr key={recruiter.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{recruiter.company_name}</div>
                          <div className="text-sm text-gray-500">{recruiter.industry}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{recruiter.contact_email}</div>
                          <div className="text-sm text-gray-500">{recruiter.contact_phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${getPlanColor(getRecruiterPlan(recruiter))}`}>{getRecruiterPlan(recruiter)}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={recruiter.is_verified ? 'default' : 'secondary'}>
                            {recruiter.is_verified ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(recruiter.created_at).toLocaleDateString()}
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  )
}
