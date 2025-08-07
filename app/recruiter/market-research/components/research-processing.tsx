"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Search, TrendingUp, FileText, CheckCircle } from "lucide-react"

type ResearchMode = "quick" | "full"

interface ResearchProcessingScreenProps {
  mode: ResearchMode
}

const processingSteps = [
  {
    id: "searching",
    text: "Searching reputable sources...",
    icon: Search,
    duration: (mode: ResearchMode) => mode === 'quick' ? 2000 : 4000
  },
  {
    id: "analyzing",
    text: "Analyzing data trends...",
    icon: TrendingUp,
    duration: (mode: ResearchMode) => mode === 'quick' ? 3000 : 5000
  },
  {
    id: "synthesizing",
    text: "Synthesizing key findings...",
    icon: Brain,
    duration: (mode: ResearchMode) => mode === 'quick' ? 2500 : 4000
  },
  {
    id: "cross-referencing",
    text: "Cross-referencing insights...",
    icon: FileText,
    duration: (mode: ResearchMode) => mode === 'quick' ? 2000 : 3500
  },
  {
    id: "finalizing",
    text: "Finalizing comprehensive report...",
    icon: CheckCircle,
    duration: (mode: ResearchMode) => mode === 'quick' ? 1500 : 3000
  }
]

export default function ResearchProcessingScreen({ mode }: ResearchProcessingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  useEffect(() => {
    const totalDuration = processingSteps.reduce((acc, step) => acc + step.duration(mode), 0)
    const estimatedMinutes = mode === "quick" ? 1 : 5

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < processingSteps.length - 1) {
          const currentStepData = processingSteps[prev]
          if (currentStepData) {
            setCompletedSteps(prev => new Set([...prev, currentStepData.id]))
          }
          return prev + 1
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [mode])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            {/* Header */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-[#c084fc] to-[#a855f7] rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Analyzing Your Request...
              </h1>
              <p className="text-lg text-gray-600">
                Uncovering insights from multiple sources
              </p>
            </div>

            {/* Dynamic Loader */}
            <div className="mb-8">
              <div className="relative w-32 h-32 mx-auto">
                {/* Outer Ring */}
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#c084fc] rounded-full animate-spin" style={{ borderTopColor: 'transparent' }}></div>
                
                {/* Inner Network */}
                <div className="absolute inset-4 flex items-center justify-center">
                  <div className="relative w-16 h-16">
                    {/* Network Dots */}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-[#c084fc] rounded-full animate-ping"
                        style={{
                          top: `${50 + 30 * Math.cos(i * Math.PI / 4)}%`,
                          left: `${50 + 30 * Math.sin(i * Math.PI / 4)}%`,
                          animationDelay: `${i * 0.2}s`
                        }}
                      />
                    ))}
                    
                    {/* Center Dot */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#a855f7] rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Updates */}
            <div className="space-y-4 mb-8">
              {processingSteps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = completedSteps.has(step.id)
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                      isActive
                        ? "bg-[#c084fc]/10 border border-[#c084fc]/20"
                        : isCompleted
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500"
                        : isActive
                        ? "bg-[#c084fc] animate-pulse"
                        : "bg-gray-300"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <Icon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className={`font-medium ${
                      isCompleted
                        ? "text-green-700"
                        : isActive
                        ? "text-[#c084fc]"
                        : "text-gray-500"
                    }`}>
                      {step.text}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Estimated Time */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600">
                <span className="font-semibold">Estimated completion:</span> {mode === "quick" ? "1-2 minutes" : "3-5 minutes"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {mode === "quick" 
                  ? "Quick research mode - focused insights"
                  : "Full research mode - comprehensive analysis"
                }
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#c084fc] to-[#a855f7] h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${((currentStep + 1) / processingSteps.length) * 100}%` 
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Step {currentStep + 1} of {processingSteps.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 