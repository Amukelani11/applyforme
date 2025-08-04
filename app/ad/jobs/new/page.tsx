"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Wand2, 
  Share2, 
  Copy, 
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Building2,
  Link,
  CheckCircle,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdJobPostingPage() {
  const [mounted, setMounted] = useState(false)
  const [jobData, setJobData] = useState({
    title: "Senior Software Engineer",
    company: "TechCorp South Africa",
    location: "Johannesburg, South Africa",
    type: "Full-time",
    salary: "R45,000 - R65,000 per month",
    description: `We are looking for a Senior Software Engineer to join our growing team in Johannesburg. You will be responsible for developing and maintaining high-quality software solutions.

**Key Responsibilities:**
- Design and implement scalable software solutions
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews and technical discussions
- Contribute to architectural decisions

**Requirements:**
- 5+ years of software development experience
- Strong knowledge of React, Node.js, and TypeScript
- Experience with cloud platforms (AWS/Azure)
- Excellent problem-solving skills
- Strong communication abilities

**Benefits:**
- Competitive salary package
- Flexible working arrangements
- Professional development opportunities
- Health insurance
- Annual bonus structure`,
    requirements: "React, Node.js, TypeScript, AWS, 5+ years experience",
    benefits: "Flexible work, Health insurance, Annual bonus, Professional development"
  })

  const [publicLink, setPublicLink] = useState("https://applyforme.co.za/jobs/techcorp/senior-software-engineer-12345")
  const [isOptimized, setIsOptimized] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleOptimize = () => {
    setIsOptimized(true)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(publicLink)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="px-12 py-20 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Create Job Posting
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Create professional job postings with AI optimization. Share your jobs anywhere 
            with public links - LinkedIn, WhatsApp, your website, or anywhere else.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Job Details</span>
                  <div className="flex items-center space-x-2">
                    {isOptimized && (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        AI Optimized
                      </Badge>
                    )}
                    <Button size="sm" onClick={handleOptimize}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Optimize with AI
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={jobData.title}
                      onChange={(e) => setJobData({...jobData, title: e.target.value})}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={jobData.company}
                      onChange={(e) => setJobData({...jobData, company: e.target.value})}
                      placeholder="e.g., TechCorp South Africa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={jobData.location}
                      onChange={(e) => setJobData({...jobData, location: e.target.value})}
                      placeholder="e.g., Johannesburg, South Africa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Job Type</Label>
                    <Input
                      id="type"
                      value={jobData.type}
                      onChange={(e) => setJobData({...jobData, type: e.target.value})}
                      placeholder="e.g., Full-time"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary">Salary Range</Label>
                    <Input
                      id="salary"
                      value={jobData.salary}
                      onChange={(e) => setJobData({...jobData, salary: e.target.value})}
                      placeholder="e.g., R45,000 - R65,000"
                    />
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    value={jobData.description}
                    onChange={(e) => setJobData({...jobData, description: e.target.value})}
                    placeholder="Enter detailed job description..."
                    rows={12}
                    className="resize-none"
                  />
                </div>

                {/* Requirements & Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requirements">Key Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={jobData.requirements}
                      onChange={(e) => setJobData({...jobData, requirements: e.target.value})}
                      placeholder="e.g., React, Node.js, 5+ years experience"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="benefits">Benefits</Label>
                    <Textarea
                      id="benefits"
                      value={jobData.benefits}
                      onChange={(e) => setJobData({...jobData, benefits: e.target.value})}
                      placeholder="e.g., Flexible work, Health insurance"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6">
                  <Button variant="outline">
                    Save as Draft
                  </Button>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline">
                      Preview
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Publish Job
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Sharing */}
          <div className="lg:col-span-1 space-y-6">
            {/* Job Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Job Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg text-gray-900">{jobData.title}</h3>
                  <p className="text-gray-600">{jobData.company}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {jobData.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {jobData.type}
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {jobData.salary}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Public Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Link className="w-5 h-5 mr-2" />
                  Public Job Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium mb-2">
                    Share this link anywhere:
                  </p>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={publicLink}
                      readOnly
                      className="text-sm bg-white"
                    />
                    <Button size="sm" variant="outline" onClick={handleShare}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">Share on:</p>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-1" />
                      LinkedIn
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Optimization Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">SEO Score</span>
                    <Badge className="bg-green-100 text-green-700">92/100</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Readability</span>
                    <Badge className="bg-blue-100 text-blue-700">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Keyword Density</span>
                    <Badge className="bg-purple-100 text-purple-700">Optimal</Badge>
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Job posting is optimized for maximum visibility
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Expected Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">150+</div>
                    <div className="text-xs text-blue-600">Expected Views</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">25+</div>
                    <div className="text-xs text-green-600">Expected Applications</div>
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">85%</div>
                  <div className="text-xs text-purple-600">Match Rate</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 