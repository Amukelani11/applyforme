"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Eye, X, MessageSquare, Calendar } from "lucide-react"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from "next/navigation"
import { Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Viewer } from '@react-pdf-viewer/core';

interface Application {
  id: number
  user_id: string
  job_title: string
  company: string
  status: 'applied' | 'interviewed' | 'rejected' | 'accepted'
  applied_date: string
  notes: string | null
  salary_range: string | null
  location: string | null
  contact_name: string | null
  contact_email: string | null
  next_steps: string | null
  created_at: string
  updated_at: string
}

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const supabase = createClient()

  // Initialize the default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        // Check if profile is complete
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        setIsProfileComplete(!!profileData?.full_name)

        // Fetch applications
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id)
          .order('applied_date', { ascending: false })

        if (applicationsError) throw applicationsError
        setApplications(applicationsData || [])
      } catch (error: any) {
        console.error("Error fetching applications:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [router, supabase])

  const getStatusColor = (status: Application["status"]) => {
    const colors = {
      applied: "bg-blue-100 text-blue-800",
      interviewed: "bg-green-100 text-green-800",
      accepted: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800"
    }
    return colors[status]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
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
      <div className="top-navigation bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="job-title text-xl font-bold text-gray-800">Senior Software Engineer - Frontend</div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">Open Position</Badge>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="application-count text-sm text-gray-600">
            Application <span className="font-bold text-blue-600">1</span> of <span className="font-bold">250</span>
          </div>
          
          <div className="navigation-arrows flex items-center gap-2">
            <Button variant="outline" size="sm" className="hover:bg-gray-100">
              <span className="text-lg">←</span>
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-gray-100">
              <span className="text-lg">→</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-50">
              🔍 Search
            </Button>
            <Button variant="outline" size="sm" className="text-gray-600 hover:bg-gray-100">
              ⚙️ Filter
            </Button>
          </div>
        </div>
      </div>
      <div className="left-panel bg-white shadow-lg p-6 w-80 fixed h-full border-r overflow-y-auto">
        {/* Candidate Photo & Basic Info */}
        <div className="candidate-info mb-6 text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-600">JD</span>
          </div>
          <div className="candidate-name text-2xl font-bold mb-2">John Doe</div>
          <Badge className="mb-3 bg-blue-100 text-blue-800">New Application</Badge>
          
          {/* Contact Information */}
          <div className="contact-info space-y-2 text-sm">
            <div className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer">
              <MessageSquare className="w-4 h-4" />
              <span>john.doe@example.com</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer">
              <span>📱</span>
              <span>+27 82 123 4567</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer">
              <span>💼</span>
              <span>LinkedIn Profile</span>
            </div>
          </div>
        </div>

        {/* AI Score Display */}
        <div className="ai-score bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 mb-6 text-center">
          <div className="text-4xl font-bold text-green-600 mb-1">85</div>
          <div className="text-sm text-gray-600 mb-2">Overall Match Score</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
          </div>
          <div className="text-xs text-gray-500 mt-2">Skills: 90% • Experience: 80%</div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions space-y-3 mb-6">
          <Button className="bg-green-600 hover:bg-green-700 text-white w-full py-3 font-semibold">
            ✓ Shortlist Candidate
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white w-full py-3 font-semibold">
            ✗ Reject Application
          </Button>
          <Button className="bg-gray-600 hover:bg-gray-700 text-white w-full py-3 font-semibold">
            💬 Add Comment
          </Button>
          <Button variant="outline" className="w-full py-3 font-semibold border-blue-300 text-blue-600 hover:bg-blue-50">
            📧 Send Message
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-3 text-gray-800">Quick Stats</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Experience:</span>
              <span className="font-medium">5+ years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Education:</span>
              <span className="font-medium">BSc Computer Science</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">Cape Town</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Salary Exp:</span>
              <span className="font-medium">R45k - R55k</span>
            </div>
          </div>
        </div>

        {/* Application Timeline */}
        <div className="timeline">
          <h4 className="font-semibold mb-3 text-gray-800">Application Timeline</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium">Application Received</div>
                <div className="text-gray-500">March 15, 2024 • 2:30 PM</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <div className="font-medium">AI Analysis Complete</div>
                <div className="text-gray-500">March 15, 2024 • 2:35 PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="main-content ml-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c084fc]"></div>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {isProfileComplete 
                      ? "We're actively searching for jobs that match your profile. Check back soon for new opportunities!"
                      : "Complete your profile to help us find the perfect opportunities for you."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          {application.job_title}
                        </TableCell>
                        <TableCell>{application.company}</TableCell>
                        <TableCell>{formatDate(application.applied_date)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(application.updated_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Calendar className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        {/* AI Insights Summary Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-700">AI Insights Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-green-600 mb-2">Key Highlights</h3>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Strong match for React and Node.js skills</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Extensive experience in e-commerce platform development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>5+ years of frontend development experience</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-orange-600 mb-2">Potential Concerns</h3>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">⚠</span>
                    <span>Limited experience with cloud infrastructure (AWS)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">⚠</span>
                    <span>Gap in employment history 2022-2023</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Badge variant="outline" className="bg-blue-50">High Confidence</Badge>
                <span>•</span>
                <button className="text-blue-600 hover:underline">Why this score?</button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV Viewer Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">CV Viewer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 border rounded-lg overflow-hidden">
              <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                <Viewer fileUrl="/placeholder-cv.pdf" plugins={[defaultLayoutPluginInstance]} />
              </Worker>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">AI Analysis: Skills & Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Skills Match */}
              <div>
                <h3 className="font-semibold mb-3">Skills Match</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Required Skills</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">React</span>
                        <span className="text-green-500">✓</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Node.js</span>
                        <span className="text-green-500">✓</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">TypeScript</span>
                        <span className="text-yellow-500">~</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">AWS</span>
                        <span className="text-red-500">✗</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Additional Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">MongoDB</Badge>
                      <Badge variant="secondary">GraphQL</Badge>
                      <Badge variant="secondary">Docker</Badge>
                      <Badge variant="secondary">Git</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience Relevance */}
              <div>
                <h3 className="font-semibold mb-3">Experience Relevance</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium">Senior Frontend Developer - TechCorp (2020-2022)</h4>
                    <p className="text-sm text-gray-600">Built React applications for e-commerce platform, directly relevant to role requirements.</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Frontend Developer - StartupXYZ (2018-2020)</h4>
                    <p className="text-sm text-gray-600">Developed user interfaces using modern JavaScript frameworks.</p>
                  </div>
                </div>
              </div>

              {/* Keywords Detected */}
              <div>
                <h3 className="font-semibold mb-3">Keywords Detected</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-100 text-green-800">React</Badge>
                  <Badge className="bg-green-100 text-green-800">JavaScript</Badge>
                  <Badge className="bg-green-100 text-green-800">Frontend</Badge>
                  <Badge className="bg-blue-100 text-blue-800">E-commerce</Badge>
                  <Badge className="bg-blue-100 text-blue-800">Responsive</Badge>
                  <Badge className="bg-purple-100 text-purple-800">Team Lead</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Review Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Manual Review & Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Overall Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="text-2xl text-yellow-400 hover:text-yellow-500">
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comments</label>
                <textarea 
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                  placeholder="Add your notes about this candidate..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comment Type</label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Interview Notes</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Skills Gap</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Culture Fit</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Salary Expectation</Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Follow-up Needed</Badge>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Save Comments</Button>
            </div>
          </CardContent>
        </Card>

        {/* Application Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Application Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Application Date</label>
                <p className="text-sm">March 15, 2024</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Source</label>
                <p className="text-sm">LinkedIn</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expected Salary</label>
                <p className="text-sm">R45,000 - R55,000</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notice Period</label>
                <p className="text-sm">1 month</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Availability</label>
                <p className="text-sm">Available for interviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 