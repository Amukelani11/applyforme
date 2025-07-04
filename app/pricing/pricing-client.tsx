"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabaseClient"
import { CheckmarkIcon } from "@/components/ui/custom-icons"
import { useState } from "react"

export function PricingClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handlePlanAction = async (plan: string) => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push(`/onboarding?plan=${plan}`)
      } else {
        router.push(`/signup?plan=${plan}&redirect=/onboarding?plan=${plan}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFreeTrial = () => {
    router.push('/signup?redirect=/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6 tracking-tight">
            Simple,
            <span className="text-[#c084fc] font-medium"> transparent pricing</span>
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Choose the plan that's right for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Basic Plan */}
          <Card className="bg-white p-8 rounded-2xl shadow-sm border-2 border-green-500 relative flex flex-col">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">Free Trial</span>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-medium text-gray-900">Basic Plan</CardTitle>
              <CardDescription className="text-gray-600">
                Perfect for anyone looking to start their job search
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-light text-gray-900">R49</span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="line-through">R99</span> after 2 months
                  </p>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckmarkIcon className="h-5 w-5 text-[#c084fc] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">20 job applications per month</span>
                  </li>
                  <li className="flex items-center">
                    <CheckmarkIcon className="h-5 w-5 text-[#c084fc] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Application tips and reminders</span>
                  </li>
                  <li className="flex items-center">
                    <CheckmarkIcon className="h-5 w-5 text-[#c084fc] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Friendly support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckmarkIcon className="h-5 w-5 text-[#c084fc] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Progress tracking dashboard</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="mt-auto flex flex-col space-y-3">
              <Button
                className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl"
                onClick={() => handlePlanAction("basic")}
                disabled={isLoading}
              >
                Start 2 Month Free Trial
              </Button>
            </CardFooter>
          </Card>

          {/* Plus Plan */}
          <Card className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-medium text-gray-900">Plus</CardTitle>
              <CardDescription className="text-gray-600">
                For those who want extra help and features
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-light text-gray-900">R99</span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    R249 Save 60% before R149
                  </p>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckmarkIcon className="h-5 w-5 text-[#c084fc] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">10 job applications per day</span>
                  </li>
                  <li className="flex items-center">
                    <CheckmarkIcon className="h-5 w-5 text-[#c084fc] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">10 AI CV improvements per month</span>
                  </li>
                  <li className="flex items-center">
                    <CheckmarkIcon className="h-5 w-5 text-[#c084fc] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Priority recruiter exposure</span>
                  </li>
                  <li className="flex items-center">
                    <CheckmarkIcon className="h-5 w-5 text-[#c084fc] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Job match alerts</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 mt-auto">
              <Button
                className="w-full bg-[#c084fc] hover:bg-[#a855f7] text-white rounded-xl"
                onClick={() => handlePlanAction("plus")}
                disabled={isLoading}
              >
                Get Started
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-medium text-gray-900">Pro</CardTitle>
              <CardDescription className="text-gray-600">
                Complete solution for professional job seekers
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-light text-gray-900">R149</span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="line-through">R249</span> after 3 months
                  </p>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckmarkIcon className="h-5 w-5 text-[#c084fc] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited job applications</span>
                  </li>
                  <li className="flex items-center">
                    <CheckmarkIcon className="h-5 w-5 text-[#c084fc] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited AI CV improvements</span>
                  </li>
                  <li className="flex items-center">
                    <CheckmarkIcon className="h-5 w-5 text-[#c084fc] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Top priority recruiter exposure</span>
                  </li>
                  <li className="flex items-center">
                    <CheckmarkIcon className="h-5 w-5 text-[#c084fc] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Priority support</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="mt-auto flex flex-col space-y-3">
              <Button
                className="w-full bg-[#c084fc] hover:bg-[#a855f7] text-white rounded-xl"
                onClick={() => handlePlanAction("pro")}
                disabled={isLoading}
              >
                Get Started
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
