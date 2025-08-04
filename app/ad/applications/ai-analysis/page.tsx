'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Minus,
  Sparkles,
  Award,
  Briefcase,
  GraduationCap,
  Users,
  Clock,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AIAnalysis {
  overall_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  key_insights: string[];
  strengths: string[];
  concerns: string[];
  skills_match: {
    score: number;
    matched_skills: string[];
    missing_skills: string[];
  };
  experience_analysis: {
    total_years: number;
    relevance_score: number;
    progression: string;
    gaps: string[];
  };
  education_assessment: {
    relevance: string;
    level: string;
    notes: string;
  };
  recommendation: 'hire' | 'interview' | 'consider' | 'reject';
  next_steps: string[];
}

// Mock data
const mockCandidates = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    avatar: null,
    ai_score: 92,
    status: 'shortlisted',
    location: 'Cape Town, South Africa',
    experience: '5 years',
    education: 'BSc Computer Science',
    applied_date: '2024-01-15',
    source: 'Public Job Link'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    avatar: null,
    ai_score: 78,
    status: 'under_review',
    location: 'Johannesburg, South Africa',
    experience: '3 years',
    education: 'BSc Software Engineering',
    applied_date: '2024-01-16',
    source: 'LinkedIn'
  },
  {
    id: '3',
    name: 'Lisa Mokoena',
    email: 'lisa.mokoena@email.com',
    avatar: null,
    ai_score: 65,
    status: 'new',
    location: 'Durban, South Africa',
    experience: '2 years',
    education: 'Diploma in IT',
    applied_date: '2024-01-17',
    source: 'Indeed'
  }
];

const mockAIAnalysis: AIAnalysis = {
  overall_score: 85,
  confidence_level: 'high',
  key_insights: [
    'Strong technical background with 5+ years of experience',
    'Excellent problem-solving skills demonstrated in previous roles',
    'Good cultural fit based on communication style and values',
    'Some gaps in modern cloud technologies but strong fundamentals'
  ],
  strengths: [
    'Expert in React, Node.js, and TypeScript',
    'Proven track record of leading development teams',
    'Strong analytical and problem-solving abilities',
    'Excellent communication and collaboration skills',
    'Experience with agile methodologies and CI/CD pipelines'
  ],
  concerns: [
    'Limited experience with cloud platforms (AWS/Azure)',
    'No recent experience with microservices architecture',
    'Could benefit from more exposure to DevOps practices'
  ],
  skills_match: {
    score: 87,
    matched_skills: [
      'JavaScript/TypeScript',
      'React.js',
      'Node.js',
      'Git',
      'REST APIs',
      'SQL',
      'Agile/Scrum',
      'Team Leadership'
    ],
    missing_skills: [
      'AWS/Azure',
      'Docker',
      'Kubernetes',
      'Microservices',
      'GraphQL'
    ]
  },
  experience_analysis: {
    total_years: 5,
    relevance_score: 85,
    progression: 'excellent',
    gaps: [
      'Cloud infrastructure experience',
      'Modern DevOps practices',
      'Microservices architecture'
    ]
  },
  education_assessment: {
    relevance: 'high',
    level: 'bachelor',
    notes: 'Computer Science degree provides strong theoretical foundation'
  },
  recommendation: 'interview',
  next_steps: [
    'Schedule technical interview to assess cloud knowledge',
    'Prepare coding challenges focusing on system design',
    'Discuss career growth and learning opportunities',
    'Evaluate cultural fit through team interviews'
  ]
};

