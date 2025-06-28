"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Search } from "lucide-react"

interface Tip {
  id: string
  title: string
  category: "cv" | "interview" | "remote" | "market"
  content: string
  date: string
  readTime: string
}

export default function TipsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Mock data for tips
  const tips: Tip[] = [
    {
      id: "1",
      title: "How to Write a Standout CV for Tech Jobs",
      category: "cv",
      content: "Learn the key elements that make your CV stand out in the tech industry...",
      date: "2024-03-15",
      readTime: "5 min read"
    },
    {
      id: "2",
      title: "Common Interview Questions and How to Answer Them",
      category: "interview",
      content: "Prepare for your next interview with these common questions...",
      date: "2024-03-14",
      readTime: "7 min read"
    },
    // Add more tips...
  ]

  const filteredTips = tips.filter(tip => {
    const matchesSearch = tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tip.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || tip.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">
            Tips & Resources
          </h1>
          <p className="text-xl text-gray-600">
            Expert advice to help you succeed in your job search
          </p>
        </div>

        {/* Search and Categories */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-[#c084fc] hover:bg-[#a855f7]">
              <MessageSquare className="w-4 h-4 mr-2" />
              Ask for Help
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="cv">CV Tips</TabsTrigger>
                <TabsTrigger value="interview">Interview Prep</TabsTrigger>
                <TabsTrigger value="remote">Remote Work</TabsTrigger>
                <TabsTrigger value="market">SA Job Market</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedCategory}>
                <div className="space-y-6">
                  {filteredTips.map((tip) => (
                    <Card key={tip.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-medium mb-2">{tip.title}</h3>
                            <p className="text-gray-600 mb-4">{tip.content}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{new Date(tip.date).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{tip.readTime}</span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {tip.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Popular Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tips.slice(0, 3).map((tip) => (
                    <div key={tip.id} className="border-b pb-4 last:border-0">
                      <h4 className="font-medium mb-1">{tip.title}</h4>
                      <p className="text-sm text-gray-500">{tip.readTime}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["CV Tips", "Interview Prep", "Remote Work", "SA Job Market"].map((category) => (
                    <Button
                      key={category}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.toLowerCase().replace(" ", ""))}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Need Help? */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Our experts are here to help you with your job search journey.
                </p>
                <Button className="w-full bg-[#c084fc] hover:bg-[#a855f7]">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 