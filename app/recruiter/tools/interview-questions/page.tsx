"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ListChecks, Copy, Sparkles, Target, Users, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuestionSet {
  behavioral: string[]
  technical: string[]
  situational: string[]
  culture: string[]
}

export default function InterviewQuestionsPage() {
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [questions, setQuestions] = useState<QuestionSet | null>(null)

  const handleGenerate = async () => {
    if (!jobTitle.trim() || !jobDescription.trim() || !experienceLevel) return
    
    setIsGenerating(true)
    
    // Simulate AI generation
    setTimeout(() => {
      const generatedQuestions: QuestionSet = {
        behavioral: [
          "Tell me about a time when you had to lead a team through a challenging project. What was your approach and what was the outcome?",
          "Describe a situation where you had to resolve a conflict between team members. How did you handle it?",
          "Can you share an example of when you had to adapt to a significant change in your work environment?",
          "Tell me about a time when you went above and beyond to deliver exceptional results for a client or stakeholder."
        ],
        technical: [
          "Walk me through your approach to debugging a complex technical issue.",
          "How do you stay updated with the latest industry trends and technologies?",
          "Describe a technical challenge you faced and how you solved it.",
          "What's your process for code review and ensuring code quality?"
        ],
        situational: [
          "If you were given a project with an unrealistic deadline, how would you handle it?",
          "How would you approach mentoring a junior team member who is struggling?",
          "What would you do if you discovered a critical bug in production right before a major release?",
          "How do you prioritize multiple competing deadlines and responsibilities?"
        ],
        culture: [
          "What does work-life balance mean to you, and how do you maintain it?",
          "How do you handle feedback, both giving and receiving it?",
          "What motivates you to do your best work?",
          "How do you contribute to creating a positive team environment?"
        ]
      }
      
      setQuestions(generatedQuestions)
      setIsGenerating(false)
    }, 2500)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyAllQuestions = () => {
    if (!questions) return
    
    const allQuestions = [
      "BEHAVIORAL QUESTIONS:",
      ...questions.behavioral.map((q, i) => `${i + 1}. ${q}`),
      "\nTECHNICAL QUESTIONS:",
      ...questions.technical.map((q, i) => `${i + 1}. ${q}`),
      "\nSITUATIONAL QUESTIONS:",
      ...questions.situational.map((q, i) => `${i + 1}. ${q}`),
      "\nCULTURE FIT QUESTIONS:",
      ...questions.culture.map((q, i) => `${i + 1}. ${q}`)
    ].join("\n\n")
    
    copyToClipboard(allQuestions)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <ListChecks className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Interview Questions Generator</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Generate tailored interview questions for any role with AI-powered insights and best practices.
          </p>
        </div>

        {/* Input Form */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <Input
                  placeholder="e.g., Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead/Manager</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <Textarea
                placeholder="Paste the job description or key requirements..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={!jobTitle.trim() || !jobDescription.trim() || !experienceLevel || isGenerating}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Interview Questions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {questions && (
          <div className="space-y-8">
            {/* Copy All Button */}
            <div className="text-center">
              <Button 
                onClick={copyAllQuestions}
                variant="outline"
                className="bg-white hover:bg-gray-50"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All Questions
              </Button>
            </div>

            {/* Question Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Behavioral Questions */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Behavioral Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questions.behavioral.map((question, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {index + 1}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(question)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700">{question}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Technical Questions */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-green-600" />
                    Technical Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questions.technical.map((question, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {index + 1}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(question)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700">{question}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Situational Questions */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-orange-600" />
                    Situational Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questions.situational.map((question, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            {index + 1}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(question)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700">{question}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Culture Fit Questions */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    Culture Fit Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questions.culture.map((question, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            {index + 1}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(question)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700">{question}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 