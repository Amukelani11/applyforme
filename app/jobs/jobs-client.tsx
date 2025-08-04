"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Briefcase, MapPin, DollarSign, Calendar } from "lucide-react"
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

export function JobsClient() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJobType, setSelectedJobType] = useState<string>("all")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from("job_postings")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (error) throw error
        setJobs(data || [])
      } catch (error: any) {
        console.error("Error fetching jobs:", error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [supabase, toast])

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesJobType = selectedJobType === "all" || job.job_type === selectedJobType

    return matchesSearch && matchesJobType
  })

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
          <p className="text-gray-600 mt-2">
            Browse through our curated list of job opportunities
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search jobs by title, company, or location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedJobType}
            onChange={(e) => setSelectedJobType(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Job Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-gray-500">
                  No jobs found matching your criteria
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <p className="text-gray-600">{job.company}</p>
                      <div className="mt-2 space-x-2">
                        <Badge variant="outline">{job.job_type}</Badge>
                        {job.location && (
                          <Badge variant="outline">{job.location}</Badge>
                        )}
                        {job.salary_range && (
                          <Badge variant="outline">{job.salary_range}</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Posted: {formatDate(job.created_at)}</p>
                    {job.application_deadline && (
                      <p>Application Deadline: {formatDate(job.application_deadline)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
