"use client"
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  MessageSquare, 
  Clock, 
  Star, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Send,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Building,
  Award,
  BarChart3,
  Target,
  Zap,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  FileText,
  Download,
  Share2
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  appliedDate: Date;
  lastContact: Date;
  experienceScore: number;
  feedback: string[];
  touchpoints: Touchpoint[];
  status: 'active' | 'at-risk' | 'excellent';
}

interface Touchpoint {
  id: string;
  type: 'email' | 'call' | 'interview' | 'feedback' | 'offer';
  date: Date;
  description: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  responseTime?: number; // in hours
}

interface ExperienceMetrics {
  overallScore: number;
  responseTime: number;
  communicationQuality: number;
  processTransparency: number;
  candidateSatisfaction: number;
  dropoffRate: number;
}

export default function CandidateExperiencePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [metrics, setMetrics] = useState<ExperienceMetrics>({
    overallScore: 4.2,
    responseTime: 24,
    communicationQuality: 4.5,
    processTransparency: 4.1,
    candidateSatisfaction: 4.3,
    dropoffRate: 15
  });
  const [filterStage, setFilterStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate loading candidate data
    const mockCandidates: Candidate[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+27 82 123 4567',
        position: 'Senior Software Developer',
        stage: 'interview',
        appliedDate: new Date('2024-01-15'),
        lastContact: new Date('2024-01-20'),
        experienceScore: 4.5,
        feedback: [
          'Very responsive communication',
          'Clear interview process',
          'Professional team interaction'
        ],
        touchpoints: [
          {
            id: '1',
            type: 'email',
            date: new Date('2024-01-16'),
            description: 'Application confirmation sent',
            sentiment: 'positive',
            responseTime: 2
          },
          {
            id: '2',
            type: 'call',
            date: new Date('2024-01-18'),
            description: 'Initial screening call',
            sentiment: 'positive',
            responseTime: 48
          },
          {
            id: '3',
            type: 'interview',
            date: new Date('2024-01-20'),
            description: 'Technical interview scheduled',
            sentiment: 'positive',
            responseTime: 24
          }
        ],
        status: 'excellent'
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+27 83 234 5678',
        position: 'Product Manager',
        stage: 'screening',
        appliedDate: new Date('2024-01-18'),
        lastContact: new Date('2024-01-19'),
        experienceScore: 3.8,
        feedback: [
          'Good initial response',
          'Would like more process details'
        ],
        touchpoints: [
          {
            id: '1',
            type: 'email',
            date: new Date('2024-01-19'),
            description: 'Application received confirmation',
            sentiment: 'positive',
            responseTime: 4
          },
          {
            id: '2',
            type: 'email',
            date: new Date('2024-01-19'),
            description: 'Screening questionnaire sent',
            sentiment: 'neutral',
            responseTime: 24
          }
        ],
        status: 'active'
      },
      {
        id: '3',
        name: 'Lisa Mokoena',
        email: 'lisa.mokoena@email.com',
        phone: '+27 84 345 6789',
        position: 'UX Designer',
        stage: 'applied',
        appliedDate: new Date('2024-01-20'),
        lastContact: new Date('2024-01-20'),
        experienceScore: 2.5,
        feedback: [
          'No response yet',
          'Application submitted successfully'
        ],
        touchpoints: [
          {
            id: '1',
            type: 'email',
            date: new Date('2024-01-20'),
            description: 'Application submitted',
            sentiment: 'neutral',
            responseTime: 0
          }
        ],
        status: 'at-risk'
      }
    ];

    setCandidates(mockCandidates);
  }, []);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesStage = filterStage === 'all' || candidate.stage === filterStage;
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'at-risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'applied': return 'bg-gray-100 text-gray-800';
      case 'screening': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case 'negative': return <ThumbsDown className="w-4 h-4 text-red-600" />;
      default: return <MessageCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const addTouchpoint = (candidateId: string, touchpoint: Omit<Touchpoint, 'id'>) => {
    setCandidates(prev => prev.map(candidate => {
      if (candidate.id === candidateId) {
        const newTouchpoint: Touchpoint = {
          ...touchpoint,
          id: Date.now().toString()
        };
        return {
          ...candidate,
          touchpoints: [...candidate.touchpoints, newTouchpoint],
          lastContact: new Date()
        };
      }
      return candidate;
    }));

    toast({
      title: "Touchpoint Added",
      description: "New candidate interaction has been recorded.",
    });
  };

  const updateExperienceScore = (candidateId: string, score: number) => {
    setCandidates(prev => prev.map(candidate => {
      if (candidate.id === candidateId) {
        return {
          ...candidate,
          experienceScore: score
        };
      }
      return candidate;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Heart className="w-8 h-8 mr-3 text-pink-600" />
            Candidate Experience Tracker
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Monitor and improve candidate experience throughout the hiring process with real-time insights and automated touchpoints
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Experience Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Experience Metrics Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{metrics.overallScore}</div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                    <div className="flex justify-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= metrics.overallScore ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{metrics.responseTime}h</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{metrics.communicationQuality}</div>
                    <div className="text-sm text-gray-600">Communication Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">{metrics.processTransparency}</div>
                    <div className="text-sm text-gray-600">Process Transparency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">{metrics.candidateSatisfaction}</div>
                    <div className="text-sm text-gray-600">Candidate Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">{metrics.dropoffRate}%</div>
                    <div className="text-sm text-gray-600">Dropoff Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidates List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    Candidate Experience Dashboard
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Search candidates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Select value={filterStage} onValueChange={setFilterStage}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stages</SelectItem>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="screening">Screening</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCandidates.map((candidate) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                            <p className="text-sm text-gray-600">{candidate.position}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStageColor(candidate.stage)}>
                                {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
                              </Badge>
                              <Badge className={getStatusColor(candidate.status)}>
                                {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-semibold">{candidate.experienceScore}</span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Last contact: {candidate.lastContact.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Send Follow-up
                </Button>
                <Button className="w-full" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Schedule Call
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            {/* Experience Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  Experience Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-medium">24h avg</span>
                </div>
                <Progress value={80} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Communication</span>
                  <span className="text-sm font-medium">4.5/5</span>
                </div>
                <Progress value={90} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Transparency</span>
                  <span className="text-sm font-medium">4.1/5</span>
                </div>
                <Progress value={82} className="h-2" />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Sarah Johnson</p>
                      <p className="text-xs text-gray-500">Interview scheduled</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Michael Chen</p>
                      <p className="text-xs text-gray-500">Screening completed</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Lisa Mokoena</p>
                      <p className="text-xs text-gray-500">Application received</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Candidate Experience Details</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCandidate(null)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Candidate Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Candidate Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{selectedCandidate.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{selectedCandidate.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedCandidate.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span>{selectedCandidate.position}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Applied: {selectedCandidate.appliedDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Experience Score */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Experience Score</h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">{selectedCandidate.experienceScore}</div>
                      <div className="flex justify-center mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 ${star <= selectedCandidate.experienceScore ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <Badge className={getStatusColor(selectedCandidate.status)}>
                        {selectedCandidate.status.charAt(0).toUpperCase() + selectedCandidate.status.slice(1)} Experience
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Touchpoints */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Interaction History</h3>
                  <div className="space-y-4">
                    {selectedCandidate.touchpoints.map((touchpoint) => (
                      <div key={touchpoint.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getSentimentIcon(touchpoint.sentiment)}
                            <span className="font-medium capitalize">{touchpoint.type}</span>
                            <Badge variant="outline">{touchpoint.date.toLocaleDateString()}</Badge>
                          </div>
                          {touchpoint.responseTime !== undefined && (
                            <span className="text-sm text-gray-500">
                              {touchpoint.responseTime}h response
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700">{touchpoint.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Feedback */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Candidate Feedback</h3>
                  <div className="space-y-2">
                    {selectedCandidate.feedback.map((feedback, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <MessageCircle className="w-4 h-4 text-gray-500 mt-1" />
                        <span className="text-gray-700">{feedback}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Experience
                  </Button>
                  <Button>
                    <Send className="w-4 h-4 mr-2" />
                    Send Follow-up
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 