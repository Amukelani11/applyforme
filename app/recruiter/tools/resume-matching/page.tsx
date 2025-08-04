"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Search, FileText, Target, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MatchResult {
  overallScore: number
  skillsMatch: number
  experienceMatch: number
  educationMatch: number
  matchedSkills: string[]
  missingSkills: string[]
  recommendations: string[]
}

export default function ResumeMatchingPage() {
  const [jobDescription, setJobDescription] = useState("")
  const [resumeText, setResumeText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || !resumeText.trim()) return
    
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      const result: MatchResult = {
        overallScore: 78,
        skillsMatch: 85,
        experienceMatch: 72,
        educationMatch: 90,
        matchedSkills: [
          "JavaScript", "React", "Node.js", "TypeScript", "Git"
        ],
        missingSkills: [
          "Python", "AWS", "Docker"
        ],
        recommendations: [
          "Candidate shows strong frontend development skills",
          "Consider for mid-level developer positions",
          "May need additional backend experience for senior roles"
        ]
      }
      
      setMatchResult(result)
      setIsAnalyzing(false)
    }, 3000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-yellow-100"
    return "bg-red-100"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Resume/JD Matching</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analyze how well candidate resumes match your job requirements with AI-powered insights.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Job Description Input */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[300px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Resume Input */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Resume Text
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">Drag and drop resume file here</p>
                <p className="text-xs text-gray-500">or paste resume text below</p>
              </div>
              <Textarea
                placeholder="Or paste resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Analyze Button */}
        <div className="text-center mb-8">
          <Button 
            onClick={handleAnalyze}
            disabled={!jobDescription.trim() || !resumeText.trim() || isAnalyzing}
            className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Analyzing Match...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze Match
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {matchResult && (
          <div className="space-y-8">
            {/* Overall Score */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Overall Match Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={cn(
                    "inline-flex items-center justify-center w-24 h-24 rounded-full text-2xl font-bold mb-4",
                    getScoreBg(matchResult.overallScore),
                    getScoreColor(matchResult.overallScore)
                  )}>
                    {matchResult.overallScore}%
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    {matchResult.overallScore >= 80 ? "Excellent Match" : 
                     matchResult.overallScore >= 60 ? "Good Match" : "Fair Match"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">Skills Match</h3>
                    <Progress value={matchResult.skillsMatch} className="mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{matchResult.skillsMatch}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">Experience Match</h3>
                    <Progress value={matchResult.experienceMatch} className="mb-2" />
                    <p className="text-2xl font-bold text-orange-600">{matchResult.experienceMatch}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">Education Match</h3>
                    <Progress value={matchResult.educationMatch} className="mb-2" />
                    <p className="text-2xl font-bold text-green-600">{matchResult.educationMatch}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Matched Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.matchedSkills.map((skill, index) => (
                      <Badge key={index} className="bg-green-100 text-green-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <XCircle className="h-5 w-5 mr-2 text-red-600" />
                    Missing Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.missingSkills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="border-red-200 text-red-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-purple-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {matchResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 