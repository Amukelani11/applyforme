"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabaseClient"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: string | null
  subscription_status: string
  subscription_plan: string | null
  trial_end: string | null
  created_at: string
  updated_at: string
}

interface WorkExperience {
  id?: string
  user_id: string
  company_name: string
  job_title: string
  start_date: string
  end_date: string | null
  current_job: boolean
  description: string | null
  location: string | null
  created_at?: string
  updated_at?: string
}

interface Education {
  id?: number
  user_id: string
  institution_name: string
  degree: string
  field_of_study: string
  start_date: string
  end_date: string | null
  current_education: boolean
  description: string | null
  location: string | null
  created_at?: string
  updated_at?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    work_experience: [] as WorkExperience[],
    education: [] as Education[]
  })

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (!session?.user) {
          router.push('/signin')
          return
        }

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userError) throw userError
        setUser(userData)
        setFormData(prev => ({
          ...prev,
          full_name: userData.full_name || '',
          phone: userData.phone || '',
          address: userData.address || ''
        }))

        // Fetch work experience
        const { data: workData, error: workError } = await supabase
          .from('work_experience')
          .select('*')
          .eq('user_id', session.user.id)

        if (workError) throw workError
        setFormData(prev => ({
          ...prev,
          work_experience: workData || []
        }))

        // Fetch education
        const { data: educationData, error: educationError } = await supabase
          .from('education')
          .select('*')
          .eq('user_id', session.user.id)

        if (educationError) throw educationError
        setFormData(prev => ({
          ...prev,
          education: educationData || []
        }))

      } catch (err: any) {
        console.error('Error loading profile:', err)
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleWorkExperienceChange = (index: number, field: keyof WorkExperience, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      work_experience: prev.work_experience.map((exp, idx) => 
        idx === index ? { 
          ...exp, 
          [field]: field === 'current_job' ? value : (value === '' ? null : value)
        } : exp
      )
    }))
  }

  const handleEducationChange = (index: number, field: keyof Education, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => {
        if (i === index) {
          return {
            ...edu,
            [field]: value,
            // If current_education is true, set end_date to null
            ...(field === 'current_education' && value === true ? { end_date: null } : {})
          }
        }
        return edu
      })
    }))
  }

  const handleAddWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      work_experience: [
        ...prev.work_experience,
        {
          user_id: user?.id || '',
          company_name: '',
          job_title: '',
          start_date: '',
          end_date: null,
          current_job: false,
          description: null,
          location: null
        } as WorkExperience
      ]
    }))
  }

  const handleRemoveWorkExperience = async (index: number) => {
    const exp = formData.work_experience[index]
    if (exp.id) {
      try {
        const { error } = await supabase
          .from('work_experience')
          .delete()
          .eq('id', exp.id)

        if (error) throw error
      } catch (err: any) {
        setError(err.message)
        return
      }
    }

    setFormData(prev => ({
      ...prev,
      work_experience: prev.work_experience.filter((_, i) => i !== index)
    }))
  }

  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          user_id: user?.id || '',
          institution_name: '',
          degree: '',
          field_of_study: '',
          start_date: '',
          end_date: null,
          current_education: false,
          description: null,
          location: null
        }
      ]
    }))
  }

  const handleRemoveEducation = async (index: number) => {
    const edu = formData.education[index]
    if (edu.id) {
      try {
        const { error } = await supabase
          .from('education')
          .delete()
          .eq('id', edu.id)

        if (error) throw error
      } catch (err: any) {
        setError(err.message)
        return
      }
    }

    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!user?.id) {
        throw new Error('User not found')
      }

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          address: formData.address || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (userError) throw userError

      // Update work experience
      for (const exp of formData.work_experience) {
        if (exp.id) {
          const { error } = await supabase
            .from('work_experience')
            .update({
              company_name: exp.company_name,
              job_title: exp.job_title,
              start_date: exp.start_date,
              end_date: exp.current_job ? null : exp.end_date,
              current_job: exp.current_job,
              description: exp.description || null,
              location: exp.location || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', exp.id)

          if (error) throw error
        } else {
          const { error } = await supabase
            .from('work_experience')
            .insert({
              user_id: user.id,
              company_name: exp.company_name,
              job_title: exp.job_title,
              start_date: exp.start_date,
              end_date: exp.current_job ? null : exp.end_date,
              current_job: exp.current_job,
              description: exp.description || null,
              location: exp.location || null
            })

          if (error) throw error
        }
      }

      // Update education
      for (const edu of formData.education) {
        if (edu.id) {
          const { error } = await supabase
            .from('education')
            .update({
              institution_name: edu.institution_name,
              degree: edu.degree,
              field_of_study: edu.field_of_study,
              start_date: edu.start_date,
              end_date: edu.current_education ? null : edu.end_date,
              current_education: edu.current_education,
              description: edu.description || null,
              location: edu.location || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', edu.id)

          if (error) throw error
        } else {
          const { error } = await supabase
            .from('education')
            .insert({
              user_id: user.id,
              institution_name: edu.institution_name,
              degree: edu.degree,
              field_of_study: edu.field_of_study,
              start_date: edu.start_date,
              end_date: edu.current_education ? null : edu.end_date,
              current_education: edu.current_education,
              description: edu.description || null,
              location: edu.location || null
            })

          if (error) throw error
        }
      }

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error saving profile:', error)
      setError(error.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c084fc] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#c084fc] hover:bg-[#a855f7]"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-[#c084fc]">
              Complete Your Profile
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Fill in your details to get started with job applications
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <Input
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <Textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Work Experience */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Work Experience</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddWorkExperience}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Experience
                  </Button>
                </div>
                {formData.work_experience.map((exp, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Experience {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveWorkExperience(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={exp.company_name}
                          onChange={(e) => handleWorkExperienceChange(index, 'company_name', e.target.value)}
                          required
                          placeholder="Enter company name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Job Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={exp.job_title}
                          onChange={(e) => handleWorkExperienceChange(index, 'job_title', e.target.value)}
                          required
                          placeholder="Enter job title"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          value={exp.start_date}
                          onChange={(e) => handleWorkExperienceChange(index, 'start_date', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <Input
                          type="date"
                          value={exp.end_date || ''}
                          onChange={(e) => handleWorkExperienceChange(index, 'end_date', e.target.value)}
                          placeholder="Select end date (optional)"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <Textarea
                        value={exp.description || ''}
                        onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                        placeholder="Enter job description (optional)"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Education</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddEducation}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Education
                  </Button>
                </div>
                {formData.education.map((edu, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Education {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEducation(index)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Institution Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={edu.institution_name}
                          onChange={(e) => handleEducationChange(index, 'institution_name', e.target.value)}
                          required
                          placeholder="Enter institution name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Degree <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          required
                          placeholder="Enter degree"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Field of Study <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={edu.field_of_study}
                          onChange={(e) => handleEducationChange(index, 'field_of_study', e.target.value)}
                          required
                          placeholder="Enter field of study"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          value={edu.start_date}
                          onChange={(e) => handleEducationChange(index, 'start_date', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <Input
                          type="date"
                          value={edu.end_date || ''}
                          onChange={(e) => handleEducationChange(index, 'end_date', e.target.value)}
                          placeholder="Select end date (optional)"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`current-education-${index}`}
                          checked={edu.current_education}
                          onCheckedChange={(checked) => handleEducationChange(index, 'current_education', checked)}
                        />
                        <label htmlFor={`current-education-${index}`} className="text-sm font-medium text-gray-700">
                          Currently Studying
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <Textarea
                        value={edu.description || ''}
                        onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                        placeholder="Enter description (optional)"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#c084fc] hover:bg-[#a855f7]"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 