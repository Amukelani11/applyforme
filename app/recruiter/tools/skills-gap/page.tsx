"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  Target, 
  Users, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Zap,
  Download,
  Share2,
  Eye,
  Filter,
  BarChart3,
  Brain,
  GraduationCap,
  Lightbulb,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Search,
  Filter as FilterIcon
} from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
  impact: 'critical' | 'important' | 'nice-to-have';
  trainingOptions: TrainingOption[];
  marketDemand: number;
  salaryImpact: number;
}

interface TrainingOption {
  id: string;
  name: string;
  provider: string;
  duration: string;
  cost: string;
  format: 'online' | 'in-person' | 'hybrid';
  rating: number;
  description: string;
}

interface Department {
  id: string;
  name: string;
  employeeCount: number;
  skills: Skill[];
  overallGap: number;
  prioritySkills: Skill[];
}

export default function SkillsGapAnalyzerPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterImpact, setFilterImpact] = useState<string>('all');

  const sampleSkills: Skill[] = [
    {
      id: '1',
      name: 'React.js',
      category: 'Frontend Development',
      currentLevel: 65,
      requiredLevel: 85,
      gap: 20,
      priority: 'high',
      impact: 'critical',
      marketDemand: 92,
      salaryImpact: 15,
      trainingOptions: [
        {
          id: '1',
          name: 'Advanced React Development',
          provider: 'Udemy',
          duration: '20 hours',
          cost: 'R1,200',
          format: 'online',
          rating: 4.8,
          description: 'Comprehensive React course covering hooks, context, and advanced patterns'
        },
        {
          id: '2',
          name: 'React Professional Certification',
          provider: 'Coursera',
          duration: '6 weeks',
          cost: 'R2,500',
          format: 'online',
          rating: 4.6,
          description: 'University-backed certification program'
        }
      ]
    },
    {
      id: '2',
      name: 'Python',
      category: 'Backend Development',
      currentLevel: 45,
      requiredLevel: 75,
      gap: 30,
      priority: 'high',
      impact: 'important',
      marketDemand: 88,
      salaryImpact: 12,
      trainingOptions: [
        {
          id: '3',
          name: 'Python for Data Science',
          provider: 'DataCamp',
          duration: '30 hours',
          cost: 'R1,800',
          format: 'online',
          rating: 4.7,
          description: 'Specialized course for data science applications'
        }
      ]
    },
    {
      id: '3',
      name: 'DevOps',
      category: 'Infrastructure',
      currentLevel: 30,
      requiredLevel: 70,
      gap: 40,
      priority: 'medium',
      impact: 'important',
      marketDemand: 85,
      salaryImpact: 18,
      trainingOptions: [
        {
          id: '4',
          name: 'DevOps Fundamentals',
          provider: 'AWS Training',
          duration: '40 hours',
          cost: 'R3,200',
          format: 'hybrid',
          rating: 4.9,
          description: 'AWS-certified DevOps training program'
        }
      ]
    },
    {
      id: '4',
      name: 'Machine Learning',
      category: 'AI/ML',
      currentLevel: 20,
      requiredLevel: 60,
      gap: 40,
      priority: 'low',
      impact: 'nice-to-have',
      marketDemand: 95,
      salaryImpact: 25,
      trainingOptions: [
        {
          id: '5',
          name: 'Machine Learning Specialization',
          provider: 'Stanford Online',
          duration: '12 weeks',
          cost: 'R5,000',
          format: 'online',
          rating: 4.9,
          description: 'Comprehensive ML course from Stanford University'
        }
      ]
    }
  ];

  const sampleDepartments: Department[] = [
    {
      id: '1',
      name: 'Software Development',
      employeeCount: 25,
      skills: sampleSkills,
      overallGap: 32.5,
      prioritySkills: sampleSkills.filter(s => s.priority === 'high')
    },
    {
      id: '2',
      name: 'Data Science',
      employeeCount: 12,
      skills: sampleSkills.slice(1, 4),
      overallGap: 36.7,
      prioritySkills: sampleSkills.filter(s => s.priority === 'high').slice(1, 3)
    },
    {
      id: '3',
      name: 'DevOps',
      employeeCount: 8,
      skills: sampleSkills.slice(2, 4),
      overallGap: 40.0,
      prioritySkills: sampleSkills.filter(s => s.priority === 'high').slice(2, 3)
    }
  ];

  useEffect(() => {
    setDepartments(sampleDepartments);
  }, []);

  const analyzeSkillsGap = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsAnalyzing(false);
    toast({
      title: "Analysis Complete",
      description: "Skills gap analysis has been completed successfully.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'important': return 'bg-orange-100 text-orange-700';
      case 'nice-to-have': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getGapColor = (gap: number) => {
    if (gap >= 30) return 'text-red-600';
    if (gap >= 15) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredSkills = selectedDepartment?.skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || skill.priority === filterPriority;
    const matchesImpact = filterImpact === 'all' || skill.impact === filterImpact;
    
    return matchesSearch && matchesPriority && matchesImpact;
  }) || [];

  const totalInvestment = filteredSkills.reduce((total, skill) => {
    return total + skill.trainingOptions.reduce((skillTotal, option) => {
      const cost = parseInt(option.cost.replace(/[^0-9]/g, ''));
      return skillTotal + cost;
    }, 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Target className="w-8 h-8 mr-3 text-indigo-600" />
            Skills Gap Analyzer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Identify skills gaps in your organization and find training opportunities for existing employees
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Department Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-indigo-600" />
                  Department Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <div
                      key={dept.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedDepartment?.id === dept.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                      onClick={() => setSelectedDepartment(dept)}
                    >
                      <h3 className="font-medium text-gray-900 mb-2">{dept.name}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{dept.employeeCount} employees</span>
                        <span className={`font-medium ${getGapColor(dept.overallGap)}`}>
                          {dept.overallGap.toFixed(1)}% gap
                        </span>
                      </div>
                      <div className="mt-2">
                        <Progress value={100 - dept.overallGap} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skills Analysis */}
            {selectedDepartment && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Filters and Search */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FilterIcon className="w-5 h-5 mr-2 text-indigo-600" />
                        Skills Analysis - {selectedDepartment.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="md:col-span-2">
                          <Input
                            placeholder="Search skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          >
                            <option value="all">All Priorities</option>
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                          </select>
                        </div>
                        <div>
                          <select
                            value={filterImpact}
                            onChange={(e) => setFilterImpact(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                          >
                            <option value="all">All Impacts</option>
                            <option value="critical">Critical</option>
                            <option value="important">Important</option>
                            <option value="nice-to-have">Nice to Have</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {filteredSkills.map((skill) => (
                          <div key={skill.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <h3 className="font-medium text-gray-900">{skill.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {skill.category}
                                </Badge>
                                <Badge className={getPriorityColor(skill.priority)}>
                                  {skill.priority}
                                </Badge>
                                <Badge className={getImpactColor(skill.impact)}>
                                  {skill.impact}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-bold ${getGapColor(skill.gap)}`}>
                                  {skill.gap}% gap
                                </div>
                                <div className="text-sm text-gray-500">
                                  {skill.currentLevel}% → {skill.requiredLevel}%
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                  <span>Current Level</span>
                                  <span>{skill.currentLevel}%</span>
                                </div>
                                <Progress value={skill.currentLevel} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                  <span>Required Level</span>
                                  <span>{skill.requiredLevel}%</span>
                                </div>
                                <Progress value={skill.requiredLevel} className="h-2" />
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span>Market Demand: {skill.marketDemand}%</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Award className="w-4 h-4 text-blue-600" />
                                <span>Salary Impact: +{skill.salaryImpact}%</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <BookOpen className="w-4 h-4 text-purple-600" />
                                <span>{skill.trainingOptions.length} training options</span>
                              </div>
                            </div>

                            {/* Training Options */}
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-900 mb-2">Recommended Training</h4>
                              <div className="space-y-2">
                                {skill.trainingOptions.slice(0, 2).map((option) => (
                                  <div key={option.id} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h5 className="font-medium text-gray-900">{option.name}</h5>
                                        <p className="text-sm text-gray-600">{option.provider}</p>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium text-gray-900">{option.cost}</div>
                                        <div className="text-sm text-gray-500">{option.duration}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <div className="flex items-center space-x-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                        <span className="text-xs">{option.rating}</span>
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {option.format}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Stats */}
            {selectedDepartment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                    Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {filteredSkills.filter(s => s.priority === 'high').length}
                    </div>
                    <div className="text-sm text-red-700">High Priority Gaps</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {filteredSkills.filter(s => s.priority === 'medium').length}
                    </div>
                    <div className="text-sm text-yellow-700">Medium Priority Gaps</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredSkills.filter(s => s.priority === 'low').length}
                    </div>
                    <div className="text-sm text-green-700">Low Priority Gaps</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      R{totalInvestment.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">Total Training Investment</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-indigo-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Analysis
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Training Plans
                </Button>
              </CardContent>
            </Card>

            {/* Market Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-indigo-600" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-1">High Demand Skills</h4>
                    <p className="text-sm text-green-700">
                      React.js and Python show 90%+ market demand
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">Salary Impact</h4>
                    <p className="text-sm text-blue-700">
                      DevOps skills can increase salaries by 18%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-1">Training ROI</h4>
                    <p className="text-sm text-purple-700">
                      Average 300% return on training investment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-indigo-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Prioritize React.js</p>
                      <p className="text-xs text-gray-600">Critical for frontend development</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Invest in Python</p>
                      <p className="text-xs text-gray-600">High market demand and salary impact</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Consider DevOps</p>
                      <p className="text-xs text-gray-600">Growing importance in tech teams</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 