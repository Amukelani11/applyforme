"use client"

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  Upload, 
  Brain, 
  Users, 
  Target, 
  Star, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Download,
  Share2,
  Eye,
  Filter,
  TrendingUp,
  Award,
  Clock,
  FileText,
  MessageSquare,
  Zap,
  BarChart3,
  UserCheck,
  UserX,
  UserMinus
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  resume: string;
  jobTitle: string;
  experience: number;
  skills: string[];
  aiScore: number;
  culturalFit: number;
  technicalFit: number;
  overallScore: number;
  status: 'pending' | 'approved' | 'rejected' | 'shortlisted';
  analysis: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    riskFactors: string[];
  };
  timestamp: Date;
}

interface ScreeningCriteria {
  technicalSkills: number;
  experience: number;
  culturalFit: number;
  education: number;
  certifications: number;
}

export default function CandidateScreeningPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [screeningCriteria, setScreeningCriteria] = useState<ScreeningCriteria>({
    technicalSkills: 30,
    experience: 25,
    culturalFit: 20,
    education: 15,
    certifications: 10
  });
  const [autoApprove, setAutoApprove] = useState(false);
  const [autoReject, setAutoReject] = useState(false);
  const [approvalThreshold, setApprovalThreshold] = useState(80);
  const [rejectionThreshold, setRejectionThreshold] = useState(40);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newCandidates: Candidate[] = Array.from(files).map((file, index) => ({
      id: Date.now().toString() + index,
      name: `Candidate ${index + 1}`,
      email: `candidate${index + 1}@example.com`,
      resume: file.name,
      jobTitle: "Software Developer",
      experience: Math.floor(Math.random() * 10) + 1,
      skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
      aiScore: 0,
      culturalFit: 0,
      technicalFit: 0,
      overallScore: 0,
      status: 'pending',
      analysis: {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        riskFactors: []
      },
      timestamp: new Date()
    }));

    setCandidates(prev => [...prev, ...newCandidates]);
    toast({
      title: "Candidates Added",
      description: `${files.length} candidates have been added for screening.`,
    });
  };

  const simulateAIAnalysis = async (candidate: Candidate) => {
    setIsAnalyzing(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

    const technicalScore = Math.floor(Math.random() * 40) + 60;
    const culturalScore = Math.floor(Math.random() * 30) + 70;
    const overallScore = Math.floor(
      (technicalScore * screeningCriteria.technicalSkills + 
       culturalScore * screeningCriteria.culturalFit + 
       candidate.experience * 10 * screeningCriteria.experience) / 100
    );

    const updatedCandidate: Candidate = {
      ...candidate,
      aiScore: overallScore,
      culturalFit: culturalScore,
      technicalFit: technicalScore,
      overallScore,
      analysis: {
        strengths: [
          "Strong technical background in relevant technologies",
          "Good communication skills demonstrated in resume",
          "Relevant project experience",
          "Continuous learning mindset"
        ],
        weaknesses: [
          "Limited experience with cloud platforms",
          "Could benefit from more leadership experience",
          "Some gaps in advanced technical skills"
        ],
        recommendations: [
          "Consider for technical interview",
          "Assess cloud computing knowledge",
          "Evaluate leadership potential"
        ],
        riskFactors: [
          "May require additional training",
          "Salary expectations might be high"
        ]
      },
      status: overallScore >= approvalThreshold ? 'shortlisted' : 
              overallScore <= rejectionThreshold ? 'rejected' : 'pending'
    };

    setCandidates(prev => 
      prev.map(c => c.id === candidate.id ? updatedCandidate : c)
    );

    if (autoApprove && overallScore >= approvalThreshold) {
      toast({
        title: "Candidate Auto-Approved",
        description: `${candidate.name} has been automatically shortlisted.`,
      });
    } else if (autoReject && overallScore <= rejectionThreshold) {
      toast({
        title: "Candidate Auto-Rejected",
        description: `${candidate.name} has been automatically rejected.`,
      });
    }

    setIsAnalyzing(false);
  };

  const analyzeAllCandidates = async () => {
    setIsAnalyzing(true);
    try {
      for (const candidate of candidates.filter(c => c.status === 'pending')) {
        await simulateAIAnalysis(candidate);
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      toast({ title: "Analysis Complete", description: "All candidates have been analyzed by AI." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Brain className="w-8 h-8 mr-3 text-purple-600" />
            AI Candidate Screening
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced AI-powered candidate evaluation with skills matching, cultural fit analysis, and automated scoring
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-purple-600" />
                  Upload Candidates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Upload resumes or candidate profiles for AI analysis
                  </p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Screening Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Screening Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Technical Skills Weight</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Progress value={screeningCriteria.technicalSkills} className="flex-1" />
                      <span className="text-sm font-medium w-12">{screeningCriteria.technicalSkills}%</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Experience Weight</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Progress value={screeningCriteria.experience} className="flex-1" />
                      <span className="text-sm font-medium w-12">{screeningCriteria.experience}%</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Cultural Fit Weight</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Progress value={screeningCriteria.culturalFit} className="flex-1" />
                      <span className="text-sm font-medium w-12">{screeningCriteria.culturalFit}%</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Education Weight</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Progress value={screeningCriteria.education} className="flex-1" />
                      <span className="text-sm font-medium w-12">{screeningCriteria.education}%</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Auto-Approve High Scorers</Label>
                      <p className="text-xs text-gray-500">Automatically shortlist candidates above threshold</p>
                    </div>
                    <Switch
                      checked={autoApprove}
                      onCheckedChange={setAutoApprove}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Auto-Reject Low Scorers</Label>
                      <p className="text-xs text-gray-500">Automatically reject candidates below threshold</p>
                    </div>
                    <Switch
                      checked={autoReject}
                      onCheckedChange={setAutoReject}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Approval Threshold</Label>
                    <Input
                      type="number"
                      value={approvalThreshold}
                      onChange={(e) => setApprovalThreshold(parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Rejection Threshold</Label>
                    <Input
                      type="number"
                      value={rejectionThreshold}
                      onChange={(e) => setRejectionThreshold(parseInt(e.target.value))}
                      className="mt-1"
                    />
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
                    Candidates ({candidates.length})
                  </CardTitle>
                  <Button
                    onClick={analyzeAllCandidates}
                    disabled={isAnalyzing || candidates.filter(c => c.status === 'pending').length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    {isAnalyzing ? 'Analyzing...' : 'Analyze All'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {candidates.map((candidate) => (
                      <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                              <Badge className={getStatusColor(candidate.status)}>
                                {candidate.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{candidate.jobTitle}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">
                                {candidate.experience} years experience
                              </span>
                              {candidate.overallScore > 0 && (
                                <span className={`text-sm font-medium ${getScoreColor(candidate.overallScore)}`}>
                                  Score: {candidate.overallScore}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {candidate.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  simulateAIAnalysis(candidate);
                                }}
                                disabled={isAnalyzing}
                              >
                                <Brain className="w-4 h-4 mr-1" />
                                Analyze
                              </Button>
                            )}
                            <Eye className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {candidates.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No candidates uploaded yet</p>
                      <p className="text-sm">Upload resumes to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {candidates.filter(c => c.status === 'shortlisted').length}
                    </div>
                    <div className="text-sm text-green-700">Shortlisted</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {candidates.filter(c => c.status === 'rejected').length}
                    </div>
                    <div className="text-sm text-red-700">Rejected</div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {candidates.filter(c => c.status === 'pending').length}
                  </div>
                  <div className="text-sm text-blue-700">Pending Review</div>
                </div>

                {candidates.length > 0 && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(candidates.reduce((acc, c) => acc + c.overallScore, 0) / candidates.length)}%
                    </div>
                    <div className="text-sm text-purple-700">Average Score</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Report
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Candidates
                </Button>
              </CardContent>
            </Card>

            {/* Selected Candidate Details */}
            {selectedCandidate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-purple-600" />
                    Candidate Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedCandidate.name}</h3>
                    <p className="text-sm text-gray-600">{selectedCandidate.email}</p>
                  </div>

                  {selectedCandidate.overallScore > 0 && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Score</span>
                          <span className={`font-medium ${getScoreColor(selectedCandidate.overallScore)}`}>
                            {selectedCandidate.overallScore}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Technical Fit</span>
                          <span>{selectedCandidate.technicalFit}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Cultural Fit</span>
                          <span>{selectedCandidate.culturalFit}%</span>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
                        <ul className="space-y-1">
                          {selectedCandidate.analysis.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {selectedCandidate.analysis.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <Award className="w-3 h-3 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 