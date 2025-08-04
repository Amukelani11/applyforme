"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, CheckCircle, Crown, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function JobCreditsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [credits, setCredits] = useState(3)
  const [loading, setLoading] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: recruiter } = await supabase
          .from('recruiters')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (recruiter) {
          const { data: subscription } = await supabase
            .from('recruiter_subscriptions')
            .select('*')
            .eq('recruiter_id', recruiter.id)
            .eq('status', 'active')
            .single()

          setIsPremium(subscription?.plan_id === 'premium')
        }
      }
      setIsLoading(false)
    }

    checkSubscription()
  }, [supabase])

  const handleBuyCredits = async () => {
    setLoading(true)
    // Simulate purchase
    setTimeout(() => {
      setCredits((c) => c + 1)
      setLoading(false)
    }, 1200)
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    )
  }

  if (isPremium) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Job Credits</h1>
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-green-600">Premium Plan Active</CardTitle>
                <CardDescription>
                  You have unlimited job postings with your Premium plan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unlimited Job Postings</h3>
              <p className="text-gray-600 mb-6">
                With your Premium plan, you can post unlimited jobs without needing to purchase credits.
              </p>
              <Button 
                onClick={() => router.push('/recruiter/dashboard/billing')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                View Billing & Plan Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Premium Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Unlimited job postings</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>AI-powered candidate analysis</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Public job sharing links</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Featured company listing</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Dedicated support</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Job Credits</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Job Credits</CardTitle>
          <CardDescription>
            Use job credits to post additional jobs beyond your plan's monthly limit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center">
              <Zap className="h-7 w-7 text-[#c084fc] mr-2" />
              <span className="text-2xl font-bold text-gray-900">{credits}</span>
            </div>
            <span className="text-gray-600">job credits available</span>
          </div>
          <ul className="mb-6 space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              1 credit = 1 additional job post
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Credits never expire
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Credits are used automatically when you exceed your plan's limit
            </li>
          </ul>
          <Button
            onClick={handleBuyCredits}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#c084fc] to-[#a855f7] hover:from-[#a855f7] hover:to-[#9333ea] text-white"
            size="lg"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Buy 1 Job Credit (R50)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>How Job Credits Work</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>Each month, your plan gives you a set number of job posts.</li>
            <li>If you need to post more jobs, you can buy job credits here.</li>
            <li>Credits are used automatically when you exceed your plan's limit.</li>
            <li>You can buy as many credits as you need. Credits never expire.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
} 