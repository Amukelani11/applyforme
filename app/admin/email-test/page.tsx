"use client"

import { useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Eye,
  Copy,
  RefreshCw
} from "lucide-react"

interface EmailTest {
  id: string
  type: string
  recipient: string
  subject: string
  status: 'pending' | 'sent' | 'failed'
  sent_at: string
  error_message?: string
}

interface EmailTemplate {
  name: string
  description: string
  subject: string
  html: string
  text: string
}

export default function EmailTestPage() {
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(false)
  const [testEmail, setTestEmail] = useState({
    to: "",
    subject: "",
    html: "",
    text: ""
  })
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [emailLogs, setEmailLogs] = useState<EmailTest[]>([])
  const [showPreview, setShowPreview] = useState(false)

  // Predefined email templates for testing
  const emailTemplates: EmailTemplate[] = [
    {
      name: "Job Posted Confirmation",
      description: "Sent when a recruiter posts a job",
      subject: "Job Posted Successfully: Senior Developer at TechCorp",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Job Posted Successfully</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .job-card { background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #c084fc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Job Posted Successfully!</h1>
              <p>Your job posting is now live and ready to receive applications</p>
            </div>
            <div class="content">
              <p>Hi John Doe,</p>
              <p>Great news! Your job posting has been successfully published and is now visible to potential candidates.</p>
              
              <div class="job-card">
                <h2>Senior Software Engineer</h2>
                <p><strong>Company:</strong> TechCorp Solutions</p>
                <p><strong>Location:</strong> Cape Town, South Africa</p>
                <p><strong>Type:</strong> Full-time</p>
                <p><strong>Salary:</strong> R800,000 - R1,200,000 (Annual)</p>
                <p><strong>Posted:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>Your job posting will start receiving applications immediately. You'll be notified via email whenever a candidate applies.</p>
              
              <a href="#" class="button">View Job Details</a>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Monitor applications in your dashboard</li>
                <li>Review candidate profiles and CVs</li>
                <li>Contact promising candidates</li>
                <li>Update job status as needed</li>
              </ul>
            </div>
            <div class="footer">
              <p>Best regards,<br>The ApplyForMe Team</p>
              <p>Need help? Contact us at support@applyforme.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Job Posted Successfully: Senior Software Engineer at TechCorp Solutions

Hi John Doe,

Great news! Your job posting has been successfully published and is now visible to potential candidates.

Job Details:
- Title: Senior Software Engineer
- Company: TechCorp Solutions
- Location: Cape Town, South Africa
- Type: Full-time
- Salary: R800,000 - R1,200,000 (Annual)
- Posted: ${new Date().toLocaleDateString()}

Your job posting will start receiving applications immediately. You'll be notified via email whenever a candidate applies.

View Job Details: https://applyforme.com/recruiter/jobs/123

Next Steps:
- Monitor applications in your dashboard
- Review candidate profiles and CVs
- Contact promising candidates
- Update job status as needed

Best regards,
The ApplyForMe Team
      `
    },
    {
      name: "Application Alert",
      description: "Sent when a candidate applies for a job",
      subject: "New Application: Sarah Johnson applied for Senior Developer",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Application Received</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .application-card { background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 New Application Received!</h1>
              <p>A candidate has applied for your job posting</p>
            </div>
            <div class="content">
              <p>Hi John Doe,</p>
              <p>You have received a new application for your job posting!</p>
              
              <div class="application-card">
                <h2>Application Details</h2>
                <p><strong>Candidate:</strong> Sarah Johnson</p>
                <p><strong>Email:</strong> sarah.johnson@email.com</p>
                <p><strong>Job:</strong> Senior Software Engineer</p>
                <p><strong>Company:</strong> TechCorp Solutions</p>
                <p><strong>Applied:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>Don't keep the candidate waiting! Review their application and CV to make a quick decision.</p>
              
              <a href="#" class="button">Review Application</a>
              
              <p><strong>Quick Actions:</strong></p>
              <ul>
                <li>Review the candidate's CV</li>
                <li>Check their profile and experience</li>
                <li>Update application status</li>
                <li>Contact the candidate if interested</li>
              </ul>
            </div>
            <div class="footer">
              <p>Best regards,<br>The ApplyForMe Team</p>
              <p>Need help? Contact us at support@applyforme.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Application: Sarah Johnson applied for Senior Software Engineer

Hi John Doe,

You have received a new application for your job posting!

Application Details:
- Candidate: Sarah Johnson
- Email: sarah.johnson@email.com
- Job: Senior Software Engineer
- Company: TechCorp Solutions
- Applied: ${new Date().toLocaleDateString()}

Don't keep the candidate waiting! Review their application and CV to make a quick decision.

Review Application: https://applyforme.com/recruiter/dashboard

Quick Actions:
- Review the candidate's CV
- Check their profile and experience
- Update application status
- Contact the candidate if interested

Best regards,
The ApplyForMe Team
      `
    },
    {
      name: "Weekly Report",
      description: "Weekly performance summary for recruiters",
      subject: "📊 Weekly Report: 15 applications received",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Weekly Report</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .stat-card { background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; text-align: center; }
            .stat-number { font-size: 2em; font-weight: bold; color: #3b82f6; }
            .top-jobs { background: white; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Weekly Performance Report</h1>
              <p>Week of ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="content">
              <p>Hi John Doe,</p>
              <p>Here's your weekly performance summary for your job postings on ApplyForMe.</p>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">15</div>
                  <div>Total Applications</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">8</div>
                  <div>New This Week</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">3</div>
                  <div>Active Jobs</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">1</div>
                  <div>Expiring Soon</div>
                </div>
              </div>
              
              <div class="top-jobs">
                <h3>🏆 Top Performing Jobs</h3>
                <ul>
                  <li><strong>Senior Software Engineer</strong> - 8 applications</li>
                  <li><strong>Frontend Developer</strong> - 5 applications</li>
                  <li><strong>DevOps Engineer</strong> - 2 applications</li>
                </ul>
              </div>
              
              <p><strong>Recommendations:</strong></p>
              <ul>
                <li>Review and respond to new applications promptly</li>
                <li>Consider extending jobs that are expiring soon</li>
                <li>Update job descriptions for better performance</li>
                <li>Engage with candidates to improve response rates</li>
              </ul>
              
              <a href="#" class="button">View Dashboard</a>
            </div>
            <div class="footer">
              <p>Best regards,<br>The ApplyForMe Team</p>
              <p>Need help? Contact us at support@applyforme.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Weekly Report: 15 applications received

Hi John Doe,

Here's your weekly performance summary for your job postings on ApplyForMe.

📊 Performance Summary (Week of ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}):
- Total Applications: 15
- New This Week: 8
- Active Jobs: 3
- Expiring Soon: 1

🏆 Top Performing Jobs:
- Senior Software Engineer: 8 applications
- Frontend Developer: 5 applications
- DevOps Engineer: 2 applications

Recommendations:
- Review and respond to new applications promptly
- Consider extending jobs that are expiring soon
- Update job descriptions for better performance
- Engage with candidates to improve response rates

View Dashboard: https://applyforme.com/recruiter/dashboard

Best regards,
The ApplyForMe Team
      `
    }
  ]

  const loadEmailLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setEmailLogs(data || [])
    } catch (error) {
      console.error('Error loading email logs:', error)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail.to || !testEmail.subject || (!testEmail.html && !testEmail.text)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/notifications/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // You can add proper auth here
        },
        body: JSON.stringify({
          to: testEmail.to,
          subject: testEmail.subject,
          html: testEmail.html,
          text: testEmail.text
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Test email sent successfully!",
        })
        setTestEmail({ to: "", subject: "", html: "", text: "" })
        loadEmailLogs() // Refresh logs
      } else {
        throw new Error(result.error || 'Failed to send email')
      }
    } catch (error: any) {
      console.error('Error sending test email:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTemplate = (templateName: string) => {
    const template = emailTemplates.find(t => t.name === templateName)
    if (template) {
      setTestEmail({
        to: "",
        subject: template.subject,
        html: template.html,
        text: template.text
      })
      setSelectedTemplate(templateName)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Testing</h1>
          <p className="text-gray-600 mt-2">Test and monitor email functionality with Resend</p>
        </div>

        <Tabs defaultValue="send" className="space-y-6">
          <TabsList>
            <TabsTrigger value="send">
              <Send className="w-4 h-4 mr-2" />
              Send Test Email
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Mail className="w-4 h-4 mr-2" />
              Email Templates
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Clock className="w-4 h-4 mr-2" />
              Email Logs
            </TabsTrigger>
          </TabsList>

          {/* Send Test Email Tab */}
          <TabsContent value="send">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Send Test Email</CardTitle>
                  <CardDescription>
                    Send a test email to verify your Resend configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="to">Recipient Email *</Label>
                    <Input
                      id="to"
                      type="email"
                      value={testEmail.to}
                      onChange={(e) => setTestEmail(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="test@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={testEmail.subject}
                      onChange={(e) => setTestEmail(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Test Email Subject"
                    />
                  </div>

                  <div>
                    <Label htmlFor="html">HTML Content</Label>
                    <Textarea
                      id="html"
                      value={testEmail.html}
                      onChange={(e) => setTestEmail(prev => ({ ...prev, html: e.target.value }))}
                      placeholder="<h1>Hello</h1><p>This is a test email.</p>"
                      rows={8}
                    />
                  </div>

                  <div>
                    <Label htmlFor="text">Plain Text Content</Label>
                    <Textarea
                      id="text"
                      value={testEmail.text}
                      onChange={(e) => setTestEmail(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Hello, this is a test email."
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={sendTestEmail}
                    disabled={loading}
                    className="w-full bg-[#c084fc] hover:bg-[#a855f7] text-white"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Email Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Email Preview
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {showPreview ? "Hide" : "Show"} Preview
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showPreview && testEmail.html ? (
                    <div 
                      className="border rounded-lg p-4 bg-white"
                      dangerouslySetInnerHTML={{ __html: testEmail.html }}
                    />
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      {testEmail.html ? "Click 'Show Preview' to see the email" : "No HTML content to preview"}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Pre-built email templates for testing different scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {emailTemplates.map((template) => (
                    <Card key={template.name} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                        <div className="space-y-2">
                          <Button
                            size="sm"
                            onClick={() => loadTemplate(template.name)}
                            className="w-full"
                          >
                            Load Template
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(template.html)}
                            className="w-full"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy HTML
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Email Logs
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadEmailLogs}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
                <CardDescription>
                  Recent email sending activity and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emailLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{log.type}</span>
                          <Badge
                            variant={
                              log.status === 'sent' ? 'default' :
                              log.status === 'failed' ? 'destructive' : 'secondary'
                            }
                          >
                            {log.status === 'sent' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {log.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {log.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {log.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(log.sent_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Recipient:</strong> {log.recipient_email}</p>
                        {log.related_id && <p><strong>Related ID:</strong> {log.related_id}</p>}
                        {log.error_message && (
                          <p className="text-red-600"><strong>Error:</strong> {log.error_message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {emailLogs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No email logs found. Send a test email to see logs here.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 