"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Briefcase, Building2, MapPin, Calendar, DollarSign, FileText, Users, Clock, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { trackJobPosted } from "@/lib/gtag"

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
  applicationDeadline: string
}

export default function NewJobPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
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
    applicationDeadline: "",
  })

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        application_deadline: formData.applicationDeadline,
        is_active: true,
      })

      if (jobError) throw jobError

      toast({
        title: "Success",
        description: "Job posting created successfully!",
      })

      // Track job posted event
      trackJobPosted(formData.title, formData.company)

      router.push("/recruiter/dashboard")
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/recruiter/dashboard"
            className="inline-flex items-center text-[#c084fc] hover:text-[#a855f7] mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Post New Job</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create an attractive job posting to find the perfect candidate for your team
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Job Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-[#c084fc]/10 to-[#a855f7]/10 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#c084fc]/20 rounded-lg">
                  <Briefcase className="h-6 w-6 text-[#c084fc]" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-semibold text-gray-900">Job Details</CardTitle>
                  <CardDescription className="text-gray-600">
                    Essential information about the position
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-[#c084fc]" />
                    Job Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]"
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-gray-700 flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-[#c084fc]" />
                    Company *
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]"
                    placeholder="e.g., TechCorp Solutions"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-[#c084fc]" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]"
                    placeholder="e.g., Cape Town, South Africa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobType" className="text-sm font-medium text-gray-700 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-[#c084fc]" />
                    Job Type *
                  </Label>
                  <Select
                    value={formData.jobType}
                    onValueChange={(value) => handleChange("jobType", value)}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]">
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
                <div className="bg-[#c084fc]/5 border border-[#c084fc]/20 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-[#c084fc]" />
                        Contract Term *
                      </Label>
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="durationType"
                              name="contractTermType"
                              value="duration"
                              checked={!formData.contractTerm.includes('-')}
                              onChange={() => handleChange("contractTerm", "")}
                              className="text-[#c084fc] focus:ring-[#c084fc]"
                            />
                            <Label htmlFor="durationType" className="text-sm font-normal">Duration</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="endDateType"
                              name="contractTermType"
                              value="endDate"
                              checked={formData.contractTerm.includes('-')}
                              onChange={() => handleChange("contractTerm", "")}
                              className="text-[#c084fc] focus:ring-[#c084fc]"
                            />
                            <Label htmlFor="endDateType" className="text-sm font-normal">End Date</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {!formData.contractTerm.includes('-') ? (
                      <div>
                        <Label htmlFor="contractDuration" className="text-sm font-medium text-gray-700">Duration</Label>
                        <Input
                          id="contractDuration"
                          value={formData.contractTerm}
                          onChange={(e) => handleChange("contractTerm", e.target.value)}
                          placeholder="e.g., 6 months, 1 year, 2 years 3 months"
                          className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]"
                          required
                        />
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="contractEndDate" className="text-sm font-medium text-gray-700">Contract End Date</Label>
                        <Input
                          id="contractEndDate"
                          type="date"
                          value={formData.contractTerm}
                          onChange={(e) => handleChange("contractTerm", e.target.value)}
                          className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="salaryType" className="text-sm font-medium text-gray-700 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-[#c084fc]" />
                    Salary Type
                  </Label>
                  <Select
                    value={formData.salaryType}
                    onValueChange={(value) => handleChange("salaryType", value)}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]">
                      <SelectValue placeholder="Select salary type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryRange" className="text-sm font-medium text-gray-700 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-[#c084fc]" />
                    Salary Range
                  </Label>
                  <Input
                    id="salaryRange"
                    value={formData.salaryRange}
                    onChange={(e) => handleChange("salaryRange", e.target.value)}
                    placeholder={formData.salaryType === "monthly" ? "e.g., R15,000 - R25,000" : "e.g., R180,000 - R300,000"}
                    className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-[#c084fc]/10 to-[#a855f7]/10 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#c084fc]/20 rounded-lg">
                  <FileText className="h-6 w-6 text-[#c084fc]" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-semibold text-gray-900">Job Description</CardTitle>
                  <CardDescription className="text-gray-600">
                    Detailed information about the role and responsibilities
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="min-h-[150px] border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]"
                  placeholder="Provide a comprehensive description of the role, responsibilities, and what makes this position exciting..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="requirements" className="text-sm font-medium text-gray-700 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-[#c084fc]" />
                    Requirements
                  </Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleChange("requirements", e.target.value)}
                    className="min-h-[120px] border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]"
                    placeholder="List the key requirements, qualifications, and skills needed for this position..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits" className="text-sm font-medium text-gray-700 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-[#c084fc]" />
                    Benefits
                  </Label>
                  <Textarea
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) => handleChange("benefits", e.target.value)}
                    className="min-h-[120px] border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]"
                    placeholder="List the benefits, perks, and advantages of working in this position..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationDeadline" className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-[#c084fc]" />
                  Application Deadline
                </Label>
                <Input
                  id="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => handleChange("applicationDeadline", e.target.value)}
                  className="border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc] max-w-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#c084fc] to-[#a855f7] hover:from-[#a855f7] hover:to-[#9333ea] text-white px-8 py-3 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Job Post...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Create Job Post</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 