'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Loader2, CheckCircle, AlertCircle, Briefcase, Star, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface QualificationSummary {
  summary: string
  keySkills: string[]
  experienceLevel: string
  preferredIndustries: string[]
  salaryExpectation: string
}

interface JobRecommendation {
  jobId: number
  jobTitle: string
  company: string
  matchScore: number
  reasoning: string
  whyGoodFit: string[]
}

export default function AIRecommendationsPage() {
  const [qualificationSummary, setQualificationSummary] = useState<QualificationSummary | null>(null)
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [submitting, setSubmitting] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadAnalysis()
  }, [])

  const loadAnalysis = async () => {
    try {
      setLoading(true)
      
      // Get qualification summary
      const summaryResponse = await fetch('/api/ai-analysis?action=qualifications')
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json()
        setQualificationSummary(summaryData.summary)
      }

      // Get job recommendations
      const recommendationsResponse = await fetch('/api/ai-analysis?action=recommendations&limit=10')
      if (recommendationsResponse.ok) {
        const recommendationsData = await recommendationsResponse.json()
        setRecommendations(recommendationsData.recommendations)
      }

    } catch (error) {
      console.error('Error loading analysis:', error)
      toast({
        title: 'Error',
        description: 'Failed to load AI analysis. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshAnalysis = async () => {
    try {
      setAnalyzing(true)
      await loadAnalysis()
      toast({
        title: 'Success',
        description: 'AI analysis refreshed successfully!',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh analysis.',
        variant: 'destructive'
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const submitApplication = async (jobId: number) => {
    try {
      setSubmitting(jobId)
      
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Application submitted successfully!',
        })
        
        // Remove the job from recommendations
        setRecommendations(prev => prev.filter(rec => rec.jobId !== jobId))
      } else {
        throw new Error(data.error || 'Failed to submit application')
      }

    } catch (error) {
      console.error('Error submitting application:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit application'
      
      // Special handling for CV upload requirement
      if (errorMessage.includes('No CV found')) {
        toast({
          title: 'CV Required',
          description: 'Please upload your CV in the dashboard before applying for jobs.',
          variant: 'destructive'
        })
      } else if (errorMessage.includes('already applied')) {
        toast({
          title: 'Already Applied',
          description: 'You have already applied for this job.',
          variant: 'destructive'
        })
        // Remove the job from recommendations since user already applied
        setRecommendations(prev => prev.filter(rec => rec.jobId !== jobId))
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        })
      }
    } finally {
      setSubmitting(null)
    }
  }

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getMatchText = (score: number) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    return 'Fair Match'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Analyzing your qualifications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">AI Job Recommendations</h1>
            <p className="text-muted-foreground">
              Get personalized job recommendations based on your qualifications
            </p>
          </div>
          <Button 
            onClick={refreshAnalysis} 
            disabled={analyzing}
            variant="outline"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Refresh Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* CV Requirement Notice */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">CV Required for Applications</h3>
              <p className="text-sm text-blue-700">
                Make sure you have uploaded your CV in the dashboard before applying for jobs. 
                Your CV will be automatically attached to your applications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Qualification Summary */}
      {qualificationSummary && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Your Qualification Summary
            </CardTitle>
            <CardDescription>
              AI analysis of your skills, experience, and career profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm leading-relaxed">{qualificationSummary.summary}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Key Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {qualificationSummary.keySkills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Experience Level</h4>
                  <Badge className={qualificationSummary.experienceLevel === 'Senior' ? 'bg-green-100 text-green-800' : 
                                   qualificationSummary.experienceLevel === 'Mid-Level' ? 'bg-yellow-100 text-yellow-800' : 
                                   'bg-blue-100 text-blue-800'}>
                    {qualificationSummary.experienceLevel}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Preferred Industries</h4>
                  <div className="flex flex-wrap gap-2">
                    {qualificationSummary.preferredIndustries.map((industry, index) => (
                      <Badge key={index} variant="outline">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Expected Salary Range</h4>
                  <p className="text-sm text-muted-foreground">{qualificationSummary.salaryExpectation}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Recommendations */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recommended Jobs</h2>
          <Badge variant="secondary">
            {recommendations.length} recommendations
          </Badge>
        </div>

        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Recommendations Found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any jobs that match your current profile.
              </p>
              <Button onClick={refreshAnalysis} variant="outline">
                Refresh Analysis
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {recommendations.map((recommendation) => (
              <Card key={recommendation.jobId} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {recommendation.jobTitle}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {recommendation.company}
                      </CardDescription>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getMatchColor(recommendation.matchScore)}`} />
                        <span className="text-sm font-medium">
                          {getMatchText(recommendation.matchScore)}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {recommendation.matchScore}%
                      </div>
                      <Progress value={recommendation.matchScore} className="w-20 h-2" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Why This Job Fits You:</h4>
                      <ul className="space-y-1">
                        {recommendation.whyGoodFit.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {recommendation.reasoning}
                      </div>
                      <Button
                        onClick={() => submitApplication(recommendation.jobId)}
                        disabled={submitting === recommendation.jobId}
                        className="ml-4"
                      >
                        {submitting === recommendation.jobId ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Briefcase className="h-4 w-4 mr-2" />
                            Apply Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
