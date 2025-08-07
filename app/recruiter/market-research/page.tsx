"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Brain, 
  ArrowLeft, 
  X, 
  Send, 
  Download, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Loader2, 
  CheckCircle, 
  Globe, 
  ExternalLink,
  Settings,
  Save,
  Building
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DeepResearchPanel } from "@/components/research/deep-research-panel"
import React from "react"

type ResearchMode = "quick" | "full"
type AppState = "initial" | "planning" | "researching" | "complete" | "chat"

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

interface ResearchStep {
  id: string
  title: string
  status: 'pending' | 'loading' | 'completed' | 'error'
  description?: string
  sources?: string[]
  progress?: number
}

export default function TalentIntelligenceEngine() {
  const [query, setQuery] = useState("")
  const [mode, setMode] = useState<ResearchMode>("quick")
  const [appState, setAppState] = useState<AppState>("initial")
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [researchActivity, setResearchActivity] = useState<Array<{
    type: 'search' | 'extract' | 'analyze' | 'reasoning' | 'synthesis' | 'thought';
    status: 'pending' | 'complete' | 'error';
    message: string;
    timestamp: string;
  }>>([])
  const [researchSources, setResearchSources] = useState<Array<{
    url: string;
    title: string;
    domain: string;
    description?: string;
  }>>([])
  const { toast } = useToast()
  const chatAreaRef = useRef<HTMLDivElement>(null)
  const rightContentRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messageIdCounter = useRef(0)

  // Auto-scroll chat to bottom when new messages are added (natural chat behavior)
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [chatHistory])

  // Auto-scroll is now handled by the DeepResearchPanel component

  const addChatMessage = (type: "user" | "ai", content: string) => {
    messageIdCounter.current += 1
    const message: ChatMessage = {
      id: `msg-${messageIdCounter.current}-${Date.now()}-${type}`,
      type,
      content,
      timestamp: new Date()
    }
    setChatHistory(prev => [...prev, message])
  }



  // Function to detect if user wants to do research
  const isResearchRequest = (userInput: string): boolean => {
    const researchKeywords = [
      'research', 'market', 'salary', 'demand', 'trends', 'analysis', 'report',
      'benchmark', 'survey', 'data', 'statistics', 'hiring', 'recruitment',
      'talent', 'skills', 'companies', 'industry', 'jobs', 'employment',
      'compensation', 'pay', 'wages', 'market research', 'talent intelligence',
      'job market', 'salary survey', 'market analysis', 'industry report'
    ]
    
    const lowerInput = userInput.toLowerCase()
    return researchKeywords.some(keyword => lowerInput.includes(keyword))
  }

  // Function to handle regular chat responses
  const handleRegularChat = async (userMessage: string) => {
    // Simple chat responses for non-research queries
    const responses = [
      "I'm here to help with talent market research and general questions about the job market. What would you like to know?",
      "I can help you with market research, salary data, hiring trends, and more. Just let me know what you're looking for!",
      "Feel free to ask me about job markets, salaries, skills, or any talent-related topics. I'm here to assist!",
      "I'm your AI assistant for talent intelligence. I can research markets, analyze trends, or just chat about the job world.",
      "Need help with market research? I can analyze job markets, salaries, skills, and hiring trends. Just ask!"
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    addChatMessage("ai", randomResponse)
  }

  const handleSubmitQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter your research query to continue.",
        variant: "destructive"
      })
      return
    }

    const currentQuery = query.trim()
    
    // Clear the input immediately
    setQuery("")
    
    // Add user message to chat
    addChatMessage("user", currentQuery)
    
    // Check if this is a research request
    if (isResearchRequest(currentQuery)) {
      // Start research directly
      await handleStartResearch(currentQuery)
    } else {
      // Handle as regular chat
      setAppState("chat")
      await handleRegularChat(currentQuery)
    }
  }

  const handleStartResearch = async (researchQuery: string) => {
    setIsProcessing(true)
    setAppState("researching")
    setResults(null)
    setResearchActivity([])
    setResearchSources([])

    try {
      // Add AI response message to chat
      addChatMessage("ai", `Starting comprehensive research on "${researchQuery}" focused on the South African market...`)

      // Start streaming research from the new API
      const response = await fetch('/api/deep-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: researchQuery, mode }),
      })

      if (!response.ok) {
        throw new Error('Failed to start research')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream')
      }

      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'activity') {
                setResearchActivity(prev => [...prev, data.data])
              } else if (data.type === 'result') {
                setResults(data.data)
      setAppState("complete")
      
                // Extract sources from results
                if (data.data.sources) {
                  setResearchSources(data.data.sources.map((source: any) => ({
                    url: source.url,
                    title: source.title,
                    domain: source.domain,
                    description: source.description
                  })))
                }
                
                addChatMessage("ai", `Research complete! I've analyzed ${data.data.dataPoints || 0} sources and generated a comprehensive South African market report. You can view the detailed analysis on the right panel or continue chatting for more specific questions.`)
              } else if (data.type === 'error') {
                throw new Error(data.data.message)
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError)
            }
          }
        }
      }

    } catch (error: any) {
      console.error('Research error:', error)
      toast({
        title: "Research Failed",
        description: error.message || "Failed to complete market research. Please try again.",
        variant: "destructive"
      })
      setAppState("chat")
      addChatMessage("ai", "Sorry, the research failed. Please try again with a different query or check your internet connection.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNewQuery = () => {
    setAppState("initial")
    setQuery("")
    setResults(null)
    setResearchActivity([])
    setResearchSources([])
    setChatHistory([])
    messageIdCounter.current = 0
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (appState === "initial" || appState === "chat") {
        handleSubmitQuery()
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex">
      {/* Left Column - Chat History */}
      <div className="w-[30%] bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={handleNewQuery}>
              <ArrowLeft className="w-4 h-4 text-[#2A2A2A]" />
            </Button>
            <div>
              <h2 className="font-semibold text-[#121212] text-sm">Talent Intelligence Chat</h2>
              <p className="text-[#2A2A2A] text-xs">AI-powered research assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4 text-[#2A2A2A]" />
          </Button>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={chatAreaRef}>
          {chatHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gradient-to-r from-[#c084fc] to-[#a855f7] rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <p className="text-[#2A2A2A] text-sm font-medium mb-1">Hello! I'm your intelligent talent research assistant</p>
              <p className="text-[#2A2A2A] text-xs">Ask me anything about talent markets, salaries, skills, and hiring trends.</p>
            </div>
          ) : (
            chatHistory.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user' 
                    ? 'bg-[#c084fc] text-white' 
                    : 'bg-white border border-gray-200 text-[#121212]'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-purple-100' : 'text-[#2A2A2A]'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Textarea
              ref={inputRef}
              placeholder={appState === "initial" ? "Enter a prompt for the engine..." : "Ask a question or request research..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[44px] max-h-[120px] resize-none text-sm border-gray-200 focus:border-[#c084fc] focus:ring-[#c084fc]"
              rows={1}
            />
            <Button 
              size="sm" 
              className="bg-[#c084fc] hover:bg-[#a855f7] text-white px-3"
              onClick={handleSubmitQuery}
              disabled={!query.trim() || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column - AI Reasoning View */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#121212]">Talent Intelligence Engine</h1>
            <p className="text-[#2A2A2A] text-sm">
              {appState === "initial" && "Ready to research?"}
              {appState === "researching" && "Researching..."}
              {appState === "complete" && "Research Complete"}
              {appState === "chat" && "Chat Mode"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs border-[#c084fc] text-[#c084fc]">PRO</Badge>
            <Button variant="ghost" size="sm" onClick={handleNewQuery}>
              <X className="w-4 h-4 text-[#2A2A2A]" />
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden p-6" ref={rightContentRef}>
          {appState === "initial" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-r from-[#c084fc] to-[#a855f7] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#121212] mb-3">Ready to Research?</h2>
                <p className="text-[#2A2A2A] text-sm leading-relaxed mb-6">
                  Ask me anything about talent markets, salaries, skills, and hiring trends. I'll research multiple sources and provide comprehensive insights.
                </p>
                <div className="space-y-2 text-left">
                  <p className="text-xs text-[#2A2A2A] font-medium">Try asking:</p>
                  <p className="text-xs text-[#2A2A2A]">"What's the demand for DevOps engineers in Johannesburg?"</p>
                  <p className="text-xs text-[#2A2A2A]">"Salary trends for data scientists in Cape Town"</p>
                  <p className="text-xs text-[#2A2A2A]">"Companies hiring frontend developers in South Africa"</p>
                </div>
              </div>
            </div>
          )}

          {appState === "chat" && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-r from-[#c084fc] to-[#a855f7] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#121212] mb-3">Chat Mode Active</h2>
                <p className="text-[#2A2A2A] text-sm leading-relaxed mb-6">
                  I'm here to help! Ask me general questions or request research on talent markets, salaries, and hiring trends.
                </p>
                <div className="space-y-2 text-left">
                  <p className="text-xs text-[#2A2A2A] font-medium">You can:</p>
                  <p className="text-xs text-[#2A2A2A]">• Chat about general topics</p>
                  <p className="text-xs text-[#2A2A2A]">• Ask for market research</p>
                  <p className="text-xs text-[#2A2A2A]">• Get salary insights</p>
                  <p className="text-xs text-[#2A2A2A]">• Discuss hiring trends</p>
                </div>
              </div>
            </div>
          )}



          {(appState === "researching" || (researchActivity.length > 0 && appState !== "complete")) && (
            <DeepResearchPanel
              isActive={true}
              isLoading={isProcessing}
              activity={researchActivity}
              sources={researchSources}
              className="h-full"
            />
          )}

          {appState === "complete" && results && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#121212] mb-2">Talent Market Report</h2>
                  <p className="text-[#2A2A2A] text-sm">Comprehensive analysis of "{query}"</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="prose prose-lg max-w-none">
                    <div 
                      className="text-[#121212] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: results.fullReport }} 
                  />
                      </div>
                      
                {/* Research Sources */}
                {results.sources && results.sources.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-[#121212] mb-3">Research Sources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.sources.slice(0, 6).map((source, index) => (
                        <div key={`${source.url}-${index}`} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-[#c084fc] rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-[#121212] line-clamp-1">{source.title}</p>
                            <p className="text-xs text-[#2A2A2A] line-clamp-1">{source.domain}</p>
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 