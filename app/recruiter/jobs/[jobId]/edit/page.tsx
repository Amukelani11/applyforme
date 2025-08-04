"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2, Share2, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

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
  public_share_id: string
  allow_public_applications: boolean
  public_application_count: number
}

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [job, setJob] = useState<Partial<JobPosting>>({
    title: "",
    company: "",
    location: "",
    job_type: "full-time",
    salary_range: "",
    salary_type: "annual",
    contract_term: "",
    description: "",
    requirements: "",
    is_active: true,
    public_share_id: "",
    allow_public_applications: false,
    public_application_count: 0,
  })

  const jobId = params.jobId as string

  useEffect(() => {
    fetchJobDetails()
  }, [jobId])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error) {
        console.error('Error fetching job:', error)
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        })
        return
      }

      setJob(data)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!job.title || !job.company || !job.description || !job.requirements) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('job_postings')
        .update({
          ...job,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Job posting updated successfully",
      })
      
      router.push(`/recruiter/jobs/${jobId}`)
    } catch (error: any) {
      console.error('Error updating job:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update job posting",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = () => {
    const shareableLink = `${window.location.origin}/jobs/public/${job.public_share_id}`
    navigator.clipboard.writeText(shareableLink)
    toast({
      title: "Copied to clipboard!",
      description: "The shareable link has been copied.",
    })
  }

  const handleInputChange = (field: keyof JobPosting, value: any) => {
    setJob(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c084fc]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/recruiter/jobs/${jobId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Job
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Job Posting</h1>
              <p className="text-gray-600">Update your job posting details</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Information</CardTitle>
                  <CardDescription>
                    Update the basic information about this position
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        value={job.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g., Senior Software Engineer"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={job.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="e.g., Tech Corp"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={job.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Cape Town, South Africa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job_type">Job Type</Label>
                      <Select
                        value={job.job_type}
                        onValueChange={(value) => handleInputChange('job_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary_range">Salary Range</Label>
                      <Input
                        id="salary_range"
                        value={job.salary_range}
                        onChange={(e) => handleInputChange('salary_range', e.target.value)}
                        placeholder={job.salary_type === 'annual' ? 'e.g., R500,000 - R800,000' : 'e.g., R40,000 - R60,000'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary_type">Salary Type</Label>
                      <Select
                        value={job.salary_type}
                        onValueChange={(value) => handleInputChange('salary_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select salary type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="annual">Annual</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {job.job_type === 'contract' && (
                    <div className="space-y-2">
                      <Label htmlFor="contract_term">Contract Term</Label>
                      <Input
                        id="contract_term"
                        value={job.contract_term}
                        onChange={(e) => handleInputChange('contract_term', e.target.value)}
                        placeholder="e.g., 6 months, 1 year, or specific end date"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Description *</CardTitle>
                  <CardDescription>
                    Provide a detailed description of the role and responsibilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={job.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                      rows={8}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements *</CardTitle>
                  <CardDescription>
                    List the skills, experience, and qualifications required
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={job.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      placeholder="List the required skills, experience, education, and any other qualifications..."
                      rows={6}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status & Visibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Active</Label>
                    <Switch
                      id="is_active"
                      checked={job.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Active jobs are visible to candidates.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="w-5 h-5 mr-2" />
                    Sharing Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow_public">Allow public applications</Label>
                    <Switch
                      id="allow_public"
                      checked={job.allow_public_applications}
                      onCheckedChange={(checked) => handleInputChange('allow_public_applications', checked)}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Allow non-users to apply via a shareable link. (Limit: 5 applications)
                  </p>
                  
                  {job.public_share_id && (
                    <div className="mt-4">
                      <Label>Shareable Link</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          readOnly
                          value={`${window.location.origin}/jobs/public/${job.public_share_id}`}
                          className="text-sm"
                        />
                        <Button type="button" variant="outline" size="icon" onClick={handleCopyLink}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {job.public_application_count || 0}/5 public applications used.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full" disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 