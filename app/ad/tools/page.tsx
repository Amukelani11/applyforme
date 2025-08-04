"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  FileText, 
  ListChecks, 
  Calendar, 
  Lightbulb,
  Wand2,
  ArrowRight,
  Users,
  Brain,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  Globe,
  Building2,
  Award,
  Shield,
  Clock,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"

const tools = [
  {
    name: "AI Market Research Assistant",
    description: "Powerful South African industry research with chat-like interface. Research salaries, experience requirements, and market trends.",
    icon: Globe,
    href: "/ad/insights",
    color: "text-blue-500",
    isNew: true,
    isPremium: true
  },
  {
    name: "AI Candidate Screening",
    description: "Advanced AI-powered candidate evaluation with skills matching, cultural fit analysis, and automated scoring.",
    icon: Brain,
    href: "/ad/tools/candidate-screening",
    color: "text-purple-500",
    isNew: true,
    isPremium: true
  },
  {
    name: "Job Description Optimizer",
    description: "AI-powered job description enhancement for better candidate attraction and SEO optimization.",
    icon: Wand2,
    href: "/ad/tools/jd-optimizer",
    color: "text-purple-500"
  },
  {
    name: "Resume/JD Matching",
    description: "Intelligent matching between resumes and job requirements with detailed compatibility scoring.",
    icon: Search,
    href: "/ad/tools/resume-matching",
    color: "text-blue-500"
  },
  {
    name: "Interview Questions Generator",
    description: "Generate tailored interview questions for any role with behavioral and technical focus.",
    icon: ListChecks,
    href: "/ad/tools/interview-questions",
    color: "text-green-500"
  },
  {
    name: "Smart Interview Scheduler",
    description: "Automated interview scheduling with calendar integration and candidate self-service.",
    icon: Calendar,
    href: "/ad/tools/scheduler",
    color: "text-orange-500"
  },
  {
    name: "Salary Benchmark Analyzer",
    description: "Comprehensive salary analysis with market comparisons and compensation recommendations.",
    icon: TrendingUp,
    href: "/ad/tools/salary-analyzer",
    color: "text-emerald-500",
    isNew: true
  },
  {
    name: "Skills Gap Analyzer",
    description: "Identify skills gaps in your organization and find training opportunities for existing employees.",
    icon: Target,
    href: "/ad/tools/skills-gap",
    color: "text-indigo-500",
    isNew: true
  },
  {
    name: "Offer Letter Generator",
    description: "Create professional offer letters with AI assistance and legal compliance checks.",
    icon: FileText,
    href: "/ad/tools/offer-letter",
    color: "text-indigo-500"
  },
  {
    name: "Candidate Experience Tracker",
    description: "Monitor and improve candidate experience throughout the hiring process with analytics.",
    icon: Users,
    href: "/ad/tools/candidate-experience",
    color: "text-pink-500",
    isNew: true
  },
  {
    name: "Compliance & Legal Assistant",
    description: "Ensure hiring compliance with South African labor laws and BEE requirements.",
    icon: Shield,
    href: "/ad/tools/compliance",
    color: "text-red-500",
    isNew: true
  },
  {
    name: "Time-to-Hire Optimizer",
    description: "Analyze and optimize your hiring timeline with process improvement recommendations.",
    icon: Clock,
    href: "/ad/tools/time-to-hire",
    color: "text-cyan-500",
    isNew: true
  }
]

export default function AdToolsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section with Ultra-Generous Spacing */}
      <div className="px-12 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h1 className="text-5xl font-bold text-gray-900 mb-10 tracking-tight">
            AI-Powered Recruitment Tools
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed tracking-wide mb-8">
            Standalone AI tools that work independently - analyze candidates from any source, 
            optimize job descriptions, and make data-driven hiring decisions.
          </p>
        </div>

        {/* Tools Grid with Ultra-Spacious Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tools.map((tool, index) => (
            <Card
              key={tool.name}
              className={cn(
                "group relative bg-white border border-gray-100 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out cursor-pointer overflow-hidden",
                mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0",
                "hover:border-gray-200 hover:-translate-y-1"
              )}
              style={{
                animationDelay: `${index * 150}ms`,
                animationFillMode: "both"
              }}
            >
              <CardContent className="p-8 h-full flex flex-col">
                {/* Badges */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    {tool.isNew && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 text-xs">
                        NEW
                      </Badge>
                    )}
                    {tool.isPremium && (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs">
                        PREMIUM
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Icon Section with Refined Animation */}
                <div className="flex justify-center mb-6">
                  <div className={cn(
                    "p-4 rounded-2xl bg-gray-50 group-hover:bg-gray-100 transition-all duration-300 ease-out",
                    "flex items-center justify-center",
                    "group-hover:scale-105"
                  )}>
                    <tool.icon className={cn(
                      "h-10 w-10 transition-all duration-300 ease-out",
                      tool.color,
                      "group-hover:scale-110 group-hover:drop-shadow-sm group-hover:text-purple-600"
                    )} />
                  </div>
                </div>

                {/* Content Section with Refined Typography */}
                <div className="text-center space-y-4 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-900 leading-tight tracking-wide">
                    {tool.name}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed tracking-wide flex-1">
                    {tool.description}
                  </p>
                  
                  {/* Ultra-Sleek Ghost Button with Perfect Transitions - Aligned at Bottom */}
                  <div className="pt-6 mt-auto">
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full border border-purple-200 text-purple-600 bg-transparent",
                        "hover:bg-purple-600 hover:text-white hover:border-purple-600",
                        "transition-all duration-300 ease-out",
                        "group-hover:scale-105 group-hover:shadow-lg",
                        "font-medium py-3 px-6 rounded-xl",
                        "group-hover:shadow-purple-100/50",
                        "focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2"
                      )}
                      onClick={() => window.location.href = tool.href}
                    >
                      <span className="transition-all duration-300 ease-out">Open Tool</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>

              {/* Ultra-Subtle Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 via-purple-50/0 to-purple-50/0 group-hover:from-purple-50/5 group-hover:via-purple-50/2 group-hover:to-purple-50/8 transition-all duration-300 ease-out pointer-events-none rounded-2xl" />
            </Card>
          ))}
        </div>

        {/* Feature Highlights Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Why Choose Our Standalone AI Tools?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6 mx-auto">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Work Independently</h3>
              <p className="text-gray-600 leading-relaxed">
                Use AI tools without posting jobs. Analyze candidates from any source - LinkedIn, Indeed, referrals, or direct applications.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">South African Focus</h3>
              <p className="text-gray-600 leading-relaxed">
                Built specifically for the South African market with local salary data, BEE compliance, and labor law considerations.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No Platform Lock-in</h3>
              <p className="text-gray-600 leading-relaxed">
                Unlike other platforms, our tools work with candidates from any source. No dependency on job postings.
              </p>
            </div>
          </div>
        </div>

        {/* Ultra-Generous Bottom Spacing */}
        <div className="h-24" />
      </div>
    </div>
  )
} 