export default function AdAIAnalysisPage() {
  const [selectedCandidate, setSelectedCandidate] = useState(mockCandidates[0]);
  const [aiAnalysis] = useState<AIAnalysis>(mockAIAnalysis);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'hire': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'interview': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'consider': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'reject': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'hire': return <CheckCircle className="w-4 h-4" />;
      case 'interview': return <Users className="w-4 h-4" />;
      case 'consider': return <AlertTriangle className="w-4 h-4" />;
      case 'reject': return <XCircle className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  AI Analysis Dashboard
                </h1>
                <p className="text-sm text-gray-500">AI-powered candidate insights and recommendations</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Candidate List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Candidates Analyzed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCandidates.map((candidate) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                        selectedCandidate.id === candidate.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 bg-white hover:border-purple-200"
                      )}
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {candidate.name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {candidate.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={cn(
                            "text-lg font-bold",
                            getScoreColor(candidate.ai_score)
                          )}>
                            {candidate.ai_score}%
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs mt-1",
                              candidate.status === 'shortlisted' ? 'border-green-200 text-green-700 bg-green-50' :
                              candidate.status === 'under_review' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                              'border-gray-200 text-gray-700 bg-gray-50'
                            )}
                          >
                            {candidate.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{candidate.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-3 h-3" />
                            <span>{candidate.experience}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Analysis */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {/* Candidate Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-xl font-semibold">
                          {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {selectedCandidate.name}
                        </CardTitle>
                        <p className="text-gray-600">{selectedCandidate.email}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{selectedCandidate.location}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{selectedCandidate.experience}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <GraduationCap className="w-4 h-4" />
                            <span>{selectedCandidate.education}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-3xl font-bold mb-2",
                        getScoreColor(selectedCandidate.ai_score)
                      )}>
                        {selectedCandidate.ai_score}%
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-sm",
                          getRecommendationColor(aiAnalysis.recommendation)
                        )}
                      >
                        {getRecommendationIcon(aiAnalysis.recommendation)}
                        <span className="ml-1 capitalize">{aiAnalysis.recommendation}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* AI Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                    AI Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Skills Match */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">Skills Match</h3>
                        <span className={cn(
                          "text-lg font-bold",
                          getScoreColor(aiAnalysis.skills_match.score)
                        )}>
                          {aiAnalysis.skills_match.score}%
                        </span>
                      </div>
                      <Progress 
                        value={aiAnalysis.skills_match.score} 
                        className="h-3"
                      />
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-emerald-700 mb-2 flex items-center">
                            <Check className="w-4 h-4 mr-1" />
                            Matched Skills ({aiAnalysis.skills_match.matched_skills.length})
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {aiAnalysis.skills_match.matched_skills.map((skill, index) => (
                              <Badge 
                                key={skill} 
                                variant="outline" 
                                className="text-xs bg-emerald-50 border-emerald-200 text-emerald-700"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-orange-700 mb-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Missing Skills ({aiAnalysis.skills_match.missing_skills.length})
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {aiAnalysis.skills_match.missing_skills.map((skill, index) => (
                              <Badge 
                                key={skill} 
                                variant="outline" 
                                className="text-xs bg-orange-50 border-orange-200 text-orange-700"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Experience Analysis */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">Experience Relevance</h3>
                        <span className={cn(
                          "text-lg font-bold",
                          getScoreColor(aiAnalysis.experience_analysis.relevance_score)
                        )}>
                          {aiAnalysis.experience_analysis.relevance_score}%
                        </span>
                      </div>
                      <Progress 
                        value={aiAnalysis.experience_analysis.relevance_score} 
                        className="h-3"
                      />
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            {aiAnalysis.experience_analysis.total_years}
                          </div>
                          <div className="text-sm text-gray-600">Years Experience</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className={cn(
                            "text-2xl font-bold capitalize",
                            aiAnalysis.experience_analysis.progression === 'excellent' ? 'text-emerald-600' :
                            aiAnalysis.experience_analysis.progression === 'good' ? 'text-purple-600' :
                            'text-yellow-600'
                          )}>
                            {aiAnalysis.experience_analysis.progression}
                          </div>
                          <div className="text-sm text-gray-600">Career Progression</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            {aiAnalysis.experience_analysis.gaps.length}
                          </div>
                          <div className="text-sm text-gray-600">Experience Gaps</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Strengths */}
                    <div>
                      <h3 className="font-medium text-emerald-900 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {aiAnalysis.strengths.map((strength, index) => (
                          <motion.li 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-start space-x-2"
                          >
                            <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{strength}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Concerns */}
                    <div>
                      <h3 className="font-medium text-orange-900 mb-3 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                        Areas for Consideration
                      </h3>
                      <ul className="space-y-2">
                        {aiAnalysis.concerns.map((concern, index) => (
                          <motion.li 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-start space-x-2"
                          >
                            <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{concern}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Next Steps */}
                    <div>
                      <h3 className="font-medium text-purple-900 mb-3 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                        Recommended Next Steps
                      </h3>
                      <ul className="space-y-2">
                        {aiAnalysis.next_steps.map((step, index) => (
                          <motion.li 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-start space-x-2"
                          >
                            <div className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5 flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-gray-700">{step}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Confidence Level */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Analysis Confidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-sm font-medium",
                        aiAnalysis.confidence_level === 'high' 
                          ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                          : aiAnalysis.confidence_level === 'medium'
                          ? 'border-yellow-200 text-yellow-700 bg-yellow-50'
                          : 'border-gray-200 text-gray-700 bg-gray-50'
                      )}
                    >
                      {aiAnalysis.confidence_level === 'high' ? 'High Confidence' :
                       aiAnalysis.confidence_level === 'medium' ? 'Medium Confidence' :
                       'Low Confidence'}
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Based on comprehensive analysis of resume, experience, and skills match
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 