"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  UsersIcon, 
  BriefcaseIcon, 
  TargetIcon, 
  BarChartIcon, 
  CheckmarkIcon,
  SparklesIcon,
  StarIcon,
  ShieldIcon,
  ClockIcon
} from "@/components/ui/custom-icons"
import {
  Calendar,
  Database,
  Wand2,
  CreditCard,
  Search,
  FileText,
  ListChecks,
  TrendingUp,
  Globe,
  Brain,
  Zap,
  ArrowRight,
  Play,
  Award,
  Users,
  Building2,
  CheckCircle,
  ArrowUpRight,
  Star,
  MessageSquare,
  BarChart3,
  Target,
  Lightbulb,
  Shield,
  Clock,
  Globe2,
  PieChart,
  Send,
  Mail,
  Phone,
  MapPin
} from "lucide-react"

export default function RecruiterLandingPage() {
  const router = useRouter()

  const stats = [
    { number: "50K+", label: "Active Candidates", icon: Users },
    { number: "2,500+", label: "Companies Hiring", icon: Building2 },
    { number: "95%", label: "Success Rate", icon: Award },
    { number: "24/7", label: "AI Support", icon: Clock }
  ]

  const coreFeatures = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Smart Candidate Matching",
      description: "AI-powered matching that connects you with the most qualified candidates based on skills, experience, and cultural fit.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Real-time insights into your hiring funnel with predictive analytics and performance metrics.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Talent Pool Management",
      description: "Build and nurture relationships with passive candidates through intelligent engagement campaigns.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Automated Workflows",
      description: "Streamline your hiring process with customizable automation rules and smart scheduling.",
      color: "from-orange-500 to-red-500"
    }
  ]

  const aiFeatures = [
    {
      icon: <Brain className="w-7 h-7" />,
      title: "AI Resume Screening",
      description: "Instantly analyze and score resumes with 95% accuracy using advanced NLP and machine learning.",
      highlight: "95% Accuracy"
    },
    {
      icon: <Search className="w-7 h-7" />,
      title: "Intelligent Job Matching",
      description: "Automatically match job requirements with candidate profiles using semantic analysis.",
      highlight: "Smart Matching"
    },
    {
      icon: <Wand2 className="w-7 h-7" />,
      title: "JD Optimization",
      description: "AI-powered job description enhancement for better candidate attraction and SEO performance.",
      highlight: "SEO Optimized"
    },
    {
      icon: <ListChecks className="w-7 h-7" />,
      title: "Interview Question Generator",
      description: "Generate role-specific interview questions with behavioral and technical focus areas.",
      highlight: "Role-Specific"
    },
    {
      icon: <PieChart className="w-7 h-7" />,
      title: "Predictive Analytics",
      description: "Forecast hiring success rates and candidate performance using historical data analysis.",
      highlight: "Predictive"
    },
    {
      icon: <MessageSquare className="w-7 h-7" />,
      title: "Automated Communication",
      description: "Smart email sequences and follow-ups that keep candidates engaged throughout the process.",
      highlight: "Auto-Engagement"
    }
  ]

  const advancedFeatures = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Talent Intelligence",
      description: "Comprehensive market insights with salary benchmarks and competitor analysis."
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Smart Scheduling",
      description: "AI-powered interview scheduling with calendar integration and timezone management."
    },
    {
      icon: <Globe2 className="w-6 h-6" />,
      title: "Global Reach",
      description: "Access talent from around the world with multi-language support and localization."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Performance Tracking",
      description: "Monitor hiring metrics and team performance with detailed reporting and insights."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Document Automation",
      description: "Generate offer letters, contracts, and compliance documents with legal accuracy."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Bank-level security with SOC 2 compliance and advanced data protection."
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Head of Talent Acquisition",
      company: "TechCorp Solutions",
      content: "ApplyForMe transformed our hiring process. We've reduced time-to-hire by 60% and improved candidate quality significantly.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "HR Director",
      company: "InnovateLabs",
      content: "The AI-powered screening is incredible. It saves us hours every week and helps us focus on the best candidates.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Recruitment Manager",
      company: "GrowthStart",
      content: "Best recruitment platform we've used. The analytics and automation features are game-changers for our team.",
      rating: 5
    }
  ]

  const benefits = [
    "Reduce time-to-hire by up to 70%",
    "Improve candidate quality with AI screening",
    "Access to 50,000+ active candidates",
    "Advanced analytics and reporting",
    "24/7 customer support",
    "Enterprise-grade security",
    "Custom integrations available",
    "Mobile-optimized platform",
    "Multi-language support",
    "Compliance and legal support",
    "Automated workflows",
    "Predictive hiring insights"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Badges */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2">
                <SparklesIcon className="w-4 h-4 mr-2" />
                AI-Powered Platform
              </Badge>
              <Badge variant="outline" className="border-blue-200 text-blue-700 px-4 py-2">
                <StarIcon className="w-4 h-4 mr-2" />
                Trusted by 2,500+ Companies
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Hire Smarter,
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Faster</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Transform your recruitment with AI-powered candidate matching, automated workflows, and intelligent analytics. 
              Find the perfect candidates in half the time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => router.push("/recruiter/register")}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-4 text-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                onClick={() => router.push("/recruiter/login")}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl mb-3 mx-auto">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Core Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Hire Successfully
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge AI with proven recruitment methodologies 
              to deliver exceptional hiring results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white"
              >
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* AI Features Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <SparklesIcon className="w-8 h-8 text-purple-600" />
              <h2 className="text-4xl font-bold text-gray-900">
                AI-Powered Recruitment
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leverage the power of artificial intelligence to automate repetitive tasks, 
              improve decision-making, and find the best candidates faster.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiFeatures.map((feature, index) => (
              <Card key={index} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-purple-600">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                      {feature.highlight}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Scale your recruitment efforts with advanced tools designed for growing organizations 
              and enterprise teams.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => (
              <Card key={index} className="group border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-blue-600">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our customers say about their experience with ApplyForMe.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose ApplyForMe?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of companies that have transformed their hiring process with our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors duration-300">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-gray-700 font-medium">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => router.push("/recruiter/register")}
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-white/20">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="text-4xl font-bold mb-2">$0<span className="text-lg">/month</span></div>
                <p className="text-sm opacity-80">Perfect for getting started</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>1 active job posting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Unlimited applications</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Basic AI screening</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Email support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Standard templates</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10"
                onClick={() => router.push("/recruiter/register")}
              >
                Get Started Free
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-white text-blue-600 px-4 py-2 font-semibold">
                  Most Popular
                </Badge>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="text-4xl font-bold mb-2">R1,299<span className="text-lg">/month</span></div>
                <p className="text-sm opacity-90">For growing companies</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Unlimited job postings</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Advanced AI features</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>3 users for collaboration</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Talent pools & CRM</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-white mr-3" />
                  <span>Custom branding</span>
                </li>
              </ul>
              <Button
                className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                onClick={() => router.push("/recruiter/register")}
              >
                Start Free Trial
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm border border-white/20">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="text-4xl font-bold mb-2">Custom</div>
                <p className="text-sm opacity-80">For large organizations</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Everything in Premium</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>R650 per user per month</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Dedicated support team</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>SLA guarantees</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>On-premise options</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span>Custom training & onboarding</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10"
                onClick={() => router.push("/recruiter/register")}
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of companies already using ApplyForMe to hire better candidates faster. 
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 rounded-full px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => router.push("/recruiter/register")}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 rounded-full px-10 py-4 text-lg"
              onClick={() => router.push("/recruiter/login")}
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 