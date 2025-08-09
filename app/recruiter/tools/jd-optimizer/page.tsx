"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Wand2, 
  Copy, 
  Sparkles, 
  Target, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Search,
  Eye,
  MessageSquare,
  Award,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OptimizationResult {
  overallScore: number
  readability: number
  seoScore: number
  clarityScore: number
  keywords: string[]
  suggestions: {
    type: 'improvement' | 'warning' | 'suggestion'
    category: string
    text: string
    action?: string
  }[]
  missingSections: string[]
  biasDetected: string[]
}

export default function JDOptimizerPage() {
  const [originalJD, setOriginalJD] = useState("")
  const [optimizedJD, setOptimizedJD] = useState("")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [results, setResults] = useState<OptimizationResult | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const words = originalJD.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
  }, [originalJD])

  const handleOptimize = async () => {
    if (!originalJD.trim()) return
    setIsOptimizing(true)
    setResults(null)
    try {
      const res = await fetch('/api/tools/jd-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalJD })
      })
      if (!res.ok) throw new Error('Failed to optimize')
      const data = await res.json()
      setOptimizedJD(data.enhancedText)
      const mockResults: OptimizationResult = {
        overallScore: data.overallScore,
        readability: data.readability,
        seoScore: data.seoScore,
        clarityScore: data.clarityScore,
        keywords: data.keywords,
        suggestions: data.suggestions,
        missingSections: data.missingSections,
        biasDetected: data.biasDetected
      }
      setResults(mockResults)
    } catch (e) {
      console.error(e)
    } finally {
      setIsOptimizing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const applySuggestion = (suggestion: string) => {
    setSelectedSuggestion(suggestion)
    // In a real implementation, this would apply the suggestion to the text
    setTimeout(() => setSelectedSuggestion(null), 2000)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section with Ultra-Generous Spacing */}
      <div className="px-16 py-20 max-w-8xl mx-auto">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8">
            <Wand2 className="h-12 w-12 text-purple-600 mr-5" />
            <h1 className="text-6xl font-bold text-gray-900 tracking-tight">
              Job Description Optimizer
            </h1>
          </div>
          <p className="text-xl text-gray-500 max-w-4xl mx-auto leading-relaxed tracking-wide font-light">
            Transform your job descriptions with AI-powered enhancements for better candidate attraction and engagement.
          </p>
        </div>

        {/* Two-Column Layout with Expanded Spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-8xl mx-auto">
          {/* Left Column - Input Area */}
          <div className="space-y-10">
            <Card 
              className={cn(
                "shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-gray-50 rounded-3xl",
                "hover:shadow-[0_8px_25px_-3px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-1",
                "transition-all duration-300 ease-out",
                mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0"
              )}
              style={{
                animationDelay: "200ms",
                animationFillMode: "both"
              }}
            >
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-2xl font-semibold text-gray-900">
                  <Target className="h-7 w-7 mr-4 text-blue-600" />
                  Original Job Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="relative">
                  <Textarea
                    placeholder="Paste your job description here..."
                    value={originalJD}
                    onChange={(e) => setOriginalJD(e.target.value)}
                    className={cn(
                      "min-h-[450px] resize-none border border-gray-200 rounded-2xl p-8 text-base leading-relaxed",
                      "focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300",
                      "placeholder:text-gray-400 placeholder:font-light"
                    )}
                  />
                  {wordCount > 0 && (
                    <div className="absolute bottom-6 right-6 text-sm text-gray-400 font-medium">
                      {wordCount} words
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleOptimize}
                  disabled={!originalJD.trim() || isOptimizing}
                  className={cn(
                    "w-full border-2 border-purple-300 text-purple-700 bg-transparent font-semibold py-5 px-10 rounded-2xl",
                    "hover:bg-purple-600 hover:text-white hover:border-purple-600",
                    "transition-all duration-300 ease-out",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    "focus:ring-2 focus:ring-purple-200 focus:ring-offset-2"
                  )}
                >
                  {isOptimizing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-3" />
                      Optimize Job Description
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Optimized Version */}
            {optimizedJD && (
              <Card 
                className={cn(
                  "shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-gray-50 rounded-3xl",
                  "hover:shadow-[0_8px_25px_-3px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-1",
                  "transition-all duration-300 ease-out",
                  mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0"
                )}
                style={{
                  animationDelay: "400ms",
                  animationFillMode: "both"
                }}
              >
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center text-2xl font-semibold text-gray-900">
                    <CheckCircle className="h-7 w-7 mr-4 text-green-600" />
                    Optimized Version
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 p-8 rounded-2xl min-h-[350px] whitespace-pre-wrap text-sm leading-relaxed">
                    {optimizedJD}
                  </div>
                  <Button 
                    onClick={() => copyToClipboard(optimizedJD)}
                    variant="outline"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 transition-all duration-300 rounded-2xl py-4"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Intelligent Feedback */}
          <div className="space-y-10">
            {isOptimizing ? (
              // Enhanced Loading State
              <div className="space-y-8">
                {[...Array(4)].map((_, i) => (
                  <Card 
                    key={i}
                    className="shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-gray-50 rounded-3xl p-8"
                  >
                    <div className="animate-pulse space-y-5">
                      <div className="h-7 bg-gray-200 rounded w-1/3" />
                      <div className="h-5 bg-gray-200 rounded w-full" />
                      <div className="h-5 bg-gray-200 rounded w-2/3" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : results ? (
              // Enhanced Results
              <div className="space-y-8">
                {/* Overall Score */}
                <Card 
                  className={cn(
                    "shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-gray-50 rounded-3xl",
                    "hover:shadow-[0_8px_25px_-3px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-1",
                    "transition-all duration-300 ease-out",
                    mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0"
                  )}
                  style={{
                    animationDelay: "600ms",
                    animationFillMode: "both"
                  }}
                >
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className={cn(
                        "inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold mb-6",
                        getScoreBg(results.overallScore),
                        getScoreColor(results.overallScore)
                      )}>
                        {results.overallScore}%
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">Overall Score</h3>
                      <p className="text-gray-600 font-light">Your job description quality rating</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Scores */}
                <Card 
                  className={cn(
                    "shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-gray-50 rounded-3xl",
                    "hover:shadow-[0_8px_25px_-3px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-1",
                    "transition-all duration-300 ease-out",
                    mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0"
                  )}
                  style={{
                    animationDelay: "700ms",
                    animationFillMode: "both"
                  }}
                >
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
                      <TrendingUp className="h-6 w-6 mr-3 text-purple-600" />
                      Detailed Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Readability</span>
                        <span className="text-sm font-semibold text-gray-900">{results.readability}%</span>
                      </div>
                      <Progress value={results.readability} className="h-3 [&>div]:bg-green-500 rounded-full" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">SEO Score</span>
                        <span className="text-sm font-semibold text-gray-900">{results.seoScore}%</span>
                      </div>
                      <Progress value={results.seoScore} className="h-3 [&>div]:bg-blue-500 rounded-full" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Clarity</span>
                        <span className="text-sm font-semibold text-gray-900">{results.clarityScore}%</span>
                      </div>
                      <Progress value={results.clarityScore} className="h-3 [&>div]:bg-purple-500 rounded-full" />
                    </div>
                  </CardContent>
                </Card>

                {/* Keyword Suggestions */}
                <Card 
                  className={cn(
                    "shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-gray-50 rounded-3xl",
                    "hover:shadow-[0_8px_25px_-3px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-1",
                    "transition-all duration-300 ease-out",
                    mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0"
                  )}
                  style={{
                    animationDelay: "800ms",
                    animationFillMode: "both"
                  }}
                >
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
                      <Search className="h-6 w-6 mr-3 text-blue-600" />
                      Keyword Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {results.keywords.map((keyword, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer transition-all duration-200 hover:scale-105 rounded-full px-4 py-2"
                          onClick={() => applySuggestion(keyword)}
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Smart Suggestions */}
                <Card 
                  className={cn(
                    "shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-gray-50 rounded-3xl",
                    "hover:shadow-[0_8px_25px_-3px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-1",
                    "transition-all duration-300 ease-out",
                    mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0"
                  )}
                  style={{
                    animationDelay: "900ms",
                    animationFillMode: "both"
                  }}
                >
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
                      <Lightbulb className="h-6 w-6 mr-3 text-yellow-600" />
                      Smart Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {results.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-5 bg-gray-50 rounded-2xl">
                        <div className="flex items-start justify-between mb-3">
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              suggestion.type === 'improvement' ? "bg-green-100 text-green-700" :
                              suggestion.type === 'warning' ? "bg-red-100 text-red-700" :
                              "bg-blue-100 text-blue-700",
                              "rounded-full px-3 py-1"
                            )}
                          >
                            {suggestion.category}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => applySuggestion(suggestion.action || '')}
                            className="h-7 w-7 p-0 hover:bg-purple-100 rounded-full transition-all duration-200"
                          >
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{suggestion.text}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Missing Sections */}
                <Card 
                  className={cn(
                    "shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-gray-50 rounded-3xl",
                    "hover:shadow-[0_8px_25px_-3px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-1",
                    "transition-all duration-300 ease-out",
                    mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0"
                  )}
                  style={{
                    animationDelay: "1000ms",
                    animationFillMode: "both"
                  }}
                >
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center text-xl font-semibold text-gray-900">
                      <AlertCircle className="h-6 w-6 mr-3 text-orange-600" />
                      Missing Sections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {results.missingSections.map((section, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-700">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mr-4" />
                          {section}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Enhanced Empty State
              <div className="text-center py-20">
                <Wand2 className="h-20 w-20 mx-auto mb-8 text-gray-300" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Ready to Optimize</h3>
                <p className="text-gray-500 font-light">Paste your job description and get intelligent feedback</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 