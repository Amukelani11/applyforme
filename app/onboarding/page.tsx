"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { ArrowRight, User, Briefcase, MapPin, GraduationCap, Award, FileText } from "lucide-react"

function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    location: "",
    job_title: "",
    experience_level: "",
    education: "",
    skills: "",
    bio: "",
    linkedin_url: "",
    portfolio_url: "",
    resume: null as File | null,
    cover_letter: null as File | null,
    job_preferences: {
      remote_work: false,
      relocation: false,
      salary_min: "",
      industries: [] as string[],
      job_types: [] as string[]
    }
  })

  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setFormData(prev => ({
            ...prev,
            full_name: profile.full_name || "",
            phone: profile.phone || "",
            location: profile.location || "",
            job_title: profile.job_title || "",
            experience_level: profile.experience_level || "",
            education: profile.education || "",
            skills: profile.skills || "",
            bio: profile.bio || "",
            linkedin_url: profile.linkedin_url || "",
            portfolio_url: profile.portfolio_url || ""
          }))
        }
      }
    }
    fetchUserData()
  }, [supabase])

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
    const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      // Update user profile
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          job_title: formData.job_title,
          experience_level: formData.experience_level,
          education: formData.education,
          skills: formData.skills,
          bio: formData.bio,
          linkedin_url: formData.linkedin_url,
          portfolio_url: formData.portfolio_url,
          onboarding_completed: true
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
      })

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
        setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="job_title">Current/Desired Job Title *</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>
            <div>
              <Label htmlFor="experience_level">Experience Level</Label>
              <Select value={formData.experience_level} onValueChange={(value) => setFormData({ ...formData, experience_level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                  <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                  <SelectItem value="lead">Lead/Manager (10+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="e.g., Bachelor's in Computer Science"
              />
            </div>
          </div>
        )
      case 3:
  return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="skills">Skills *</Label>
              <Textarea
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="List your key skills (e.g., JavaScript, React, Python, AWS)"
                required
              />
            </div>
            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about your professional background and goals"
              />
        </div>
            <div>
              <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
              />
                        </div>
                      </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label>Job Preferences</Label>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote_work"
                    checked={formData.job_preferences.remote_work}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      job_preferences: { ...formData.job_preferences, remote_work: checked as boolean }
                    })}
                  />
                  <Label htmlFor="remote_work">Open to remote work</Label>
                        </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="relocation"
                    checked={formData.job_preferences.relocation}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      job_preferences: { ...formData.job_preferences, relocation: checked as boolean }
                    })}
                  />
                  <Label htmlFor="relocation">Open to relocation</Label>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="salary_min">Minimum Salary (Annual)</Label>
              <Input
                id="salary_min"
                value={formData.job_preferences.salary_min}
                onChange={(e) => setFormData({
                  ...formData,
                  job_preferences: { ...formData.job_preferences, salary_min: e.target.value }
                })}
                placeholder="e.g., 50000"
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3e8ff] via-[#f8fafc] to-[#e0e7ff] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">Complete Your Profile</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Let's get to know you better to find the perfect job opportunities
            </CardDescription>
              </CardHeader>
          <CardContent className="p-8">
            {/* Progress Steps */}
            <div className="flex justify-between mb-8">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep ? 'bg-[#c084fc] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-[#c084fc]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {renderStep()}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              {currentStep < 4 ? (
                <Button onClick={handleNext} className="bg-[#c084fc] hover:bg-[#a855f7]">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#c084fc] hover:bg-[#a855f7]"
                >
                  {loading ? "Saving..." : "Complete Profile"}
                </Button>
          )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#f3e8ff] via-[#f8fafc] to-[#e0e7ff] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <OnboardingForm />
    </Suspense>
  )
} 