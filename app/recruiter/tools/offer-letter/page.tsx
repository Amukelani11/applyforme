"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Copy, Download, Sparkles, User, Building, DollarSign, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface OfferLetter {
  candidateName: string
  jobTitle: string
  companyName: string
  startDate: string
  salary: string
  benefits: string[]
  terms: string[]
}

export default function OfferLetterPage() {
  const [candidateName, setCandidateName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [salary, setSalary] = useState("")
  const [employmentType, setEmploymentType] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [offerLetter, setOfferLetter] = useState<OfferLetter | null>(null)

  const handleGenerate = async () => {
    if (!candidateName.trim() || !jobTitle.trim() || !companyName.trim() || !startDate || !salary || !employmentType) return
    
    setIsGenerating(true)
    
    // Simulate AI generation
    setTimeout(() => {
      const generatedOffer: OfferLetter = {
        candidateName,
        jobTitle,
        companyName,
        startDate,
        salary,
        benefits: [
          "Comprehensive health, dental, and vision insurance",
          "401(k) retirement plan with company matching",
          "Paid time off and holidays",
          "Professional development and training opportunities",
          "Flexible work arrangements",
          "Employee wellness programs"
        ],
        terms: [
          "This offer is contingent upon successful completion of background check",
          "Employment is at-will and may be terminated by either party",
          "You will be required to sign our standard employment agreement",
          "All company policies and procedures will apply to your employment"
        ]
      }
      
      setOfferLetter(generatedOffer)
      setIsGenerating(false)
    }, 3000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadOfferLetter = () => {
    if (!offerLetter) return
    
    const letterContent = `
OFFER LETTER

${new Date().toLocaleDateString()}

Dear ${offerLetter.candidateName},

We are pleased to offer you the position of ${offerLetter.jobTitle} at ${offerLetter.companyName}.

Position Details:
- Job Title: ${offerLetter.jobTitle}
- Employment Type: ${employmentType}
- Start Date: ${offerLetter.startDate}
- Annual Salary: ${offerLetter.salary}

Benefits:
${offerLetter.benefits.map(benefit => `• ${benefit}`).join('\n')}

Terms and Conditions:
${offerLetter.terms.map(term => `• ${term}`).join('\n')}

We look forward to having you join our team!

Best regards,
${offerLetter.companyName} HR Team
    `.trim()
    
    const blob = new Blob([letterContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `offer-letter-${offerLetter.candidateName.toLowerCase().replace(' ', '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Offer Letter Generator</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create professional offer letters with AI assistance and customizable templates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Candidate & Position Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Candidate Name
                  </label>
                  <Input
                    placeholder="John Doe"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <Input
                    placeholder="Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <Input
                  placeholder="Your Company Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type
                  </label>
                  <Select value={employmentType} onValueChange={setEmploymentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Salary
                </label>
                <Input
                  placeholder="$85,000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={!candidateName.trim() || !jobTitle.trim() || !companyName.trim() || !startDate || !salary || !employmentType || isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating Offer Letter...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Offer Letter
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Offer Letter */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Generated Offer Letter
              </CardTitle>
            </CardHeader>
            <CardContent>
              {offerLetter ? (
                <div className="space-y-6">
                  <div id="offer-letter-content" className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">OFFER LETTER</h3>
                      <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-4 text-sm">
                      <p>Dear <strong>{offerLetter.candidateName}</strong>,</p>
                      
                      <p>We are pleased to offer you the position of <strong>{offerLetter.jobTitle}</strong> at <strong>{offerLetter.companyName}</strong>.</p>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Position Details:</h4>
                        <ul className="space-y-1">
                          <li>• Job Title: {offerLetter.jobTitle}</li>
                          <li>• Employment Type: {employmentType}</li>
                          <li>• Start Date: {offerLetter.startDate}</li>
                          <li>• Annual Salary: {offerLetter.salary}</li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Benefits:</h4>
                        <ul className="space-y-1">
                          {offerLetter.benefits.map((benefit, index) => (
                            <li key={index}>• {benefit}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Terms and Conditions:</h4>
                        <ul className="space-y-1">
                          {offerLetter.terms.map((term, index) => (
                            <li key={index}>• {term}</li>
                          ))}
                        </ul>
                      </div>

                      <p>We look forward to having you join our team!</p>
                      
                      <div className="mt-6">
                        <p>Best regards,</p>
                        <p><strong>{offerLetter.companyName} HR Team</strong></p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => {
                        const el = document.getElementById('offer-letter-content')
                        copyToClipboard(el ? el.textContent || '' : '')
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                    <Button 
                      onClick={downloadOfferLetter}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Your offer letter will appear here</p>
                  <p className="text-sm text-gray-400">Fill out the form and generate your offer letter</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Templates */}
        <div className="mt-12">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-purple-600" />
                Offer Letter Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col">
                  <FileText className="h-5 w-5 mb-2" />
                  <span>Standard Template</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <DollarSign className="h-5 w-5 mb-2" />
                  <span>Executive Offer</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Calendar className="h-5 w-5 mb-2" />
                  <span>Contract Position</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 