"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, CheckCircle } from "lucide-react"
import { useState } from "react"

export default function JobCreditsPage() {
  // For demo, hardcode credits. In production, fetch from backend.
  const [credits, setCredits] = useState(3)
  const [loading, setLoading] = useState(false)

  const handleBuyCredits = async () => {
    setLoading(true)
    // Simulate purchase
    setTimeout(() => {
      setCredits((c) => c + 1)
      setLoading(false)
    }, 1200)
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