"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  ClockIcon, 
  EyeIcon, 
  HeartIcon, 
  SparklesIcon, 
  ZapIcon, 
  ShieldIcon, 
  StarIcon,
  ArrowForwardIcon,
  CheckmarkIcon
} from "@/components/ui/custom-icons"
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from "react"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleGetStarted = async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/checkout?plan=basic')
      } else {
        router.push('/signup')
      }
    } catch (error) {
      console.error('Error checking session:', error)
      router.push('/signup')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlanAction = async (plan: string) => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (plan === 'basic') {
        if (session) {
          router.push('/dashboard')
        } else {
          router.push('/signup?plan=basic&redirect=/dashboard')
        }
        return;
      }

      if (session) {
        router.push(`/onboarding?plan=${plan}`)
      } else {
        router.push(`/signup?plan=${plan}&redirect=/onboarding?plan=${plan}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3e8ff] via-[#f8fafc] to-[#e0e7ff]">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center relative">
          {/* Floating background elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-[#2e6417] to-[#6fa03a] rounded-full opacity-10 blur-xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-[#6fa03a] to-[#2e6417] rounded-full opacity-10 blur-xl"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-br from-[#2e6417] to-[#6fa03a] rounded-full opacity-10 blur-xl"></div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-gray-100">
            <div className="inline-flex items-center bg-gradient-to-r from-[#2e6417] to-[#6fa03a] text-white rounded-full px-6 py-3 mb-8 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
              <span className="text-sm font-medium">Trusted by 10,000+ people</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-light text-gray-900 mb-8 leading-tight tracking-tight">
              Find your next job,
              <br />
              <span className="font-medium bg-gradient-to-r from-[#2e6417] to-[#6fa03a] bg-clip-text text-transparent">made easier</span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              We help you apply for jobs quickly and easily, so you can focus on what matters most to you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                className="text-base px-8 py-4 bg-gradient-to-r from-[#2e6417] to-[#6fa03a] hover:from-[#a855f7] hover:to-[#9333ea] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                onClick={handleGetStarted}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Get started"}
                <ArrowForwardIcon className="ml-2 h-4 w-4" />
              </Button>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 py-4 border-2 border-gray-300 bg-white text-black hover:bg-black hover:text-white rounded-full font-medium transition-all duration-200"
                >
                  View pricing
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-12 text-sm text-gray-500">
              <div className="flex items-center bg-white/50 rounded-full px-4 py-2 shadow-sm">
                <span className="font-medium text-gray-900 mr-2">2,847</span>
                <span>placements this week</span>
              </div>
              <div className="flex items-center bg-white/50 rounded-full px-4 py-2 shadow-sm">
                <span className="font-medium text-gray-900 mr-2">94%</span>
                <span>interview success rate</span>
              </div>
              <div className="flex items-center bg-white/50 rounded-full px-4 py-2 shadow-sm">
                <span className="font-medium text-gray-900 mr-2">24/7</span>
                <span>dedicated support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              The traditional approach
              <br />
              <span className="bg-gradient-to-r from-[#2e6417] to-[#6fa03a] bg-clip-text text-transparent font-medium">isn't working</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              So many people spend hours filling out job applications and hear nothing back.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <ClockIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Time wasted</h3>
              <p className="text-gray-600 leading-relaxed">
                People spend hours every day on repetitive job applications instead of doing what they love.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <EyeIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Hard to get noticed</h3>
              <p className="text-gray-600 leading-relaxed">
                Most applications get little attention. It's tough to stand out and get a response.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <HeartIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Missed chances</h3>
              <p className="text-gray-600 leading-relaxed">
                While you're busy applying, great opportunities can slip by or go to someone else.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              Your helping hand
              <br />
              <span className="bg-gradient-to-r from-[#2e6417] to-[#6fa03a] bg-clip-text text-transparent font-medium">for job hunting</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
              We make it simple to apply for jobs, keep track of your progress, and get support along the way.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2e6417] to-[#6fa03a] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <SparklesIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Stand out easily</h3>
              <p className="text-gray-600 leading-relaxed">
                We help you show your strengths and tell your story in a way that gets noticed.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <ZapIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Faster applications</h3>
              <p className="text-gray-600 leading-relaxed">
                Our tools help you apply to more jobs in less time, so you can focus on your life.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <ShieldIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Support when you need it</h3>
              <p className="text-gray-600 leading-relaxed">
                Get help and advice whenever you need it, from real people who care about your success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              Simple,
              <span className="bg-gradient-to-r from-[#2e6417] to-[#6fa03a] bg-clip-text text-transparent font-medium"> transparent pricing</span>
            </h2>
            <p className="text-xl text-gray-600 font-light">Choose the plan that fits your needs</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl border-2 border-green-500 relative flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">Free</span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-medium text-gray-900 mb-2">Basic Plan</h3>
                <p className="text-gray-600 mb-6">For anyone looking for a new job</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-light text-gray-900">Free</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">20 job applications per month</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Application tips and reminders</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Friendly support</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Progress tracking dashboard</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Basic resume templates</span>
                </li>
              </ul>

              <div className="space-y-3 mt-auto">
                <Button
                  className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full"
                  onClick={() => handlePlanAction("basic")}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Get Started For Free"}
                </Button>
              </div>
            </div>

            {/* Plus Plan */}
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl border-2 border-[#2e6417] relative flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-[#2e6417] to-[#6fa03a] text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">Most Popular</span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-medium text-gray-900 mb-2">Plus</h3>
                <p className="text-gray-600 mb-6">For those who want extra help and features</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-light text-gray-900">R59</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  <span className="line-through">R149</span> Save 60%
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited job applications</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">AI-powered resume optimization</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Personalized cover letter generator</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Priority 24/7 support</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Advanced interview preparation</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Salary negotiation guidance</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Detailed application analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Premium resume templates</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Job matching recommendations</span>
                </li>
              </ul>

              <div className="space-y-3 mt-auto">
                <Button
                  className="w-full bg-gradient-to-r from-[#2e6417] to-[#6fa03a] hover:from-[#a855f7] hover:to-[#9333ea] rounded-full"
                  onClick={() => handlePlanAction("plus")}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Get started"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6 tracking-tight">
              Trusted by people from all walks of life
            </h2>
            <p className="text-xl text-gray-600 font-light">Real results from our users</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "After 6 months of unsuccessful applications in Cape Town, Talio secured four interview
                opportunities within two weeks. Their understanding of the South African market is exceptional."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2e6417] to-[#6fa03a] rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg">
                  T
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Thabo Mthembu</p>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The team understood the Johannesburg finance sector perfectly. They positioned my profile strategically
                and I landed my dream role at Discovery within 3 weeks."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg">
                  A
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Aisha Patel</p>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "From Durban to remote work opportunities globally - Talio opened doors I didn't even know existed.
                Their service is worth every rand."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6fa03a] to-[#d3ff99] rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg">
                  L
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Lebo Mokwena</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-light text-white mb-6 tracking-tight">
            Ready to find your next job?
            <br />
            <span className="bg-gradient-to-r from-[#2e6417] to-[#6fa03a] bg-clip-text text-transparent font-medium">Let us help you!</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 font-light leading-relaxed">
            Join thousands of people who made job searching easier with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-base px-8 py-4 bg-gradient-to-r from-[#2e6417] to-[#6fa03a] hover:from-[#a855f7] hover:to-[#9333ea] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
              onClick={handleGetStarted}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Get started today"}
              <ArrowForwardIcon className="ml-2 h-4 w-4" />
            </Button>
            <Link href="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 py-4 border-2 border-gray-600 bg-white text-black hover:bg-black hover:text-white rounded-full font-medium transition-all duration-200"
              >
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
