"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, FileText, Clock, CheckCircle, Star } from "lucide-react"
import Link from "next/link"

export default function CVReviewPage() {
  const [userPlan] = useState("Premium") // Simulate user plan
  const [cvReviews] = useState([
    {
      id: 1,
      fileName: "John_Doe_Resume_2024.pdf",
      status: "Reviewed",
      submittedDate: "2024-01-10",
      reviewedDate: "2024-01-12",
      reviewer: "Sarah Johnson",
      rating: 4.5,
      feedback:
        "Great technical skills section! Consider adding more quantifiable achievements in your work experience. The layout is clean and professional. Recommend highlighting your leadership experience more prominently.",
    },
    {
      id: 2,
      fileName: "John_Doe_Resume_Updated.pdf",
      status: "Under Review",
      submittedDate: "2024-01-15",
      reviewedDate: null,
      reviewer: "Mike Chen",
      rating: null,
      feedback: null,
    },
  ])

  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast({
        title: "CV Submitted for Review",
        description: `${file.name} has been submitted. You'll receive feedback within 24-48 hours.`,
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Reviewed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "Under Review":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "Pending":
        return <FileText className="h-5 w-5 text-gray-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reviewed":
        return "bg-green-100 text-green-800"
      case "Under Review":
        return "bg-yellow-100 text-yellow-800"
      case "Pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (userPlan !== "Premium") {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">CV Review</h1>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle>Premium Feature</CardTitle>
              <CardDescription>CV Review is available for Premium subscribers only</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg mb-6">
                <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Professional CV Review</h3>
                <p className="text-gray-600 mb-4">
                  Have your CV reviewed by industry experts and get personalized feedback to improve your chances of
                  landing interviews.
                </p>
                <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Expert review within 24-48 hours
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Detailed feedback and suggestions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Industry-specific recommendations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Unlimited revisions
                  </li>
                </ul>
              </div>
              <Link href="/pricing">
                <Button size="lg">Upgrade to Premium</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">CV Review</h1>
          <p className="text-gray-600 mt-2">Get professional feedback on your CV from industry experts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload New CV */}
            <Card>
              <CardHeader>
                <CardTitle>Submit CV for Review</CardTitle>
                <CardDescription>Upload your CV and get expert feedback within 24-48 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your CV</h3>
                  <p className="text-gray-500 mb-4">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label htmlFor="cv-upload">
                    <Button className="cursor-pointer">Choose File</Button>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Review History */}
            <Card>
              <CardHeader>
                <CardTitle>Review History</CardTitle>
                <CardDescription>Track your CV reviews and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {cvReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(review.status)}
                          <div>
                            <h4 className="font-medium text-gray-900">{review.fileName}</h4>
                            <p className="text-sm text-gray-500">
                              Submitted on {review.submittedDate}
                              {review.reviewedDate && ` • Reviewed on ${review.reviewedDate}`}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                      </div>

                      {review.status === "Reviewed" && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700">Reviewed by:</span>
                              <span className="text-sm text-gray-900">{review.reviewer}</span>
                            </div>
                            {review.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">{review.rating}/5</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Feedback:</h5>
                            <p className="text-sm text-gray-600">{review.feedback}</p>
                          </div>
                        </div>
                      )}

                      {review.status === "Under Review" && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-yellow-800">
                              Your CV is currently being reviewed by {review.reviewer}. You'll receive feedback within
                              24-48 hours.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Review Process */}
            <Card>
              <CardHeader>
                <CardTitle>Review Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Upload CV</h4>
                      <p className="text-xs text-gray-500">Submit your CV for review</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">2</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Expert Review</h4>
                      <p className="text-xs text-gray-500">Industry expert reviews your CV</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">3</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Get Feedback</h4>
                      <p className="text-xs text-gray-500">Receive detailed feedback and suggestions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Better Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Use a clean, professional format
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Include quantifiable achievements
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Tailor content to your target role
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Keep it concise (1-2 pages max)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
