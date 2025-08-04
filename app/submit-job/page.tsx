"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  jobTitle: string
  company: string
  location: string
  salaryRange: string
  jobSpec: string
  jobSpecFile: File | null
  notes: string
}

function SubmitJobForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId")
  const [formData, setFormData] = useState<FormData>({
    jobTitle: "",
    company: "",
    location: "",
    salaryRange: "",
    jobSpec: "",
    jobSpecFile: null,
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single()

        if (error) throw error
        setUser(data)
      } catch (err: any) {
        console.error("Error fetching user:", err)
        toast({
          title: "Error",
          description: "Failed to fetch user data. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchUser()
  }, [userId, supabase, toast])

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        jobSpecFile: file,
        jobSpec: "", // Clear text input when file is selected
      }))
    }
  }

  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      jobSpecFile: null,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      toast({
        title: "Error",
        description: "No user selected. Please try again.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      let jobSpecUrl: string | null = null

      // If there's a file, upload it first
      if (formData.jobSpecFile) {
        setUploadingFile(true)
        const fileExt = formData.jobSpecFile.name.split('.').pop()
        const fileName = `job-specs/${userId}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, formData.jobSpecFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName)

        jobSpecUrl = publicUrl
        setUploadingFile(false)
      }

      // Create application record
      const { data, error } = await supabase
        .from("applications")
        .insert({
          user_id: userId,
          job_title: formData.jobTitle,
          company: formData.company,
          status: "pending",
          location: formData.location || null,
          salary_range: formData.salaryRange || null,
          notes: formData.notes || null,
          job_spec: formData.jobSpec || null,
          job_spec_url: jobSpecUrl,
          applied_date: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Job application submitted successfully!",
      })

      // Redirect to admin page
      router.push("/admin")
    } catch (err: any) {
      console.error("Error submitting application:", err)
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Submit New Job</h1>
          <p className="text-gray-600 mt-2">
            {user ? `Submitting job application for ${user.full_name || user.email}` : "Loading user data..."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Provide the job information and we'll handle the application process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => handleChange("jobTitle", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="salaryRange">Salary Range</Label>
                <Input
                  id="salaryRange"
                  value={formData.salaryRange}
                  onChange={(e) => handleChange("salaryRange", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="jobSpec">Job Specification *</Label>
                <div className="mt-1 space-y-2">
                  <Textarea
                    id="jobSpec"
                    value={formData.jobSpec}
                    onChange={(e) => handleChange("jobSpec", e.target.value)}
                    placeholder="Enter job description and requirements..."
                    className="min-h-[100px]"
                    disabled={!!formData.jobSpecFile}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                      id="jobSpecFile"
                      disabled={!!formData.jobSpec}
                    />
                    <label htmlFor="jobSpecFile">
                      <Button type="button" variant="outline" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Job Spec
                      </Button>
                    </label>
                    {formData.jobSpecFile && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{formData.jobSpecFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={removeFile}
                          className="h-6 w-6"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Enter job details in the text area above or upload a document (PDF, DOC, DOCX, TXT)
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Any additional notes about this application..."
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !userId || uploadingFile || (!formData.jobSpec && !formData.jobSpecFile)} 
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Submit Job Application"}
                </Button>
                <Link href="/admin">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}

export default function SubmitJobPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Submit New Job</h1>
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SubmitJobForm />
    </Suspense>
  )
}
