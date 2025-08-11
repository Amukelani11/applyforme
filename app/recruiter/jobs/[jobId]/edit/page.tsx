"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from '@/lib/supabase/client'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2, Share2, Copy, Trash2, Info, FileText, Settings, AlertTriangle, Eye, MapPin, Briefcase, DollarSign, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { CustomFieldsManager } from "@/components/recruiter/custom-fields-manager"
import { slugify } from "@/lib/utils"

interface JobPosting {
  id: number
  title: string
  company: string
  company_slug?: string
  location: string
  job_type: string
  salary_range: string
  salary_type: string
  contract_term?: string
  description: string
  requirements: string
  benefits?: string
  status: 'draft' | 'active' | 'closed'
  created_at: string
  updated_at: string
  recruiter_id: string
  public_share_id: string
  allow_public_applications: boolean
  public_application_count: number
}

const SectionHeader = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex items-center space-x-4">
        <div className="p-3 bg-purple-100 rounded-lg">
            <Icon className="h-6 w-6 text-[#c084fc]" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-500">{description}</p>
        </div>
    </div>
);

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
    benefits: "",
    status: 'draft',
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
    if (!job.title) {
      toast({
        title: "Error",
        description: "Job title is required to generate shareable link",
        variant: "destructive",
      })
      return
    }
    
    const jobSlug = slugify(job.title)
    const companySlug = job.company_slug || slugify(job.company || '') || 'company'
    const idPart = job.id ?? jobId
    const shareableLink = `${window.location.origin}/jobs/public/${companySlug}/${jobSlug}-${idPart}`
    navigator.clipboard.writeText(shareableLink)
    toast({
      title: "Copied to clipboard!",
      description: "The shareable link has been copied.",
    })
  }

  const handleInputChange = (field: keyof JobPosting, value: any) => {
    setJob(prev => ({ ...prev, [field]: value }))
  }

  const formatAsBullets = (text?: string) => {
    if (!text) return null
    const lines = text
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean)
    return (
      <div className="space-y-2">
        {lines.map((line, idx) => {
          const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("*")
          const cleaned = isBullet ? line.slice(1).trim() : line
          return (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-gray-600" />
              <span className="text-gray-700">{cleaned}</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c084fc]"></div>
      </div>
    )
  }

  const TextareaAutoHeight = ({...props}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [props.value]);

    return <Textarea ref={textareaRef} {...props} />;
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto py-8"
    >
        <div className="mb-8">
          <Link
            href={`/recruiter/jobs/${jobId}`}
            className="group inline-flex items-center text-gray-500 hover:text-[#c084fc] mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Job
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Edit Job Posting</h1>
            <p className="text-lg text-gray-500">Make changes to your job posting and manage its status.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="space-y-12">
                <div className="space-y-8">
                    <SectionHeader icon={Eye} title="Live Preview" description="See how your job will look to candidates as you edit." />
                    <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
                      <div className="p-6">
                        <div className="mb-3">
                          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title || 'Job Title'}</h2>
                          <p className="text-gray-600">{job.company || 'Company Name'}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {job.location ? (
                            <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200"><MapPin className="h-4 w-4 mr-1" /> {job.location}</Badge>
                          ) : null}
                          {job.job_type ? (
                            <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200"><Briefcase className="h-4 w-4 mr-1" /> {job.job_type}</Badge>
                          ) : null}
                          {(job.contract_term && job.contract_term !== '') ? (
                            <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200"><Calendar className="h-4 w-4 mr-1" /> {job.contract_term}</Badge>
                          ) : null}
                          {(job.salary_range || job.salary_type) ? (
                            <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200"><DollarSign className="h-4 w-4 mr-1" /> {job.salary_range || '—'} {job.salary_type ? `(${job.salary_type})` : ''}</Badge>
                          ) : null}
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h3>
                            {job.description ? (
                              formatAsBullets(job.description)
                            ) : (
                              <p className="text-gray-500">No description added yet</p>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                            {job.requirements ? (
                              formatAsBullets(job.requirements)
                            ) : (
                              <p className="text-gray-500">No requirements added yet</p>
                            )}
                          </div>
                          {job.benefits ? (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">Benefits & Perks</h3>
                              {formatAsBullets(job.benefits)}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="border-t border-gray-100 p-4 flex items-center justify-between">
                        <div className="text-sm text-gray-500">Status: <span className="font-medium capitalize text-gray-700">{job.status}</span></div>
                        <Button type="button" variant="outline" className="border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-white">Preview Apply Flow</Button>
                      </div>
                    </div>
                </div>
             <div className="space-y-8">
                    <SectionHeader icon={Info} title="Job Information" description="Update the basic information for this position." />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                        <Label htmlFor="title" className="font-medium">Job Title *</Label>
                        <Input id="title" value={job.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="company" className="font-medium">Company *</Label>
                        <Input id="company" value={job.company} onChange={(e) => handleInputChange('company', e.target.value)} required />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                        <Label htmlFor="location" className="font-medium">Location</Label>
                        <Input id="location" value={job.location} onChange={(e) => handleInputChange('location', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="job_type" className="font-medium">Job Type</Label>
                        <Select value={job.job_type} onValueChange={(value) => handleInputChange('job_type', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="salary_range" className="font-medium">Salary Range</Label>
                            <Input id="salary_range" value={job.salary_range} onChange={(e) => handleInputChange('salary_range', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salary_type" className="font-medium">Salary Type</Label>
                            <Select value={job.salary_type} onValueChange={(value) => handleInputChange('salary_type', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                <SelectItem value="annual">Annual</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <Separator />
                
                <div className="space-y-8">
                    <SectionHeader icon={FileText} title="Description & Requirements" description="Provide the detailed overview of the role." />
                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-medium">Job Description *</Label>
                        <TextareaAutoHeight id="description" value={job.description} onChange={(e: any) => handleInputChange('description', e.target.value)} required className="min-h-[120px]" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="requirements" className="font-medium">Requirements *</Label>
                        <TextareaAutoHeight id="requirements" value={job.requirements} onChange={(e: any) => handleInputChange('requirements', e.target.value)} required className="min-h-[120px]" />
                    </div>
                </div>

                <Separator />

                            <div className="space-y-8">
                <SectionHeader icon={FileText} title="Benefits & Perks" description="List the benefits and perks for this role." />
                <div className="space-y-2">
                    <Label htmlFor="benefits" className="font-medium">Benefits</Label>
                    <TextareaAutoHeight id="benefits" value={job.benefits} onChange={(e: any) => handleInputChange('benefits', e.target.value)} className="min-h-[120px]" />
                </div>
            </div>

            <Separator />

            <div className="space-y-8">
                <SectionHeader icon={Settings} title="Custom Application Fields" description="Add custom fields to collect additional information from applicants." />
                <CustomFieldsManager jobId={parseInt(jobId)} />
            </div>

            <Separator />

            <div className="space-y-8">
                <SectionHeader icon={Settings} title="Status & Visibility" description="Control who can see and apply to this job." />
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <Label htmlFor="status" className="font-medium">Job Status</Label>
                                <p className="text-sm text-gray-500">Set the job to draft, active, or closed.</p>
                            </div>
                            <Select value={job.status} onValueChange={(value) => handleInputChange('status', value)}>
                                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <Label htmlFor="allow_public" className="font-medium">Allow public applications</Label>
                                <p className="text-sm text-gray-500">Enable a shareable link for anyone to apply.</p>
                            </div>
                            <Switch
                                id="allow_public"
                                checked={job.allow_public_applications}
                                onCheckedChange={(checked) => handleInputChange('allow_public_applications', checked)}
                                className="data-[state=checked]:bg-[#c084fc]"
                            />
                        </div>
                    </div>
                    {job.allow_public_applications && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
                            <Label className="font-medium flex items-center"><Share2 className="h-4 w-4 mr-2" /> Shareable Link</Label>
                            <p className="text-sm text-gray-600">Total public applications: <span className="font-bold">{job.public_application_count || 0}</span></p>
                            <div className="flex items-center gap-2">
                                <Input value={`${window.location.origin}/jobs/public/${job.company_slug || slugify(job.company || '') || 'company'}/${slugify(job.title || '')}-${job.id ?? jobId}`} readOnly />
                                <Button type="button" variant="ghost" size="icon" onClick={handleCopyLink}><Copy className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Separator className="my-12" />

            <div className="flex justify-between items-center">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700">
                           <Trash2 className="h-4 w-4 mr-2"/> Delete Job
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-red-500"/>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the job posting for &quot;{job.title}&quot;. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <div className="flex gap-4">
                     <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                     <Button type="submit" disabled={saving}>
                        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                     </Button>
                </div>
            </div>
        </form>
    </motion.div>
  )
} 