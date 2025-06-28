"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  UsersIcon, 
  BriefcaseIcon, 
  TargetIcon, 
  BarChartIcon, 
  CheckmarkIcon,
  SparklesIcon
} from "@/components/ui/custom-icons"

export default function RecruiterLandingPage() {
  const router = useRouter()

  const features = [
    {
      icon: <UsersIcon className="w-7 h-7" />,
      title: "Access Top Talent",
      description: "Connect with qualified candidates who are actively seeking new opportunities."
    },
    {
      icon: <BriefcaseIcon className="w-7 h-7" />,
      title: "Post Jobs",
      description: "Create and manage job listings with detailed requirements and benefits."
    },
    {
      icon: <TargetIcon className="w-7 h-7" />,
      title: "Targeted Matching",
      description: "Our AI-powered system matches your job requirements with the most suitable candidates."
    },
    {
      icon: <BarChartIcon className="w-7 h-7" />,
      title: "Analytics Dashboard",
      description: "Track application metrics and candidate engagement in real-time."
    }
  ]

  const benefits = [
    "Free job posting for verified companies",
    "Direct communication with candidates",
    "Advanced candidate filtering",
    "Application tracking system",
    "Company profile customization",
    "24/7 support"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3e8ff] via-[#f8fafc] to-[#e0e7ff]">
      {/* Hero Section */}
      <div className="py-20 flex justify-center items-center">
        <div className="bg-white/90 rounded-3xl shadow-2xl px-8 py-12 max-w-2xl w-full text-center border border-gray-100">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-4">
            Find Your Perfect Candidates
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join our platform to connect with qualified professionals and streamline your hiring process.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button
              size="lg"
              className="bg-[#c084fc] hover:bg-[#a855f7] text-white rounded-full px-8 py-4 text-base shadow-md"
              onClick={() => router.push("/recruiter/register")}
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-4 text-base border-gray-300"
              onClick={() => router.push("/recruiter/login")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything You Need to Hire
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our platform provides all the tools you need to find and hire the best talent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="transition-transform duration-200 hover:scale-105 hover:shadow-xl border-0 bg-white/95"
              >
                <CardContent className="pt-8 pb-6 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c084fc] to-[#a855f7] flex items-center justify-center mb-4 shadow-md">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* New AI Features Section */}
      <div className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <SparklesIcon className="w-8 h-8 text-[#a855f7]" />
              Automate Your Hiring with AI
            </h2>
            <p className="mt-4 text-lg text-gray-600">
             Our smart Applicant Tracking Features save you time by automatically analyzing and scoring candidates.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c084fc] to-[#a855f7] flex items-center justify-center mb-4 mx-auto">
                    <BriefcaseIcon className="w-8 h-8" />
                </div>
                <CardTitle>AI-Powered CV Grading</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Instantly screen resumes and grade them based on your job requirements, skills, and experience.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c084fc] to-[#a855f7] flex items-center justify-center mb-4 mx-auto">
                    <BarChartIcon className="w-8 h-8" />
                </div>
                <CardTitle>Candidate Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                    Each candidate gets a score, making it easy to see who the top contenders are at a glance.
                </p>
              </CardContent>
            </Card>
             <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c084fc] to-[#a855f7] flex items-center justify-center mb-4 mx-auto">
                    <TargetIcon className="w-8 h-8" />
                </div>
                <CardTitle>Keyword & Skill Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                    Our AI scans for relevant keywords and skills, ensuring you never miss a qualified applicant.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-[#f3e8ff] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose Our Platform?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of companies already using our platform to hire top talent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center bg-white rounded-2xl shadow p-5 border border-gray-100">
                <CheckmarkIcon className="w-7 h-7 text-[#c084fc] mr-4 flex-shrink-0" />
                <p className="text-gray-700 text-base font-medium">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              className="bg-[#c084fc] hover:bg-[#a855f7] text-white rounded-full px-8 py-4 text-base shadow-md"
              onClick={() => router.push("/recruiter/register")}
            >
              Start Hiring Today
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 