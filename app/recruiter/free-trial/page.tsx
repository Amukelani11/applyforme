"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, CreditCard, Shield, Zap, Users, BarChart3, MessageSquare, MailIcon, LockIcon, UserIcon, BuildingIcon, PhoneIcon, GlobeIcon, MapPinIcon, BriefcaseIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { slugify } from "@/lib/utils"
import { createFreeTrialSession } from "./actions"
import Script from "next/script"

function FreeTrialContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toast } = useToast()
     const [loading, setLoading] = useState(false)
     const [user, setUser] = useState<any>(null)
   const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  })
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    company_name: "",
    full_name: "",
    phone: "",
    contact_email: "",
    contact_phone: "",
    company_website: "",
    company_description: "",
    industry: "",
    location: ""
  })


  
  

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      // Pre-fill login form with user's email if they're logged in
      setLoginData(prev => ({
        ...prev,
        email: user.email || ""
      }))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (error) throw error

      // Check if user is a recruiter
      const { data: recruiterData, error: recruiterError } = await supabase
        .from("recruiters")
        .select("id")
        .eq("user_id", data.user.id)
        .single()

      if (recruiterError || !recruiterData) {
        await supabase.auth.signOut()
        throw new Error("This account is not registered as a recruiter. Please sign up as a recruiter.")
      }

             setUser(data.user)

      toast({
        title: "Success",
        description: "Logged in successfully! Please enter your card details to continue.",
      })

    } catch (error: any) {
      console.error("Error signing in:", error)
      let errorMessage = error.message
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Incorrect email or password. Please try again."
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please check your email and confirm your account before signing in."
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // First check if the user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", signupData.email)
        .maybeSingle()

      if (existingUser) {
        toast({
          title: "Account exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        })
        setActiveTab('login')
        setLoginData({ email: signupData.email, password: "" })
        return
      }

      // Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.full_name,
            company_name: signupData.company_name,
            phone: signupData.phone,
            is_recruiter: true,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Ensure we have a session for RLS policies
        if (!authData.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: signupData.email,
            password: signupData.password,
          })
          if (signInError) {
            console.error('Auto sign-in failed after signup:', signInError)
            throw new Error('Please verify your email or sign in to continue')
          }
        }

        // Create the recruiter profile
        const { error: profileError } = await supabase
          .from("recruiters")
          .insert({
            user_id: authData.user.id,
            company_name: signupData.company_name,
            contact_email: signupData.contact_email || signupData.email,
            contact_phone: signupData.contact_phone || signupData.phone,
            company_website: signupData.company_website,
            company_description: signupData.company_description,
            industry: signupData.industry,
            location: signupData.location,
          })

        if (profileError) {
          console.error("Profile creation error:", profileError)
          throw new Error("Failed to create recruiter profile")
        }

        // Update the user's is_recruiter flag
        const { error: userUpdateError } = await supabase
          .from("users")
          .update({ is_recruiter: true })
          .eq("id", authData.user.id)

        if (userUpdateError) {
          console.error("User update error:", userUpdateError)
          throw new Error("Failed to update user role")
        }

                 setUser(authData.user)

        toast({
          title: "Success",
          description: "Your recruiter account has been created successfully.",
        })
      }
    } catch (error: any) {
      console.error("Error creating recruiter account:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  

    const handleStartFreeTrial = async () => {
    setLoading(true)
    
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in or sign up first.",
          variant: "destructive",
        })
        return
      }

      // Ensure user record exists in users table (without setting trial status yet)
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user:', fetchError)
        toast({
          title: "Error",
          description: "Error checking user profile. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Only create basic user record if it doesn't exist (no trial status yet)
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: signupData.full_name || user.user_metadata?.full_name || '',
            phone: signupData.phone || user.user_metadata?.phone || '',
            is_recruiter: true
          })

        if (insertError) {
          console.error('Error creating user record:', insertError)
          toast({
            title: "Error",
            description: "Error creating user profile. Please try again.",
            variant: "destructive",
          })
          return
        }
      }

      // Use server action to create PayFast session
      await createFreeTrialSession()

    } catch (error: any) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Unlimited Job Postings",
      description: "Post as many jobs as you need without restrictions"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Get detailed insights into your hiring performance"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Talent Pool Management",
      description: "Build and manage your candidate database"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered Screening",
      description: "Automatically screen and rank candidates"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Up to 3 Team Members",
      description: "Collaborate with your hiring team"
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Priority Support",
      description: "Get help when you need it most"
    }
  ]

  const renderLoginForm = () => (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
        <p className="text-gray-600">Sign in to your existing account</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="login-email">Email Address *</Label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="login-email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="Enter your email"
                required
                className="mt-2 pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="login-password">Password *</Label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="login-password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="Enter your password"
                required
                className="mt-2 pl-10"
              />
            </div>
          </div>
                     {user ? (
              <Button
                onClick={handleStartFreeTrial}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
              >
                {loading ? "Processing..." : "Start Free Trial"}
              </Button>
             ) : (
               <Button
                 type="submit"
                 disabled={loading}
                 className="w-full py-3 bg-gradient-to-r from-[#c084fc] to-[#a855f7] hover:from-[#a855f7] hover:to-[#9333ea] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
               >
                 {loading ? "Signing in..." : "Sign In"}
               </Button>
             )}
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => setActiveTab('signup')}
              className="text-[#c084fc] hover:underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const renderSignupForm = () => (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
        <p className="text-gray-600">Create your recruiter account</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="signup-email">Email Address *</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="signup-email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  className="mt-2 pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="signup-password">Password *</Label>
              <Input
                id="signup-password"
                type="password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                placeholder="Create a strong password"
                required
                className="mt-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="signup-full-name">Full Name *</Label>
              <Input
                id="signup-full-name"
                type="text"
                value={signupData.full_name}
                onChange={(e) => setSignupData({ ...signupData, full_name: e.target.value })}
                placeholder="Enter your full name"
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="signup-phone">Phone Number *</Label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="signup-phone"
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  required
                  className="mt-2 pl-10"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="signup-company">Company Name *</Label>
              <Input
                id="signup-company"
                type="text"
                value={signupData.company_name}
                onChange={(e) => setSignupData({ ...signupData, company_name: e.target.value })}
                placeholder="Enter company name"
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="signup-industry">Industry *</Label>
              <Input
                id="signup-industry"
                type="text"
                value={signupData.industry}
                onChange={(e) => setSignupData({ ...signupData, industry: e.target.value })}
                placeholder="e.g., Technology, Healthcare"
                required
                className="mt-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="signup-location">Location *</Label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="signup-location"
                  type="text"
                  value={signupData.location}
                  onChange={(e) => setSignupData({ ...signupData, location: e.target.value })}
                  placeholder="City, Country"
                  required
                  className="mt-2 pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="signup-website">Company Website</Label>
              <div className="relative">
                <GlobeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="signup-website"
                  type="url"
                  value={signupData.company_website}
                  onChange={(e) => setSignupData({ ...signupData, company_website: e.target.value })}
                  placeholder="https://yourcompany.com"
                  className="mt-2 pl-10"
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="signup-description">Company Description</Label>
            <Textarea
              id="signup-description"
              value={signupData.company_description}
              onChange={(e) => setSignupData({ ...signupData, company_description: e.target.value })}
              placeholder="Tell us about your company..."
              className="mt-2 min-h-[80px]"
            />
          </div>
                     {user ? (
              <Button
                onClick={handleStartFreeTrial}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
              >
                {loading ? "Processing..." : "Start Free Trial"}
              </Button>
           ) : (
             <Button
               type="submit"
               disabled={loading}
               className="w-full py-3 bg-gradient-to-r from-[#c084fc] to-[#a855f7] hover:from-[#a855f7] hover:to-[#9333ea] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
             >
               {loading ? "Creating Account..." : "Create Account"}
             </Button>
           )}
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => setActiveTab('login')}
              className="text-[#c084fc] hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )



  

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
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-light text-gray-900 mb-6 tracking-tight">
            Start Your
            <br />
            <span className="bg-gradient-to-r from-[#c084fc] to-[#a855f7] bg-clip-text text-transparent font-medium">Free Trial</span>
          </h1>
                     <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
             Try ApplyForMe Professional for 30 days completely free. You'll enter your card details securely on PayFast.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Pricing Card */}
          <div className="lg:order-2">
            <Card className="relative border-2 border-[#c084fc] shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-[#c084fc] to-[#a855f7] text-white border-0 px-6 py-2 text-lg">
                  Free Trial
                </Badge>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-3xl font-bold text-gray-900">Professional</CardTitle>
                <div className="text-6xl font-bold text-gray-900 mb-2">
                  R0
                  <span className="text-lg font-normal text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">First 30 days free, then R1,299/month</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-[#c084fc] to-[#a855f7] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                 <div className="rounded-lg p-4 border text-sm flex items-center gap-2 bg-gray-50 border-gray-200">
                   <CheckCircle className="w-5 h-5 text-gray-400" />
                   <span className="text-gray-700">Card verification is temporarily disabled. You can start your free trial without a card.</span>
                 </div>
              </CardContent>
            </Card>
          </div>

                     {/* Form Section */}
           <div className="lg:order-1">
             {/* Tab Navigation */}
             <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
               <button
                 onClick={() => setActiveTab('login')}
                 className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                   activeTab === 'login'
                     ? 'bg-white text-[#c084fc] shadow-sm'
                     : 'text-gray-600 hover:text-gray-900'
                 }`}
               >
                 Sign In
               </button>
               <button
                 onClick={() => setActiveTab('signup')}
                 className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                   activeTab === 'signup'
                     ? 'bg-white text-[#c084fc] shadow-sm'
                     : 'text-gray-600 hover:text-gray-900'
                 }`}
               >
                 Create Account
               </button>
             </div>
             
             {/* Form Content */}
             {activeTab === 'login' && renderLoginForm()}
             {activeTab === 'signup' && renderSignupForm()}
           </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Secure & Safe</h3>
              <p className="text-sm text-gray-600">Your data is protected with bank-level security</p>
            </div>
                         <div className="flex flex-col items-center">
               <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                 <CreditCard className="w-6 h-6 text-blue-600" />
               </div>
                              <h3 className="font-medium text-gray-900 mb-2">Secure Payment</h3>
                <p className="text-sm text-gray-600">Card details entered securely on PayFast</p>
             </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Cancel Anytime</h3>
              <p className="text-sm text-gray-600">Cancel your subscription at any time, no questions asked</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FreeTrialPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c084fc] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <FreeTrialContent />
    </Suspense>
  )
} 