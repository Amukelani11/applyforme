"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Building2, 
  Users, 
  BarChart3,
  Target,
  Zap,
  Download,
  Share2,
  Eye,
  Filter,
  Clock,
  Award,
  Star,
  TrendingDown,
  Equal,
  Calculator,
  Globe,
  Briefcase,
  GraduationCap,
  Calendar
} from "lucide-react";

interface SalaryData {
  role: string;
  location: string;
  industry: string;
  experience: string;
  minSalary: number;
  maxSalary: number;
  medianSalary: number;
  marketRate: number;
  percentile25: number;
  percentile75: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  demand: 'high' | 'medium' | 'low';
  supply: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

interface MarketInsight {
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export default function SalaryAnalyzerPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [salaryData, setSalaryData] = useState<SalaryData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);

  const roles = [
    "Software Developer", "Data Scientist", "Product Manager", "UX Designer",
    "DevOps Engineer", "Sales Manager", "Marketing Specialist", "HR Manager",
    "Financial Analyst", "Operations Manager", "Customer Success Manager",
    "Business Analyst", "Project Manager", "Content Writer", "Graphic Designer"
  ];

  const locations = [
    "Cape Town", "Johannesburg", "Pretoria", "Durban", "Port Elizabeth",
    "Bloemfontein", "Nelspruit", "Polokwane", "Kimberley", "Remote-SA"
  ];

  const industries = [
    "Technology", "Finance", "Healthcare", "Manufacturing", "Retail",
    "Education", "Consulting", "Media", "Real Estate", "Transportation"
  ];

  const experienceLevels = [
    "Entry Level (0-2 years)", "Junior (2-4 years)", "Mid Level (4-7 years)",
    "Senior (7-10 years)", "Lead (10-15 years)", "Executive (15+ years)"
  ];

