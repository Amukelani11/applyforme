"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  Calendar as CalendarIcon,
  DollarSign,
  FileText,
  Users,
  Clock,
  Target,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { trackJobPosted } from "@/lib/gtag"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

type JobStatus = 'active' | 'draft';

interface FormData {
  title: string
  company: string
  location: string
  jobType: string
  contractTerm: string
  salaryRange: string
  salaryType: string
  description: string
  requirements: string
  benefits: string
  applicationDeadline: Date | undefined
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

export default function NewJobPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    company: "",
    location: "",
    jobType: "full-time",
    contractTerm: "",
    salaryRange: "",
    salaryType: "annual",
    description: "",
    requirements: "",
    benefits: "",
    applicationDeadline: undefined,
  })

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async (status: JobStatus) => {
    setIsSubmitting(true)

    try {
      // Get recruiter ID
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error("Not authenticated")

      const { data: recruiterData, error: recruiterError } = await supabase
        .from("recruiters")
        .select("id")
        .eq("user_id", session.user.id)
        .single()

      if (recruiterError) throw recruiterError

      // Create job posting
      const { error: jobError } = await supabase.from("job_postings").insert({
        recruiter_id: recruiterData.id,
        status: status,
        title: formData.title,
        company: formData.company,
        location: formData.location,
        job_type: formData.jobType,
        contract_term: formData.jobType === "contract" ? formData.contractTerm : null,
        salary_range: formData.salaryRange,
        salary_type: formData.salaryType,
        description: formData.description,
        requirements: formData.requirements,
        benefits: formData.benefits,
        application_deadline: formData.applicationDeadline ? formData.applicationDeadline.toISOString() : null,
      })

      if (jobError) throw jobError

      toast({
        title: "Success",
        description: `Job posting successfully ${status === 'draft' ? 'saved as draft' : 'created'}!`,
      })

      // Track job posted event only if it's not a draft
      if (status === 'active') {
        trackJobPosted(formData.title, formData.company)
      }

      router.refresh()
      router.push("/recruiter/jobs")
    } catch (error: any) {
      console.error("Error creating job posting:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto py-8"
    >
        <div className="mb-8">
          <Link
            href="/recruiter/dashboard"
            className="group inline-flex items-center text-gray-500 hover:text-[#c084fc] mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Post a New Job</h1>
            <p className="text-lg text-gray-500">
              Create an attractive job posting to find the perfect candidate for your team
            </p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave('active'); }} className="space-y-12">
          {/* Basic Job Information */}
          <div className="space-y-8">
            <SectionHeader icon={Briefcase} title="Job Details" description="Essential information about the position" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-medium">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc] transition"
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="font-medium">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc] transition"
                    placeholder="e.g., TechCorp Solutions"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="font-medium">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc] transition"
                    placeholder="e.g., Cape Town, South Africa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobType" className="font-medium">Job Type *</Label>
                  <Select
                    value={formData.jobType}
                    onValueChange={(value) => handleChange("jobType", value)}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc] transition">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.jobType === "contract" && (
                 <div className="space-y-2">
                  <Label htmlFor="contractTerm" className="font-medium">Contract Term</Label>
                  <Input
                    id="contractTerm"
                    value={formData.contractTerm}
                    onChange={(e) => handleChange("contractTerm", e.target.value)}
                    className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc] transition"
                    placeholder="e.g., 6 months"
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="salaryRange" className="font-medium">Salary Range</Label>
                  <div className="relative">
                     <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                     <Input
                        id="salaryRange"
                        value={formData.salaryRange}
                        onChange={(e) => handleChange("salaryRange", e.target.value)}
                        className="pl-9 border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc] transition"
                        placeholder="e.g., 80,000 - 120,000"
                      />
                  </div>
                </div>

                 <div className="space-y-2">
                  <Label htmlFor="salaryType" className="font-medium">Salary Type</Label>
                  <Select
                    value={formData.salaryType}
                    onValueChange={(value) => handleChange("salaryType", value)}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc] transition">
                      <SelectValue placeholder="Select salary type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

               <div className="space-y-2">
                  <Label htmlFor="applicationDeadline" className="font-medium">Application Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal border-gray-200 hover:bg-gray-50",
                          !formData.applicationDeadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {formData.applicationDeadline ? (
                          format(formData.applicationDeadline, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.applicationDeadline}
                        onSelect={(date) => setFormData(prev => ({ ...prev, applicationDeadline: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
          </div>

          <Separator />

          {/* Job Description */}
          <div className="space-y-8">
             <SectionHeader icon={FileText} title="Job Description" description="Provide a detailed overview of the role" />
              <div className="space-y-2">
                <Label htmlFor="description" className="font-medium">Detailed Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="min-h-[150px] border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc] transition"
                  placeholder="Describe the main responsibilities, day-to-day tasks, and objectives of the role."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements" className="font-medium">Key Requirements *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleChange("requirements", e.target.value)}
                  className="min-h-[150px] border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc] transition"
                  placeholder="List the essential skills, qualifications, and experience required for this position."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits" className="font-medium">Benefits & Perks</Label>
                 <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => handleChange("benefits", e.target.value)}
                  className="min-h-[100px] border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc] transition"
                  placeholder="e.g., Medical aid, remote work options, performance bonuses, etc."
                />
              </div>
          </div>
          
          <Separator />

          <div className="flex justify-end pt-4 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={isSubmitting}
              size="lg"
            >
              Save as Draft
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              size="lg"
              className="bg-[#c084fc] hover:bg-[#a855f7] text-white font-semibold shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Job...
                </>
              ) : (
                'Publish Job Post'
              )}
            </Button>
          </div>
        </form>
    </motion.div>
  )
} 