"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ChevronDown, 
  CalendarIcon, 
  Save,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"

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
  updated_at?: string
}

interface WorkExperience {
  id?: string
  user_id: string
  company_name: string
  job_title: string
  start_date: string | null
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
  start_date: string | null
  end_date: string | null
  current_education: boolean
  description: string | null
  location: string | null
  created_at?: string
  updated_at?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
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

  // Using useCallback for fetch function
  const fetchProfile = useCallback(async () => {
      try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
          return
        }

      const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (userError) throw userError
      
      const { data: workData, error: workError } = await supabase.from('work_experience').select('*').eq('user_id', user.id).order('start_date', { ascending: false })
      if (workError) throw workError

      const { data: educationData, error: educationError } = await supabase.from('education').select('*').eq('user_id', user.id).order('start_date', { ascending: false })
      if (educationError) throw educationError

        setUser(userData)
      setFormData({
          full_name: userData.full_name || '',
          phone: userData.phone || '',
        address: userData.address || '',
        work_experience: workData || [],
          education: educationData || []
      })
      } catch (err: any) {
      setError('Failed to load profile. Please try again.')
      } finally {
        setLoading(false)
      }
  }, [supabase, router])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleWorkExperienceChange = (index: number, field: keyof WorkExperience, value: any) => {
    setFormData(prev => ({
      ...prev,
      work_experience: prev.work_experience.map((exp, i) => i === index ? { ...exp, [field]: value } : exp)
    }))
  }

  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => i === index ? { ...edu, [field]: value, ...(field === 'current_education' && value === true && { end_date: null }) } : edu)
    }))
  }

  const handleAddWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      work_experience: [{
        user_id: user?.id || '', company_name: '', job_title: '',
        start_date: null, end_date: null, current_job: false,
        description: null, location: null
      }, ...prev.work_experience]
    }))
  }

  const handleRemoveWorkExperience = async (id: string, index: number) => {
    // Optimistic UI update
    const originalWorkExperience = [...formData.work_experience];
    setFormData(prev => ({
      ...prev,
      work_experience: prev.work_experience.filter((_, i) => i !== index)
    }));

    if (id) { // Only try to delete if it has an ID (i.e., it exists in the DB)
      const { error } = await supabase.from('work_experience').delete().eq('id', id)
      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete experience." })
        setFormData(prev => ({ ...prev, work_experience: originalWorkExperience })); // Revert on error
      } else {
        toast({ title: "Success", description: "Experience removed." })
      }
    }
  }

  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [{
        user_id: user?.id || '', institution_name: '', degree: '', field_of_study: '',
        start_date: null, end_date: null, current_education: false,
        description: null, location: null
      }, ...prev.education]
    }))
  }

  const handleRemoveEducation = async (id: number, index: number) => {
    const originalEducation = [...formData.education];
    setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
    if (id) {
      const { error } = await supabase.from('education').delete().eq('id', id)
      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete education." })
        setFormData(prev => ({ ...prev, education: originalEducation }));
      } else {
        toast({ title: "Success", description: "Education removed." })
      }
  }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!user?.id) throw new Error('User not found')

      const { error: userError } = await supabase.from('users').update({
        full_name: formData.full_name, phone: formData.phone, address: formData.address,
      }).eq('id', user.id)
      if (userError) throw userError

      for (const exp of formData.work_experience) {
        const data = { ...exp, user_id: user.id }
        const { error } = await supabase.from('work_experience').upsert(data)
          if (error) throw error
      }

      for (const edu of formData.education) {
        const data = { ...edu, user_id: user.id }
        const { error } = await supabase.from('education').upsert(data)
          if (error) throw error
      }

      toast({ title: "Success!", description: "Your profile has been saved." })
      await fetchProfile(); // Refresh data
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: error.message })
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-theme-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h3 className="text-lg font-bold text-red-700">An Error Occurred</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="p-4 sm:p-6 lg:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
        <Button
          variant="ghost"
        className="mb-6 text-gray-600 hover:text-theme-600"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Your Profile</h1>
          <p className="mt-3 text-lg text-gray-600">Keep your information up to date for the best job matches.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
              {/* Personal Information */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-medium text-gray-700">Full Name</label>
                <Input name="full_name" value={formData.full_name || ''} onChange={handleInputChange} required />
                  </div>
              <div className="space-y-2">
                <label className="font-medium text-gray-700">Phone Number</label>
                <Input name="phone" value={formData.phone || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-medium text-gray-700">Address</label>
              <Textarea name="address" value={formData.address || ''} onChange={handleInputChange} />
            </div>
          </section>

          <Separator />

              {/* Work Experience */}
          <section className="space-y-6">
                <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">Work Experience</h2>
              <Button type="button" variant="outline" onClick={handleAddWorkExperience} className="border-theme-600 text-theme-600 hover:bg-theme-50 hover:text-theme-700">
                <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
            <div className="space-y-4">
              <AnimatePresence>
                {formData.work_experience.map((exp, index) => (
                  <motion.div
                    key={exp.id || `new-exp-${index}`}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0, padding: 0, transition: { duration: 0.3 } }}
                  >
                    <Collapsible defaultOpen className="p-6 border rounded-lg bg-white group">
                      <div className="flex justify-between items-center">
                        <CollapsibleTrigger className="flex-grow text-left">
                          <h3 className="font-semibold text-lg text-gray-800">{exp.job_title || `Experience ${index + 1}`}</h3>
                          <p className="text-sm text-gray-500">{exp.company_name || 'New Company'}</p>
                        </CollapsibleTrigger>
                        <div className="flex items-center space-x-2">
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveWorkExperience(exp.id!, index)} className="text-gray-400 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="w-5 h-5" />
                  </Button>
                          <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-gray-400 group-data-[state=open]:rotate-180 transition-transform">
                                  <ChevronDown className="h-5 w-5" />
                      </Button>
                          </CollapsibleTrigger>
                    </div>
                      </div>
                      <CollapsibleContent className="mt-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="font-medium">Job Title</label>
                              <Input value={exp.job_title || ''} onChange={(e) => handleWorkExperienceChange(index, 'job_title', e.target.value)} required />
                          </div>
                          <div className="space-y-2">
                              <label className="font-medium">Company</label>
                              <Input value={exp.company_name || ''} onChange={(e) => handleWorkExperienceChange(index, 'company_name', e.target.value)} required />
                      </div>
                    </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="font-medium">Start Date</label>
                                <DatePicker date={exp.start_date ? new Date(exp.start_date) : null} setDate={(date) => handleWorkExperienceChange(index, 'start_date', date?.toISOString())} />
                      </div>
                            <div className="space-y-2">
                                <label className="font-medium">End Date</label>
                                <DatePicker date={exp.end_date ? new Date(exp.end_date) : null} setDate={(date) => handleWorkExperienceChange(index, 'end_date', date?.toISOString())} disabled={exp.current_job} />
                      </div>
                      </div>
                      <div className="flex items-center space-x-2">
                            <Checkbox id={`current-job-${index}`} checked={exp.current_job} onCheckedChange={(checked) => handleWorkExperienceChange(index, 'current_job', checked)} />
                            <label htmlFor={`current-job-${index}`}>I currently work here</label>
                      </div>
                        <div className="space-y-2">
                            <label className="font-medium">Description</label>
                            <Textarea value={exp.description || ''} onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)} placeholder="Describe your role and accomplishments..." />
                    </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </motion.div>
                ))}
              </AnimatePresence>
              </div>
          </section>

          <Separator />
          
          {/* Education Section */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">Education</h2>
              <Button type="button" variant="outline" onClick={handleAddEducation} className="border-theme-600 text-theme-600 hover:bg-theme-50 hover:text-theme-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </div>
            <div className="space-y-4">
              <AnimatePresence>
                {formData.education.map((edu, index) => (
                  <motion.div
                    key={edu.id || `new-edu-${index}`}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0, padding: 0, transition: { duration: 0.3 } }}
                  >
                    <Collapsible defaultOpen className="p-6 border rounded-lg bg-white group">
                      <div className="flex justify-between items-center">
                        <CollapsibleTrigger className="flex-grow text-left">
                          <h3 className="font-semibold text-lg text-gray-800">{edu.degree || `Education ${index + 1}`}</h3>
                          <p className="text-sm text-gray-500">{edu.institution_name || 'New Institution'}</p>
                        </CollapsibleTrigger>
                        <div className="flex items-center space-x-2">
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveEducation(edu.id!, index)} className="text-gray-400 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="w-5 h-5" />
                          </Button>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-400 group-data-[state=open]:rotate-180 transition-transform">
                              <ChevronDown className="h-5 w-5" />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      <CollapsibleContent className="mt-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="font-medium">Degree</label>
                            <Input value={edu.degree || ''} onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} required />
                          </div>
                          <div className="space-y-2">
                            <label className="font-medium">Institution</label>
                            <Input value={edu.institution_name || ''} onChange={(e) => handleEducationChange(index, 'institution_name', e.target.value)} required />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="font-medium">Field of Study</label>
                            <Input value={edu.field_of_study || ''} onChange={(e) => handleEducationChange(index, 'field_of_study', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <label className="font-medium">Location</label>
                            <Input value={edu.location || ''} onChange={(e) => handleEducationChange(index, 'location', e.target.value)} />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="font-medium">Start Date</label>
                            <DatePicker date={edu.start_date ? new Date(edu.start_date) : null} setDate={(date) => handleEducationChange(index, 'start_date', date?.toISOString())} />
                          </div>
                          <div className="space-y-2">
                            <label className="font-medium">End Date</label>
                            <DatePicker date={edu.end_date ? new Date(edu.end_date) : null} setDate={(date) => handleEducationChange(index, 'end_date', date?.toISOString())} disabled={edu.current_education} />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id={`current-education-${index}`} checked={edu.current_education} onCheckedChange={(checked) => handleEducationChange(index, 'current_education', checked)} />
                          <label htmlFor={`current-education-${index}`}>I am currently studying here</label>
                        </div>
                        <div className="space-y-2">
                          <label className="font-medium">Description</label>
                          <Textarea value={edu.description || ''} onChange={(e) => handleEducationChange(index, 'description', e.target.value)} placeholder="Describe your studies, achievements, etc..." />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          <footer className="flex justify-end pt-8">
            <Button type="submit" className="bg-theme-600 hover:bg-theme-700 text-white font-semibold py-3 px-6" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
          </footer>
            </form>
      </div>
    </motion.div>
  )
}

// Date Picker Component
export function DatePicker({ date, setDate, disabled }: { date: Date | null, setDate: (date: Date | null) => void, disabled?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date ?? undefined}
          onSelect={(d) => setDate(d || null)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
} 