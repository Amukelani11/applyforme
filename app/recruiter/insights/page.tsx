"use client"
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { 
  Send, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Briefcase, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lightbulb,
  BarChart3,
  Target,
  Zap,
  Globe,
  Building2,
  GraduationCap,
  Award,
  FileText,
  ExternalLink,
  Copy,
  Download,
  Share2
} from "lucide-react";

interface ResearchMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ResearchPlan {
  id: string;
  title: string;
  description: string;
  steps: string[];
  estimatedTime: string;
  status: 'pending' | 'approved' | 'in-progress' | 'completed';
}

interface ResearchResult {
  id: string;
  sector: string;
  industry: string;
  salaryData: {
    entry: string;
    mid: string;
    senior: string;
    executive: string;
  };
  experienceRequirements: {
    entry: string[];
    mid: string[];
    senior: string[];
    executive: string[];
  };
  skills: string[];
  marketTrends: string[];
  companies: string[];
  certifications: string[];
  insights: string[];
  sources: string[];
}

export default function RecruiterInsightsPage() {
  const [messages, setMessages] = useState<ResearchMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your South African Market Research Assistant. I can help you research any industry sector, including salary expectations, experience requirements, market trends, and more. What would you like to research today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchPlan, setResearchPlan] = useState<ResearchPlan | null>(null);
  const [researchResults, setResearchResults] = useState<ResearchResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, type: 'user' | 'assistant') => {
    const newMessage: ResearchMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = (content: string, callback: () => void) => {
    const typingMessage: ResearchMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    let index = 0;
    const interval = setInterval(() => {
      if (index < content.length) {
        setMessages(prev => 
          prev.map(msg => 
            msg.isTyping 
              ? { ...msg, content: content.substring(0, index + 1) }
              : msg
          )
        );
        index++;
      } else {
        clearInterval(interval);
        setMessages(prev => 
          prev.map(msg => 
            msg.isTyping 
              ? { ...msg, isTyping: false }
              : msg
          )
        );
        callback();
      }
    }, 30);
  };

  const generateResearchPlan = async (query: string) => {
    try {
      const response = await fetch('/api/ai-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          type: 'plan'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate research plan');
      }

      const data = await response.json();
      const plan = data.plan;
      setResearchPlan(plan);
      return plan;
    } catch (error) {
      console.error('Error generating research plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate research plan. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const executeResearch = async (plan: ResearchPlan, query: string) => {
    setIsResearching(true);
    setCurrentStep(0);
    setProgress(0);

    try {
      // Update progress for each step
      for (let i = 0; i < plan.steps.length; i++) {
        setCurrentStep(i);
        setProgress((i / plan.steps.length) * 100);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setProgress(100);
      setCurrentStep(plan.steps.length - 1);

      // Call AI API for research
      const response = await fetch('/api/ai-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          type: 'research',
          plan
        })
      });

      if (!response.ok) {
        throw new Error('Failed to execute research');
      }

      const data = await response.json();
      const results = data.results;
      setResearchResults(results);
    } catch (error) {
      console.error('Error executing research:', error);
      toast({
        title: "Error",
        description: "Failed to execute research. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResearching(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage(userMessage, 'user');

    // Check if this is a research request
    if (userMessage.toLowerCase().includes('research') || 
        userMessage.toLowerCase().includes('supply chain') || 
        userMessage.toLowerCase().includes('mining') ||
        userMessage.toLowerCase().includes('software') ||
        userMessage.toLowerCase().includes('finance') ||
        userMessage.toLowerCase().includes('healthcare')) {
      
      simulateTyping(`I'll help you research the ${userMessage.includes('supply chain') ? 'Supply Chain Management' : 'requested'} sector. Let me create a comprehensive research plan for you.`, async () => {
        const plan = await generateResearchPlan(userMessage);
        
        if (plan) {
          setTimeout(() => {
            simulateTyping(`Here's my research plan for analyzing the ${plan.title} in South Africa:

**Research Plan:**
${plan.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

**Estimated Time:** ${plan.estimatedTime}

Would you like me to proceed with this research? I'll gather comprehensive data on salaries, experience requirements, market trends, and industry insights.`, () => {
              setResearchPlan(plan);
            });
          }, 1000);
        } else {
          simulateTyping("I apologize, but I encountered an error while generating the research plan. Please try again with a more specific query.", () => {});
        }
      });
    } else {
      simulateTyping("I can help you research any South African industry sector. Please specify what you'd like to research, for example: 'Research the supply chain management sector in the mining industry' or 'Research software development salaries in Cape Town'.", () => {});
    }
  };

  const handleApproveResearch = async () => {
    if (!researchPlan) return;

    setResearchPlan(prev => prev ? { ...prev, status: 'in-progress' } : null);
    addMessage("Yes, please proceed with the research.", 'user');

    simulateTyping("Perfect! I'll start researching now. This will take about 4-6 minutes as I gather comprehensive data from multiple sources including industry reports, salary surveys, and market analysis.", () => {
      setTimeout(() => {
        executeResearch(researchPlan, researchPlan.title);
      }, 2000);
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Globe className="w-8 h-8 mr-3 text-purple-600" />
            South African Market Research
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI-powered research assistant for South African industry insights, salary benchmarks, and market intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2 text-purple-600" />
                  Research Assistant
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-3`}>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          {message.isTyping && (
                            <div className="flex space-x-1 mt-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Research Progress */}
                {isResearching && (
                  <div className="border-t p-6 bg-blue-50">
                    <div className="flex items-center mb-3">
                      <Loader2 className="w-5 h-5 mr-2 text-blue-600 animate-spin" />
                      <span className="font-medium text-blue-900">Researching...</span>
                    </div>
                    <Progress value={progress} className="mb-3" />
                    <p className="text-sm text-blue-700">
                      {researchPlan?.steps[currentStep]}
                    </p>
                  </div>
                )}

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me to research any South African industry sector..."
                      className="flex-1"
                      disabled={isResearching}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isResearching}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Research Plan & Results */}
          <div className="space-y-6">
            {/* Research Plan */}
            {researchPlan && researchPlan.status === 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    Research Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{researchPlan.title}</h4>
                      <p className="text-sm text-gray-600">{researchPlan.description}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Research Steps:</h5>
                      <ul className="space-y-2">
                        {researchPlan.steps.map((step, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mr-2 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-sm text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      Estimated time: {researchPlan.estimatedTime}
                    </div>

                    <Button 
                      onClick={handleApproveResearch}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Start Research
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Research Results */}
            {researchResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                    Research Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sector Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{researchResults.sector}</h4>
                    <Badge variant="secondary">{researchResults.industry}</Badge>
                  </div>

                  {/* Salary Data */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Salary Benchmarks
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Entry Level:</span>
                        <span className="font-medium">{researchResults.salaryData.entry}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mid Level:</span>
                        <span className="font-medium">{researchResults.salaryData.mid}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Senior Level:</span>
                        <span className="font-medium">{researchResults.salaryData.senior}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Executive:</span>
                        <span className="font-medium">{researchResults.salaryData.executive}</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Skills */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Zap className="w-4 h-4 mr-1" />
                      Key Skills
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {researchResults.skills.slice(0, 8).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Market Trends */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Market Trends
                    </h5>
                    <ul className="space-y-1">
                      {researchResults.marketTrends.slice(0, 3).map((trend, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 mt-2 flex-shrink-0" />
                          {trend}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-amber-600" />
                  Quick Research Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    "Software Development in Cape Town",
                    "Finance Sector in Johannesburg", 
                    "Healthcare in Pretoria",
                    "Manufacturing in Durban",
                    "Mining Supply Chain Management"
                  ].map((topic, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-sm h-auto py-2"
                      onClick={() => setInputValue(topic)}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {topic}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 