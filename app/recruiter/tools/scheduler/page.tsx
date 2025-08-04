"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Mail, CheckCircle, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

interface InterviewSlot {
  id: string
  date: string
  time: string
  duration: number
  type: string
  interviewer: string
  candidate: string
  jobTitle: string
  status: 'scheduled' | 'pending' | 'completed'
}

export default function SchedulerPage() {
  const [candidateName, setCandidateName] = useState("")
  const [candidateEmail, setCandidateEmail] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [interviewType, setInterviewType] = useState("")
  const [duration, setDuration] = useState("")
  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduledInterviews, setScheduledInterviews] = useState<InterviewSlot[]>([])

  const handleSchedule = async () => {
    if (!candidateName.trim() || !candidateEmail.trim() || !jobTitle.trim() || !interviewType || !duration) return
    
    setIsScheduling(true)
    
    // Simulate scheduling
    setTimeout(() => {
      const newInterview: InterviewSlot = {
        id: Date.now().toString(),
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
        time: "10:00 AM",
        duration: parseInt(duration),
        type: interviewType,
        interviewer: "Sarah Johnson",
        candidate: candidateName,
        jobTitle: jobTitle,
        status: 'scheduled'
      }
      
      setScheduledInterviews([newInterview, ...scheduledInterviews])
      
      // Reset form
      setCandidateName("")
      setCandidateEmail("")
      setJobTitle("")
      setInterviewType("")
      setDuration("")
      
      setIsScheduling(false)
    }, 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-orange-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Smart Scheduler</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Automate interview scheduling with calendar integration and smart time slot management.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scheduling Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
                Schedule Interview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Candidate Name
                  </label>
                  <Input
                    placeholder="John Doe"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Candidate Email
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <Input
                  placeholder="Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Type
                  </label>
                  <Select value={interviewType} onValueChange={setInterviewType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Screen</SelectItem>
                      <SelectItem value="video">Video Interview</SelectItem>
                      <SelectItem value="onsite">On-site Interview</SelectItem>
                      <SelectItem value="technical">Technical Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleSchedule}
                disabled={!candidateName.trim() || !candidateEmail.trim() || !jobTitle.trim() || !interviewType || !duration || isScheduling}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isScheduling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Scheduling Interview...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-600" />
                Upcoming Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledInterviews.length > 0 ? (
                <div className="space-y-4">
                  {scheduledInterviews.map((interview) => (
                    <div key={interview.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{interview.candidate}</h4>
                          <p className="text-sm text-gray-600">{interview.jobTitle}</p>
                        </div>
                        <Badge className={getStatusColor(interview.status)}>
                          {interview.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Date & Time</p>
                          <p className="font-medium">{interview.date} at {interview.time}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Duration</p>
                          <p className="font-medium">{interview.duration} minutes</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Type</p>
                          <p className="font-medium capitalize">{interview.type}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Interviewer</p>
                          <p className="font-medium">{interview.interviewer}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <Mail className="h-3 w-3 mr-1" />
                          Send Reminder
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No upcoming interviews scheduled</p>
                  <p className="text-sm text-gray-400">Schedule your first interview to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col">
                  <Calendar className="h-5 w-5 mb-2" />
                  <span>View Calendar</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Mail className="h-5 w-5 mb-2" />
                  <span>Send Bulk Invites</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <CheckCircle className="h-5 w-5 mb-2" />
                  <span>Mark Complete</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 