  const generateSalaryData = async () => {
    if (!selectedRole || !selectedLocation || !selectedIndustry || !selectedExperience) {
      toast({
        title: "Missing Information",
        description: "Please select all required fields to analyze salary data.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));

    const baseSalary = {
      "Entry Level (0-2 years)": 250000,
      "Junior (2-4 years)": 350000,
      "Mid Level (4-7 years)": 550000,
      "Senior (7-10 years)": 850000,
      "Lead (10-15 years)": 1200000,
      "Executive (15+ years)": 2000000
    }[selectedExperience] || 500000;

    const locationMultiplier = {
      "Cape Town": 1.1,
      "Johannesburg": 1.05,
      "Pretoria": 1.0,
      "Durban": 0.95,
      "Port Elizabeth": 0.9,
      "Bloemfontein": 0.85,
      "Nelspruit": 0.9,
      "Polokwane": 0.85,
      "Kimberley": 0.8,
      "Remote-SA": 0.95
    }[selectedLocation] || 1.0;

    const industryMultiplier = {
      "Technology": 1.15,
      "Finance": 1.1,
      "Healthcare": 1.05,
      "Manufacturing": 1.0,
      "Retail": 0.9,
      "Education": 0.85,
      "Consulting": 1.05,
      "Media": 0.95,
      "Real Estate": 0.9,
      "Transportation": 0.95
    }[selectedIndustry] || 1.0;

    const adjustedSalary = baseSalary * locationMultiplier * industryMultiplier;
    const minSalary = Math.round(adjustedSalary * 0.8);
    const maxSalary = Math.round(adjustedSalary * 1.3);
    const medianSalary = Math.round(adjustedSalary);
    const marketRate = Math.round(adjustedSalary * 1.05);

    const newSalaryData: SalaryData = {
      role: selectedRole,
      location: selectedLocation,
      industry: selectedIndustry,
      experience: selectedExperience,
      minSalary,
      maxSalary,
      medianSalary,
      marketRate,
      percentile25: Math.round(adjustedSalary * 0.85),
      percentile75: Math.round(adjustedSalary * 1.2),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      trendPercentage: Math.floor(Math.random() * 15) + 1,
      demand: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
      supply: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
      lastUpdated: new Date().toLocaleDateString()
    };

    setSalaryData(newSalaryData);

    // Generate market insights
    const insights: MarketInsight[] = [
      {
        title: "Growing Demand in Tech Sector",
        description: "Technology roles are experiencing 15% higher demand compared to last year.",
        impact: 'positive',
        confidence: 85
      },
      {
        title: "Remote Work Impact",
        description: "Remote positions show 10% salary premium for specialized roles.",
        impact: 'positive',
        confidence: 78
      },
      {
        title: "Skills Gap Widening",
        description: "Shortage of qualified candidates is driving up salaries in this role.",
        impact: 'negative',
        confidence: 92
      }
    ];

    setMarketInsights(insights);
    setIsAnalyzing(false);

    toast({
      title: "Analysis Complete",
      description: "Salary benchmark analysis has been generated successfully.",
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Equal className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 mr-3 text-emerald-600" />
            Salary Benchmark Analyzer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive salary analysis with market comparisons and compensation recommendations for South Africa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Analysis Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-emerald-600" />
                  Salary Analysis Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Job Role</label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-2" />
                              {role}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {location}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Industry</label>
                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            <div className="flex items-center">
                              <Building2 className="w-4 h-4 mr-2" />
                              {industry}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Experience Level</label>
                    <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            <div className="flex items-center">
                              <GraduationCap className="w-4 h-4 mr-2" />
                              {level}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={generateSalaryData}
                  disabled={isAnalyzing || !selectedRole || !selectedLocation || !selectedIndustry || !selectedExperience}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Generate Salary Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Salary Results */}
            {salaryData && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Salary Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
                        Salary Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-emerald-50 rounded-lg">
                          <div className="text-3xl font-bold text-emerald-600 mb-2">
                            {formatCurrency(salaryData.medianSalary)}
                          </div>
                          <div className="text-sm text-emerald-700">Median Salary</div>
                        </div>
                        <div className="text-center p-6 bg-blue-50 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {formatCurrency(salaryData.marketRate)}
                          </div>
                          <div className="text-sm text-blue-700">Market Rate</div>
                        </div>
                        <div className="text-center p-6 bg-purple-50 rounded-lg">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {formatCurrency(salaryData.maxSalary)}
                          </div>
                          <div className="text-sm text-purple-700">Top Range</div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Salary Range</span>
                          <span>{formatCurrency(salaryData.minSalary)} - {formatCurrency(salaryData.maxSalary)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full"
                            style={{ 
                              width: `${((salaryData.medianSalary - salaryData.minSalary) / (salaryData.maxSalary - salaryData.minSalary)) * 100}%` 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>25th Percentile: {formatCurrency(salaryData.percentile25)}</span>
                          <span>75th Percentile: {formatCurrency(salaryData.percentile75)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Market Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
                        Market Trends & Demand
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Salary Trend</span>
                            <div className="flex items-center space-x-2">
                              {getTrendIcon(salaryData.trend)}
                              <span className={`text-sm font-medium ${
                                salaryData.trend === 'up' ? 'text-green-600' : 
                                salaryData.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {salaryData.trendPercentage}% {salaryData.trend}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Market Demand</span>
                            <Badge className={getDemandColor(salaryData.demand)}>
                              {salaryData.demand.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Talent Supply</span>
                            <Badge className={getDemandColor(salaryData.supply)}>
                              {salaryData.supply.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Market Insights</h4>
                            <div className="space-y-2">
                              {marketInsights.map((insight, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                    insight.impact === 'positive' ? 'bg-green-500' :
                                    insight.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                                  }`} />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                                    <p className="text-xs text-gray-600">{insight.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">Confidence: {insight.confidence}%</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="w-5 h-5 mr-2 text-emerald-600" />
                        Compensation Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-900 mb-2 flex items-center">
                            <Star className="w-4 h-4 mr-2" />
                            Recommended Salary Range
                          </h4>
                          <p className="text-green-800">
                            Based on market analysis, we recommend offering between{' '}
                            <strong>{formatCurrency(salaryData.percentile25)}</strong> and{' '}
                            <strong>{formatCurrency(salaryData.percentile75)}</strong> for this position.
                          </p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                            <Award className="w-4 h-4 mr-2" />
                            Competitive Positioning
                          </h4>
                          <p className="text-blue-800">
                            To attract top talent, consider positioning your offer at{' '}
                            <strong>{formatCurrency(salaryData.marketRate)}</strong> or above.
                          </p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                            <Zap className="w-4 h-4 mr-2" />
                            Market Considerations
                          </h4>
                          <ul className="text-purple-800 space-y-1 text-sm">
                            <li>• {salaryData.demand === 'high' ? 'High demand' : 'Moderate demand'} for this role</li>
                            <li>• {salaryData.supply === 'low' ? 'Limited talent supply' : 'Good talent availability'}</li>
                            <li>• Salary trend is {salaryData.trend} by {salaryData.trendPercentage}%</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-emerald-600" />
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
                  <Eye className="w-4 h-4 mr-2" />
                  Compare Roles
                </Button>
              </CardContent>
            </Card>

            {/* Market Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-emerald-600" />
                  Market Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">15%</div>
                  <div className="text-sm text-emerald-700">Average Annual Growth</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">8.2%</div>
                  <div className="text-sm text-blue-700">Inflation Rate</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">12.5%</div>
                  <div className="text-sm text-purple-700">Tech Sector Growth</div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-emerald-600" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    "Software Developer - Cape Town",
                    "Data Scientist - Johannesburg", 
                    "Product Manager - Remote-SA"
                  ].map((search, index) => (
                    <div key={index} className="text-sm text-gray-600 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      {search}
                    </div>
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