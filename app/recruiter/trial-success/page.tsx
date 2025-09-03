"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Users, BarChart3, MessageSquare, Zap, Shield, CreditCard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Script from "next/script"

function TrialSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
    }
    setLoading(false)
  }

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Unlimited Job Postings",
      description: "Post as many jobs as you need"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Track your hiring performance"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Talent Pool Management",
      description: "Build your candidate database"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered Screening",
      description: "Automatically screen candidates"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Up to 3 Team Members",
      description: "Collaborate with your team"
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Priority Support",
      description: "Get help when you need it"
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2e6417] mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* LinkedIn Insight Tag */}
      <Script id="linkedin-insight-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
_linkedin_partner_id = "8645017";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
` }} />
      <Script id="linkedin-insight-loader" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
(function(l){
if (!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}
var s=document.getElementsByTagName("script")[0];
var b=document.createElement("script");
b.type="text/javascript";b.async=true;
b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b,s);
})(window.lintrk);
` }} />
      <noscript>
        <img height="1" width="1" style={{ display: "none" }} alt="" src="https://px.ads.linkedin.com/collect/?pid=8645017&fmt=gif" />
      </noscript>
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6 tracking-tight">
            Welcome to
            <br />
            <span className="bg-gradient-to-r from-[#2e6417] to-[#6fa03a] bg-clip-text text-transparent font-medium">Talio!</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
            Your 30-day free trial has been activated successfully. Start exploring all the features available to you.
          </p>
        </div>

        {/* Trial Info Card */}
        <Card className="mb-12 border-2 border-green-200 bg-green-50">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Free Trial is Active</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Trial Period</p>
                  <p className="text-lg font-semibold text-gray-900">30 Days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="text-lg font-semibold text-gray-900">Professional</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cost</p>
                  <p className="text-lg font-semibold text-green-600">R0</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Your trial ends on {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}. 
                You can cancel anytime before then to avoid charges.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Everything You Can Do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#2e6417] to-[#6fa03a] rounded-full flex items-center justify-center flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Button
            onClick={() => router.push('/recruiter/dashboard')}
            className="px-8 py-4 bg-gradient-to-r from-[#2e6417] to-[#6fa03a] hover:from-[#6fa03a] hover:to-[#2e6417] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-lg"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push('/recruiter/jobs/new')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full font-medium"
            >
              Create Your First Job
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/recruiter/tools')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full font-medium"
            >
              Explore Tools
            </Button>
          </div>
        </div>

        {/* Help Section */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help Getting Started?</h3>
              <p className="text-gray-600 mb-4">
                Our team is here to help you make the most of your free trial.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.open('mailto:support@applyforme.co.za?subject=Free Trial Support')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/recruiter/settings')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Account Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function TrialSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2e6417] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <TrialSuccessContent />
    </Suspense>
  )
} 