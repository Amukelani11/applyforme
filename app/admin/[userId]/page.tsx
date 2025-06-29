"use client"

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, GraduationCap, Briefcase, Award, Users, CreditCard, Send } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"

interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  subscription_status: string;
  subscription_plan: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkExperience {
  id: number;
  user_id: string;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  location: string | null;
}

interface Education {
  id: number;
  user_id: string;
  institution_name: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  location: string | null;
  current_education: boolean;
}

interface Certification {
  id: number;
  user_id: string;
  name: string;
  issuer: string;
  date_obtained: string;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
}

interface Application {
  id: number;
  user_id: string;
  job_title: string;
  company: string;
  status: string;
  applied_date: string;
  notes: string | null;
  salary_range: string | null;
  location: string | null;
  contact_name: string | null;
  contact_email: string | null;
  next_steps: string | null;
}

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
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const [user, setUser] = useState<User | null>(null);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is admin
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login');
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;
        if (!userData.is_admin) {
          router.push('/dashboard');
          return;
        }

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;
        setUser(profileData);

        // Fetch work experience
        const { data: workData, error: workError } = await supabase
          .from('work_experience')
          .select('*')
          .eq('user_id', userId)
          .order('start_date', { ascending: false });

        if (workError) throw workError;
        setWorkExperience(workData || []);

        // Fetch education
        const { data: educationData, error: educationError } = await supabase
          .from('education')
          .select('*')
          .eq('user_id', userId)
          .order('start_date', { ascending: false });

        if (educationError) throw educationError;
        setEducation(educationData || []);

        // Fetch user's CV
        const { data: cvData, error: cvError } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", userId)
          .eq("type", "cv")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!cvError && cvData) {
          setCvUrl(cvData.url);
        }

        // Fetch applications
        const { data: appData, error: appError } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', userId)
          .order('applied_date', { ascending: false });

        if (appError) throw appError;
        setApplications(appData || []);

        // Fetch certifications
        const { data: certData, error: certError } = await supabase
          .from('certifications')
          .select('*')
          .eq('user_id', userId)
          .order('date_obtained', { ascending: false });

        if (certError) throw certError;
        setCertifications(certData || []);

      } catch (err: any) {
        console.error("Error loading user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [router, supabase, userId]);

  useEffect(() => {
    const fetchJobPostings = async () => {
      try {
        const { data, error } = await supabase
          .from("job_postings")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (error) throw error
        setJobPostings(data || [])
      } catch (error: any) {
        console.error("Error fetching job postings:", error)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    }

    fetchJobPostings()
  }, [supabase, toast])

  const handleDownloadCV = async () => {
    if (!cvUrl) return;

    try {
      const { data } = await supabase.storage
        .from('documents')
        .createSignedUrl(cvUrl, 60);

      if (data && 'signedUrl' in data) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      console.error('Error downloading CV:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmitApplication = () => {
    router.push(`/submit-job?userId=${userId}`);
  };

  const handleSubmitCV = async () => {
    if (!selectedJobId || !cvUrl) {
      toast({
        title: "Error",
        description: "Please select a job and ensure the user has a CV uploaded",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("candidate_applications").insert({
        job_posting_id: parseInt(selectedJobId),
        user_id: userId,
        cv_url: cvUrl,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "CV submitted successfully!",
      })

      setSelectedJobId("")
    } catch (error: any) {
      console.error("Error submitting CV:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c084fc] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
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
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">User not found</p>
          <Link href="/admin">
            <Button className="bg-[#c084fc] hover:bg-[#a855f7]">
              Back to Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{user.full_name || 'User Profile'}</h1>
        <Link href="/admin">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
              <p><strong>Address:</strong> {user.address || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Status:</strong>{' '}
                <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'}>
                  {user.subscription_plan || 'Trial'}
                </Badge>
              </p>
              <p><strong>Trial End:</strong> {user.trial_end ? new Date(user.trial_end).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleDownloadCV}
                disabled={!cvUrl}
              >
                <Download className="h-4 w-4 mr-2" />
                {cvUrl ? "Download CV" : "No CV Available"}
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleSubmitApplication}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Submit CV to Recruiter</CardTitle>
          <CardDescription>
            Submit the user's CV to a recruiter for a specific job posting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="jobPosting">Select Job Posting</Label>
              <Select
                value={selectedJobId}
                onValueChange={setSelectedJobId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job posting" />
                </SelectTrigger>
                <SelectContent>
                  {jobPostings.map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      {job.title} at {job.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmitCV}
              disabled={!selectedJobId || !cvUrl || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit CV"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="experience" className="space-y-4">
        <TabsList>
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Work Experience
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Applications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workExperience.map((exp) => (
                  <div key={exp.id} className="border-b pb-4 last:border-0">
                    <h3 className="text-lg font-semibold">{exp.job_title}</h3>
                    <p className="text-gray-600">{exp.company_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(exp.start_date).toLocaleDateString()} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}
                    </p>
                    {exp.location && <p className="text-sm text-gray-500">{exp.location}</p>}
                    {exp.description && <p className="mt-2 text-gray-700">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {education.map((edu) => (
                  <div key={edu.id} className="border-b pb-4 last:border-0">
                    <h3 className="text-lg font-semibold">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.institution_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(edu.start_date).toLocaleDateString()} - {edu.current_education ? 'Present' : edu.end_date ? new Date(edu.end_date).toLocaleDateString() : 'N/A'}
                    </p>
                    {edu.field_of_study && <p className="text-sm text-gray-500">Field of Study: {edu.field_of_study}</p>}
                    {edu.location && <p className="text-sm text-gray-500">{edu.location}</p>}
                    {edu.description && <p className="mt-2 text-gray-700">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications">
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {certifications.map((cert) => (
                  <div key={cert.id} className="border-b pb-4 last:border-0">
                    <h3 className="text-lg font-semibold">{cert.name}</h3>
                    <p className="text-gray-600">{cert.issuer}</p>
                    <p className="text-sm text-gray-500">
                      Issued: {new Date(cert.date_obtained).toLocaleDateString()}
                      {cert.expiry_date && ` - Expires: ${new Date(cert.expiry_date).toLocaleDateString()}`}
                    </p>
                    {cert.credential_id && <p className="text-sm text-gray-500">Credential ID: {cert.credential_id}</p>}
                    {cert.credential_url && (
                      <a 
                        href={cert.credential_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Credential
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {applications.map((app) => (
                  <div key={app.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{app.job_title}</h3>
                        <p className="text-gray-600">{app.company}</p>
                        <p className="text-sm text-gray-500">
                          Applied: {new Date(app.applied_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        app.status === 'accepted' ? 'default' :
                        app.status === 'rejected' ? 'destructive' :
                        app.status === 'interviewed' ? 'secondary' : 'outline'
                      }>
                        {app.status}
                      </Badge>
                    </div>
                    {app.location && <p className="text-sm text-gray-500">{app.location}</p>}
                    {app.salary_range && <p className="text-sm text-gray-500">Salary Range: {app.salary_range}</p>}
                    {app.contact_name && <p className="text-sm text-gray-500">Contact: {app.contact_name}</p>}
                    {app.contact_email && <p className="text-sm text-gray-500">Email: {app.contact_email}</p>}
                    {app.notes && <p className="mt-2 text-gray-700">{app.notes}</p>}
                    {app.next_steps && <p className="mt-2 text-gray-700">Next Steps: {app.next_steps}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 