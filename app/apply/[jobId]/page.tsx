"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface JobPosting {
  id: number
  title: string
  company: string
}

interface FormData {
  coverLetter: string
  cvFile: File | null
  additionalNotes: string
}

export default function ApplyPage({ params }: { params: { jobId: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    coverLetter: "",
    cvFile: null,
    additionalNotes: "",
  })

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/login?redirect=/apply/" + params.jobId)
          return
        }

        const { data, error } = await supabase
          .from("job_postings")
          .select("id, title, company")
          .eq("id", params.jobId)
          .single()

        if (error) throw error
        setJob(data)
      } catch (error: any) {
        console.error("Error fetching job:", error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [params.jobId, supabase, toast, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        })
        return
      }
      setFormData({ ...formData, cvFile: file })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in to apply")

      // Upload CV if provided
      let cvUrl: string | null = null
      if (formData.cvFile) {
        const fileExt = formData.cvFile.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from("cvs")
          .upload(fileName, formData.cvFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from("cvs")
          .getPublicUrl(fileName)

        cvUrl = publicUrl
      }

      // Create application record
      const { error: applicationError } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          job_id: params.jobId,
          cover_letter: formData.coverLetter,
          cv_url: cvUrl,
          additional_notes: formData.additionalNotes,
          status: "pending",
        })

      if (applicationError) throw applicationError

      toast({
        title: "Success",
        description: "Your application has been submitted successfully",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're trying to apply for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/jobs")}>Back to Jobs</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/jobs/${params.jobId}`)}
          className="mb-6"
        >
          ← Back to Job
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Apply for {job.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter
                </label>
                <Textarea
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  placeholder="Write a cover letter explaining why you're a good fit for this position..."
                  className="min-h-[200px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CV/Resume
                </label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Upload your CV (PDF, DOC, or DOCX, max 5MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="Any additional information you'd like to share..."
                  className="min-h-[100px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 