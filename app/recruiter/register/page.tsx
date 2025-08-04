"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { BriefcaseIcon, BuildingIcon, UserIcon, MailIcon, PhoneIcon, GlobeIcon, MapPinIcon } from "lucide-react"
import Link from "next/link"
import { slugify } from "@/lib/utils"

interface FormData {
  email: string
  password: string
  company_name: string
  full_name: string
  phone: string
  contact_email: string
  contact_phone: string
  company_website: string
  company_description: string
  industry: string
  location: string
}

export default function RecruiterRegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
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
    location: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First check if the user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", formData.email)
        .single()

      if (existingUser) {
        toast({
          title: "Account exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        })
        router.push("/recruiter/login")
        return
      }

      // Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            company_name: formData.company_name,
            phone: formData.phone,
            is_recruiter: true,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Create the recruiter profile
        const { error: profileError } = await supabase
          .from("recruiters")
          .insert({
            user_id: authData.user.id,
            email: formData.email,
            full_name: formData.full_name,
            company_name: formData.company_name,
            company_slug: slugify(formData.company_name),
            phone: formData.phone,
            contact_email: formData.contact_email || formData.email,
            contact_phone: formData.contact_phone || formData.phone,
            company_website: formData.company_website,
            company_description: formData.company_description,
            industry: formData.industry,
            location: formData.location,
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

        toast({
          title: "Success",
          description: "Your recruiter account has been created successfully.",
        })

        router.push("/recruiter/dashboard")
      }
    } catch (error: any) {
      console.error("Error creating recruiter account:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3e8ff] via-[#f8fafc] to-[#e0e7ff] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#c084fc] to-[#a855f7] rounded-full mb-4 shadow-lg">
            <BriefcaseIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Recruiter Account</h1>
          <p className="text-lg text-gray-600">Join our platform to find the best talent for your company</p>
        </div>

        <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Get Started Today
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Fill out the form below to create your recruiter account
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Account Information */}
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#c084fc] to-[#a855f7] rounded-full flex items-center justify-center mr-3">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="pl-10 h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                      Password *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl"
                      placeholder="Create a strong password"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#c084fc] to-[#a855f7] rounded-full flex items-center justify-center mr-3">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="full_name" className="text-sm font-medium text-gray-700 mb-2 block">
                      Full Name *
                    </Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      className="h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                      Phone Number *
                    </Label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="pl-10 h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#c084fc] to-[#a855f7] rounded-full flex items-center justify-center mr-3">
                    <BuildingIcon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company_name" className="text-sm font-medium text-gray-700 mb-2 block">
                      Company Name *
                    </Label>
                    <Input
                      id="company_name"
                      type="text"
                      value={formData.company_name}
                      onChange={(e) =>
                        setFormData({ ...formData, company_name: e.target.value })
                      }
                      className="h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl"
                      placeholder="Enter company name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="industry" className="text-sm font-medium text-gray-700 mb-2 block">
                      Industry *
                    </Label>
                    <Input
                      id="industry"
                      type="text"
                      value={formData.industry}
                      onChange={(e) =>
                        setFormData({ ...formData, industry: e.target.value })
                      }
                      className="h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl"
                      placeholder="e.g., Technology, Healthcare"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
                      Location *
                    </Label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="location"
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="pl-10 h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl"
                        placeholder="City, Country"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company_website" className="text-sm font-medium text-gray-700 mb-2 block">
                      Company Website
                    </Label>
                    <div className="relative">
                      <GlobeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="company_website"
                        type="url"
                        value={formData.company_website}
                        onChange={(e) =>
                          setFormData({ ...formData, company_website: e.target.value })
                        }
                        className="pl-10 h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl"
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="company_description" className="text-sm font-medium text-gray-700 mb-2 block">
                    Company Description
                  </Label>
                  <Textarea
                    id="company_description"
                    value={formData.company_description}
                    onChange={(e) =>
                      setFormData({ ...formData, company_description: e.target.value })
                    }
                    className="border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl min-h-[100px]"
                    placeholder="Tell us about your company..."
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#c084fc] to-[#a855f7] rounded-full flex items-center justify-center mr-3">
                    <MailIcon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information (Optional)</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contact_email" className="text-sm font-medium text-gray-700 mb-2 block">
                      Contact Email
                    </Label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) =>
                          setFormData({ ...formData, contact_email: e.target.value })
                        }
                        className="pl-10 h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl"
                        placeholder="Different contact email (optional)"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact_phone" className="text-sm font-medium text-gray-700 mb-2 block">
                      Contact Phone
                    </Label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="contact_phone"
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) =>
                          setFormData({ ...formData, contact_phone: e.target.value })
                        }
                        className="pl-10 h-12 border-gray-300 focus:border-[#c084fc] focus:ring-[#c084fc] rounded-xl"
                        placeholder="Different contact phone (optional)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#c084fc] to-[#a855f7] hover:from-[#a855f7] hover:to-[#9333ea] text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Recruiter Account"
                  )}
                </Button>
              </div>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/recruiter/login"
                    className="text-[#c084fc] hover:text-[#a855f7] font-medium transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 