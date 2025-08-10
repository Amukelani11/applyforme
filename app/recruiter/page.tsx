"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Users, Building, Percent, Clock, Zap, Target, BarChart3, Users2, Briefcase, FileText, MessageSquare, Calendar, TrendingUp, Globe, Brain, Wand2, Search, CheckCircle, Calendar as CalendarIcon, Share2, Linkedin, MessageCircle, Mail, Phone, ExternalLink, MapPin, DollarSign, Sparkles, Filter, Plus, X, Send, StickyNote, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function RecruiterLandingPage() {
  const [showEnterpriseForm, setShowEnterpriseForm] = useState(false)
  const [hasRecruiterAccess, setHasRecruiterAccess] = useState<boolean>(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    const checkRecruiterAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!isMounted) return
      if (!user) {
        setHasRecruiterAccess(false)
        setIsLoggedIn(false)
        return
      }
      setIsLoggedIn(true)

      // Check recruiter owner profile
      const { data: recruiter } = await supabase
        .from('recruiters')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!isMounted) return
      if (recruiter) {
        setHasRecruiterAccess(true)
        return
      }

      // Check team membership
      const { data: membership } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (!isMounted) return
      setHasRecruiterAccess(Array.isArray(membership) && membership.length > 0)
    }

    checkRecruiterAccess()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkRecruiterAccess()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    monthlyJobs: '',
    teamSize: '',
    currentTools: '',
    requirements: '',
    timeline: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/enterprise-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        alert('Thank you! We\'ll be in touch soon.')
        setShowEnterpriseForm(false)
        setFormData({
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          monthlyJobs: '',
          teamSize: '',
          currentTools: '',
          requirements: '',
          timeline: ''
        })
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch (error) {
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />


      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Hire smarter, <span className="text-theme-600">faster</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered recruitment platform that helps you find, screen and hire the best candidates in record time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/recruiter/register">
              <Button size="lg" className="bg-theme-600 hover:bg-theme-700 text-lg px-8 py-3">
                Start hiring today
              </Button>
            </Link>
            <Link href={hasRecruiterAccess ? "/recruiter/dashboard" : (isLoggedIn ? "/dashboard" : "/recruiter/login")}>
              <Button size="lg" variant="outline" className="border-theme-600 text-theme-600 hover:bg-theme-50 text-lg px-8 py-3">
                {(hasRecruiterAccess || isLoggedIn) ? 'Dashboard' : 'Recruiter Login'}
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="flex flex-col items-center">
              <Users className="h-8 w-8 text-theme-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">1,000+</p>
              <p className="text-gray-600">Active Candidates</p>
            </div>
            <div className="flex flex-col items-center">
              <Building className="h-8 w-8 text-theme-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">25+</p>
              <p className="text-gray-600">Companies Hiring</p>
            </div>
            <div className="flex flex-col items-center">
              <Percent className="h-8 w-8 text-theme-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">95%</p>
              <p className="text-gray-600">Success Rate</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-8 w-8 text-theme-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">24/7</p>
              <p className="text-gray-600">AI Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Unlock Candidate Potential - AI Review Screen */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Unlock Candidate <span className="text-theme-600">Potential</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our intelligent analysis provides deep insights, scores, and actionable recommendations for every applicant.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">AI-powered candidate scoring with 99% accuracy</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Detailed insights on skills, experience, and cultural fit</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Actionable recommendations for next steps</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-theme-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-theme-600 font-semibold">SJ</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Sarah Johnson</h3>
                    <p className="text-gray-600">sarah.johnson@email.com</p>
                    <p className="text-gray-600">Cape Town, South Africa</p>
                    <p className="text-gray-600">+27 82 123 4567</p>
                  </div>
                  <div className="ml-auto text-center">
                    <div className="w-16 h-16 bg-theme-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-xl">87</span>
                    </div>
                    <a href="#" className="text-theme-600 text-sm hover:underline">Why this score?</a>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4 mr-2" />
                    Shortlisted
                  </Button>
                  <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50">
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button variant="outline" className="w-full border-theme-600 text-theme-600 hover:bg-theme-50">
                    <Send className="h-4 w-4 mr-2" />
                    Message Candidate
                  </Button>
                  <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                    <Check className="h-4 w-4 mr-2" />
                    Added to Pool (1)
                  </Button>
                  <Button variant="outline" className="w-full">
                    <StickyNote className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                  <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Message Team
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Master Your Pipeline - Dashboard Screen */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Application Funnel</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Applied</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-theme-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                  <span className="text-sm font-medium">247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reviewed</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-theme-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm font-medium">185</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Assessment</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-theme-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                  <span className="text-sm font-medium">123</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Interview</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-theme-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-sm font-medium">111</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Offer</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-theme-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <span className="text-sm font-medium">37</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hired</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-theme-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                  <span className="text-sm font-medium">25</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Master Your <span className="text-theme-600">Pipeline</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Gain real-time insights into your hiring funnel and overall performance with comprehensive analytics.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Real-time application funnel visualization</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Performance metrics and team analytics</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Customizable reports and insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Build Your Dream Team - Talent Pools Screen */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Build Your <span className="text-theme-600">Dream Team</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Organize and manage your top candidates in dedicated talent pools for future opportunities.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Create and organize candidate pools by role or skill</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Track candidate engagement and communication history</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Easy candidate search and filtering</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Talent Pools</h3>
                  <Button size="sm" className="bg-black hover:bg-gray-800">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-theme-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-theme-600 rounded-full mr-3"></div>
                      <span className="font-medium">Senior Developers</span>
                    </div>
                    <span className="text-sm text-gray-600">23 members</span>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="font-medium">Product Managers</span>
                    </div>
                    <span className="text-sm text-gray-600">12 members</span>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">UX Designers</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">8 members</span>
                      <Badge variant="secondary" className="text-xs">Public</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                      <span className="font-medium">Data Scientists</span>
                    </div>
                    <span className="text-sm text-gray-600">15 members</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Complete Toolkit - Tools Screen */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Tablet-like graphic */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Recruitment Tools</h3>
              <p className="text-gray-600 mb-8">
                Standalone AI tools that work independently - analyze candidates from any source, optimize job descriptions, and make data-driven hiring decisions.
              </p>
              
                             <div className="grid grid-cols-3 gap-4 mb-6">
                 {/* Top Row */}
                 <Card className="text-center p-4 flex flex-col h-full">
                   <div className="flex items-center justify-center mb-2">
                     <Globe className="h-8 w-8 text-blue-600 mr-2" />
                     <Brain className="h-6 w-6 text-theme-600" />
                   </div>
                   <h4 className="text-sm font-semibold mb-2">AI Market Research Assistant</h4>
                   <p className="text-xs text-gray-600 mb-3 flex-grow">Powerful South African industry research with real-time insights, research salaries, experience requirements, and market trends.</p>
                   <Button size="sm" variant="outline" className="border-theme-600 text-theme-600 hover:bg-theme-50 text-xs mt-auto">
                     Open Tool
                   </Button>
                 </Card>
                 
                 <Card className="text-center p-4 flex flex-col h-full">
                   <div className="flex items-center justify-center mb-2">
                     <Users className="h-8 w-8 text-theme-600 mr-2" />
                     <Check className="h-6 w-6 text-green-600" />
                   </div>
                   <h4 className="text-sm font-semibold mb-2">AI Candidate Screening</h4>
                   <p className="text-xs text-gray-600 mb-3 flex-grow">Advanced AI-powered candidate evaluation with skills matching, cultural fit analysis, and automated scoring.</p>
                   <Button size="sm" variant="outline" className="border-theme-600 text-theme-600 hover:bg-theme-50 text-xs mt-auto">
                     Open Tool
                   </Button>
                 </Card>
                 
                 <Card className="text-center p-4 flex flex-col h-full">
                   <div className="flex items-center justify-center mb-2">
                     <Wand2 className="h-8 w-8 text-theme-600" />
                   </div>
                   <h4 className="text-sm font-semibold mb-2">Job Description Optimizer</h4>
                   <p className="text-xs text-gray-600 mb-3 flex-grow">AI-powered job description enhancement for better candidate attraction and SEO optimization.</p>
                   <Button size="sm" variant="outline" className="border-theme-600 text-theme-600 hover:bg-theme-50 text-xs mt-auto">
                     Open Tool
                   </Button>
                 </Card>
                 
                 {/* Bottom Row */}
                 <Card className="text-center p-4 flex flex-col h-full">
                   <div className="flex items-center justify-center mb-2">
                     <Search className="h-8 w-8 text-blue-400" />
                   </div>
                   <h4 className="text-sm font-semibold mb-2">Resume/JD Matching</h4>
                   <p className="text-xs text-gray-600 mb-3 flex-grow">Advanced matching algorithm to find the perfect fit between candidates and job requirements.</p>
                   <Button size="sm" variant="outline" className="border-theme-600 text-theme-600 hover:bg-theme-50 text-xs mt-auto">
                     Open Tool
                   </Button>
                 </Card>
                 
                 <Card className="text-center p-4 flex flex-col h-full">
                   <div className="flex items-center justify-center mb-2">
                     <MessageSquare className="h-8 w-8 text-green-600" />
                   </div>
                   <h4 className="text-sm font-semibold mb-2">Interview Questions Generator</h4>
                   <p className="text-xs text-gray-600 mb-3 flex-grow">Generate intelligent, role-specific interview questions based on job requirements.</p>
                   <Button size="sm" variant="outline" className="border-theme-600 text-theme-600 hover:bg-theme-50 text-xs mt-auto">
                     Open Tool
                   </Button>
                 </Card>
                 
                 <Card className="text-center p-4 flex flex-col h-full">
                   <div className="flex items-center justify-center mb-2">
                     <Calendar className="h-8 w-8 text-orange-500" />
                   </div>
                   <h4 className="text-sm font-semibold mb-2">Smart Interview Scheduler</h4>
                   <p className="text-xs text-gray-600 mb-3 flex-grow">Automated scheduling system that coordinates interviews between candidates and team members.</p>
                   <Button size="sm" variant="outline" className="border-theme-600 text-theme-600 hover:bg-theme-50 text-xs mt-auto">
                     Open Tool
                   </Button>
                 </Card>
               </div>
              
              <p className="text-sm text-gray-600 text-center">
                Complete suite of AI-powered tools to enhance every aspect of recruitment.
              </p>
            </div>
            
            {/* Right side - Description */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Your Complete <span className="text-theme-600">Toolkit</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Access powerful features like JD optimization, interview question generation, market insights, and more. Everything you need to streamline your recruitment process in one place.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">AI-powered job description optimization</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Intelligent interview question generation</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Market research and salary insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Create & Optimize Job Posts - Job Posting Screen */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Create & Optimize <span className="text-theme-600">Job Posts</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Create compelling job postings with AI optimization and share them across multiple platforms instantly.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">AI-powered job description enhancement</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">One-click sharing to LinkedIn, WhatsApp, and more</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">SEO optimization for better candidate discovery</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Create Job Posting</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input type="text" value="Senior Software Engineer" className="w-full p-2 border border-gray-300 rounded-md" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input type="text" value="TechCorp South Africa" className="w-full p-2 border border-gray-300 rounded-md" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" value="Johannesburg, South Africa" className="w-full p-2 border border-gray-300 rounded-md" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                    <input type="text" value="Full-time" className="w-full p-2 border border-gray-300 rounded-md" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                    <input type="text" value="R45,000 - R65,000 per month" className="w-full p-2 border border-gray-300 rounded-md" readOnly />
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Check className="h-4 w-4 mr-1" />
                      AI Optimized
                    </Button>
                    <Button size="sm" variant="outline">
                      <Sparkles className="h-4 w-4 mr-1" />
                      Optimize with AI
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Save as Draft</Button>
                    <Button size="sm" variant="outline">Preview</Button>
                    <Button size="sm" className="bg-theme-600 hover:bg-theme-700">
                      <Sparkles className="h-4 w-4 mr-1" />
                      Publish Job
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Loved by <span className="text-theme-600">recruiters worldwide</span>
            </h2>
            <p className="text-lg text-gray-600">
              See what our customers have to say about their experience with ApplyForMe.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "ApplyForMe has transformed our hiring process. We've reduced our time-to-hire by 60% and improved candidate quality significantly."
              </p>
              <div>
                <p className="font-semibold">Nokuthula Mokoena</p>
                <p className="text-gray-600">HR Director</p>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The AI-powered screening saves us hours every week. We can now focus on the best candidates and make faster decisions."
              </p>
              <div>
                <p className="font-semibold">christine van der merwe</p>
                <p className="text-gray-600">Recruitment Manager</p>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The analytics and insights give us unprecedented visibility into our hiring funnel. Highly recommended!"
              </p>
              <div>
                <p className="font-semibold">zinhle nyaka</p>
                <p className="text-gray-600">Talent Acquisition</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Simple, <span className="text-theme-600">transparent pricing</span>
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your hiring needs. No hidden fees, no surprises.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-gray-600 mb-6">Perfect for small teams getting started</p>
              <div className="text-4xl font-bold mb-6">Free</div>
              <ul className="space-y-3 mb-8 text-left flex-grow">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Unlimited job postings</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Up to 10 applicants per job</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Basic AI screening</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Candidate database access</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Email support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Basic analytics</span>
                </li>
              </ul>
              <Button className="w-full bg-theme-600 hover:bg-theme-700">Get started</Button>
            </Card>
            
            <Card className="p-8 text-center border-2 border-theme-600 relative flex flex-col">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-theme-600">Most Popular</Badge>
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <p className="text-gray-600 mb-6">Ideal for growing companies</p>
              <div className="text-4xl font-bold mb-6">R1,299<span className="text-lg text-gray-600">/month</span></div>
              <ul className="space-y-3 mb-8 text-left flex-grow">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Everything in Starter</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Unlimited applicants</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Talent pool management</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Up to 2 users</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Collaboration tools</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Advanced AI screening</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
              <Link href="/recruiter/free-trial">
                <Button className="w-full bg-theme-600 hover:bg-theme-700">Start free trial</Button>
              </Link>
            </Card>
            
            <Card className="p-8 text-center flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-6">For large organizations with custom needs</p>
              <div className="text-4xl font-bold mb-6">Custom</div>
              <ul className="space-y-3 mb-8 text-left flex-grow">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Everything in Professional</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Unlimited users</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>White-label options</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Advanced security</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Custom reporting</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>24/7 phone support</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-theme-600 hover:bg-theme-700"
                onClick={() => setShowEnterpriseForm(true)}
              >
                Get more
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Enterprise Contact Form Modal */}
      {showEnterpriseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Enterprise Contact Request</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEnterpriseForm(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-gray-600 mt-2">
                Tell us about your organization and we'll get back to you with a custom solution.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    placeholder="Your company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your.email@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+27 82 123 4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Job Postings *
                  </label>
                  <Select 
                    value={formData.monthlyJobs} 
                    onValueChange={(value) => setFormData({...formData, monthlyJobs: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 jobs</SelectItem>
                      <SelectItem value="6-15">6-15 jobs</SelectItem>
                      <SelectItem value="16-30">16-30 jobs</SelectItem>
                      <SelectItem value="31-50">31-50 jobs</SelectItem>
                      <SelectItem value="50+">50+ jobs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Size *
                  </label>
                  <Select 
                    value={formData.teamSize} 
                    onValueChange={(value) => setFormData({...formData, teamSize: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Recruitment Tools
                </label>
                <Input
                  type="text"
                  value={formData.currentTools}
                  onChange={(e) => setFormData({...formData, currentTools: e.target.value})}
                  placeholder="e.g., LinkedIn, Indeed, internal ATS"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Requirements
                </label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  placeholder="Tell us about your specific needs, integrations, or custom features you're looking for..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Implementation Timeline
                </label>
                <Select 
                  value={formData.timeline} 
                  onValueChange={(value) => setFormData({...formData, timeline: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediate">Immediate (within 1 month)</SelectItem>
                    <SelectItem value="1-3 months">1-3 months</SelectItem>
                    <SelectItem value="3-6 months">3-6 months</SelectItem>
                    <SelectItem value="6+ months">6+ months</SelectItem>
                    <SelectItem value="Not sure">Not sure yet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEnterpriseForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-theme-600 hover:bg-theme-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CTA Footer */}
      <section className="py-20 bg-theme-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your hiring?
          </h2>
          <p className="text-xl text-theme-100 mb-8">
            Join thousands of companies that are already hiring smarter with ApplyForMe.
          </p>
          <Link href="/recruiter/free-trial">
            <Button size="lg" className="bg-white text-theme-600 hover:bg-gray-100 text-lg px-8 py-3">
              Start your free trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
} 