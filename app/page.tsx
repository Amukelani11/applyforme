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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-green-50/30"></div>
        
        {/* Subtle geometric patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#2e6417]/5 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-[#d3ff99]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            {/* Trust badge */}
            <div className="inline-flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 mb-8 shadow-sm">
              <div className="w-2 h-2 bg-[#2e6417] rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Trusted by 10,000+ professionals</span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-semibold text-gray-900 mb-6 tracking-tight">
              Land your dream job
              <br />
              <span className="bg-gradient-to-r from-[#2e6417] to-[#6fa03a] bg-clip-text text-transparent">faster than ever</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Streamline your job search with our intelligent application platform. 
              Apply to more opportunities while maintaining quality and personalization.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                className="px-8 py-4 bg-[#2e6417] hover:bg-[#6fa03a] text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={handleGetStarted}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Start applying today"}
                <ArrowForwardIcon className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all duration-200"
                >
                  View pricing
                </Button>
              </Link>
            </div>

            {/* Social proof stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">2,847</div>
                <div className="text-sm text-gray-600">Applications sent this week</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">94%</div>
                <div className="text-sm text-gray-600">Response rate improvement</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">24/7</div>
                <div className="text-sm text-gray-600">Expert support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900 mb-6 tracking-tight">
              Everything you need to 
              <span className="bg-gradient-to-r from-[#2e6417] to-[#6fa03a] bg-clip-text text-transparent"> succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to accelerate your job search and maximize your success rate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-[#2e6417] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ZapIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Application</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically customize your applications for each role while maintaining authenticity and personal touch.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-[#6fa03a] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Profile Optimization</h3>
              <p className="text-gray-600 leading-relaxed">
                Enhance your resume and profile to highlight your strengths and match what employers are looking for.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-[#2e6417] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <EyeIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor your application status, response rates, and interview progress all in one dashboard.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-[#6fa03a] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Get guidance from career experts who understand the South African job market inside and out.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-[#2e6417] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Time Savings</h3>
              <p className="text-gray-600 leading-relaxed">
                Reduce application time by 80% while applying to 10x more relevant positions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-[#6fa03a] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <HeartIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Interview Prep</h3>
              <p className="text-gray-600 leading-relaxed">
                Prepare for interviews with company-specific insights and practice questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900 mb-6 tracking-tight">
              Simple, 
              <span className="bg-gradient-to-r from-[#2e6417] to-[#6fa03a] bg-clip-text text-transparent">transparent pricing</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that accelerates your career journey. Start free, upgrade when you're ready.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 relative">
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600 mb-6">Perfect for getting started</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">R0</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">20 applications per month</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Basic application tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Email support</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Standard templates</span>
                </li>
              </ul>

              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold py-3"
                onClick={() => handlePlanAction("basic")}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Start free"}
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-8 rounded-2xl border-2 border-[#2e6417] hover:border-[#6fa03a] transition-all duration-300 relative shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#2e6417] text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-600 mb-6">For serious job seekers</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">R59</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
                <p className="text-sm text-[#2e6417] mt-2 font-medium">
                  <span className="line-through text-gray-400">R149</span> Save 60%
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited applications</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Advanced profile optimization</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Interview preparation</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Analytics & insights</span>
                </li>
                <li className="flex items-center">
                  <CheckmarkIcon className="h-5 w-5 text-[#2e6417] mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Premium templates</span>
                </li>
              </ul>

              <Button
                className="w-full bg-[#2e6417] hover:bg-[#6fa03a] text-white rounded-lg font-semibold py-3"
                onClick={() => handlePlanAction("plus")}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Get started"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900 mb-6 tracking-tight">
              Loved by professionals 
              <span className="bg-gradient-to-r from-[#2e6417] to-[#6fa03a] bg-clip-text text-transparent">across South Africa</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands who've accelerated their careers with Talio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                "Landed 4 interviews in 2 weeks after months of rejections. Talio's understanding of the Cape Town market is incredible."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#2e6417] rounded-full flex items-center justify-center text-white font-semibold">
                  T
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Thabo Mthembu</p>
                  <p className="text-sm text-gray-500">Software Developer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                "Got my dream role at Discovery in 3 weeks. The team's expertise in Johannesburg's finance sector is unmatched."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#6fa03a] rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Aisha Patel</p>
                  <p className="text-sm text-gray-500">Financial Analyst</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                "Opened doors to remote opportunities I never knew existed. From Durban to global companies - worth every rand."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#2e6417] rounded-full flex items-center justify-center text-white font-semibold">
                  L
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Lebo Mokwena</p>
                  <p className="text-sm text-gray-500">Marketing Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-semibold text-white mb-6 tracking-tight">
            Ready to accelerate your 
            <span className="bg-gradient-to-r from-[#2e6417] to-[#6fa03a] bg-clip-text text-transparent">career journey?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
            Join thousands of professionals who've transformed their job search with Talio. Start free today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="px-8 py-4 bg-[#2e6417] hover:bg-[#6fa03a] text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={handleGetStarted}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Start your free trial"}
              <ArrowForwardIcon className="ml-2 h-5 w-5" />
            </Button>
            <Link href="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 border-2 border-gray-600 text-white hover:bg-white hover:text-gray-900 rounded-lg font-semibold transition-all duration-200"
              >
                View pricing
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-400 mb-4">Trusted by leading companies</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-gray-500 font-medium">Discovery</div>
              <div className="text-gray-500 font-medium">Shoprite</div>
              <div className="text-gray-500 font-medium">Capitec</div>
              <div className="text-gray-500 font-medium">MTN</div>
              <div className="text-gray-500 font-medium">Woolworths</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
