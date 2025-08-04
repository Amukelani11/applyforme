"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, DollarSign, Calendar, Building, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JobPosting {
  id: number
  title: string
  company: string
  location: string
  job_type: string
  salary_range: string
  description: string
  requirements: string
  benefits: string
  application_deadline: string
  created_at: string
}

export default function JobDetailsPage({ params }: { params: { jobId: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data, error } = await supabase
          .from("job_postings")
          .select("*")
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
  }, [params.jobId, supabase, toast])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/jobs")}>Back to Jobs</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/jobs")}
          className="mb-6"
        >
          ← Back to Jobs
        </Button>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <p className="text-xl text-gray-600 mb-4">{job.company}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {job.job_type}
                  </Badge>
                  {job.salary_range && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.salary_range}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Posted: {formatDate(job.created_at)}
                  </p>
                  {job.application_deadline && (
                    <p className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Application Deadline: {formatDate(job.application_deadline)}
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => router.push(`/apply/${job.id}`)}
              >
                Apply Now
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {job.description.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {job.requirements.split("\n").map((requirement, index) => (
                  <p key={index} className="mb-4">
                    {requirement}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {job.benefits.split("\n").map((benefit, index) => (
                  <p key={index} className="mb-4">
                    {benefit}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 