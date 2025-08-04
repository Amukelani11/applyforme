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
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Building,
  Calendar,
  MapPin,
  DollarSign,
  Award,
  BarChart3,
  Target,
  Zap,
  Scale,
  Gavel,
  BookOpen,
  Search,
  Download,
  Share2,
  Eye,
  Edit,
  Send,
  Phone,
  Mail,
  ExternalLink,
  Copy,
  FileCheck,
  AlertCircle,
  Info
} from "lucide-react";

interface ComplianceCheck {
  id: string;
  category: 'employment' | 'discrimination' | 'data-protection' | 'contracts' | 'workplace-safety';
  title: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'pending' | 'review-required';
  priority: 'high' | 'medium' | 'low';
  lastChecked: Date;
  nextReview: Date;
  requirements: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface LegalDocument {
  id: string;
  name: string;
  type: 'contract' | 'policy' | 'agreement' | 'notice' | 'form';
  status: 'current' | 'outdated' | 'draft' | 'pending-review';
  lastUpdated: Date;
  nextReview: Date;
  version: string;
  applicableLaws: string[];
  complianceScore: number;
}

interface ComplianceMetrics {
  overallScore: number;
  compliantItems: number;
  nonCompliantItems: number;
  pendingReviews: number;
  highRiskItems: number;
  lastAuditDate: Date;
}

export default function CompliancePage() {
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [legalDocuments, setLegalDocuments] = useState<LegalDocument[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    overallScore: 87,
    compliantItems: 23,
    nonCompliantItems: 3,
    pendingReviews: 5,
    highRiskItems: 2,
    lastAuditDate: new Date('2024-01-15')
  });
  const [selectedCheck, setSelectedCheck] = useState<ComplianceCheck | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    // Simulate loading compliance data
    const mockComplianceChecks: ComplianceCheck[] = [
      {
        id: '1',
        category: 'employment',
        title: 'Employment Equity Compliance',
        description: 'Ensure compliance with Employment Equity Act and B-BBEE requirements',
        status: 'compliant',
        priority: 'high',
        lastChecked: new Date('2024-01-10'),
        nextReview: new Date('2024-04-10'),
        requirements: [
          'Employment Equity Plan in place',
          'Annual reports submitted to Department of Labour',
          'B-BBEE scorecard maintained',
          'Workforce demographic data collected'
        ],
        recommendations: [
          'Update Employment Equity Plan for 2024',
          'Conduct workforce analysis',
          'Implement diversity training programs'
        ],
        riskLevel: 'medium'
      },
      {
        id: '2',
        category: 'discrimination',
        title: 'Anti-Discrimination Policies',
        description: 'Verify compliance with anti-discrimination laws and policies',
        status: 'compliant',
        priority: 'high',
        lastChecked: new Date('2024-01-12'),
        nextReview: new Date('2024-07-12'),
        requirements: [
          'Anti-discrimination policy documented',
          'Equal opportunity employment practices',
          'Harassment prevention training',
          'Grievance procedures established'
        ],
        recommendations: [
          'Conduct annual anti-discrimination training',
          'Review grievance procedures',
          'Update policy language'
        ],
        riskLevel: 'low'
      },
      {
        id: '3',
        category: 'data-protection',
        title: 'POPIA Compliance',
        description: 'Ensure compliance with Protection of Personal Information Act',
        status: 'review-required',
        priority: 'high',
        lastChecked: new Date('2024-01-08'),
        nextReview: new Date('2024-02-08'),
        requirements: [
          'Privacy policy implemented',
          'Data processing procedures documented',
          'Consent mechanisms in place',
          'Data breach response plan'
        ],
        recommendations: [
          'Update privacy policy for 2024',
          'Conduct data protection impact assessment',
          'Implement data retention policies'
        ],
        riskLevel: 'high'
      },
      {
        id: '4',
        category: 'contracts',
        title: 'Employment Contract Templates',
        description: 'Review and update employment contract templates',
        status: 'non-compliant',
        priority: 'medium',
        lastChecked: new Date('2024-01-05'),
        nextReview: new Date('2024-03-05'),
        requirements: [
          'Contracts comply with Basic Conditions of Employment Act',
          'Probation periods properly defined',
          'Notice periods aligned with legislation',
          'Remuneration terms clearly stated'
        ],
        recommendations: [
          'Update contract templates for 2024',
          'Include new statutory requirements',
          'Review probation and notice periods'
        ],
        riskLevel: 'medium'
      },
      {
        id: '5',
        category: 'workplace-safety',
        title: 'Occupational Health and Safety',
        description: 'Ensure compliance with OHS Act and regulations',
        status: 'pending',
        priority: 'medium',
        lastChecked: new Date('2024-01-15'),
        nextReview: new Date('2024-04-15'),
        requirements: [
          'OHS policy and procedures documented',
          'Safety training programs implemented',
          'Incident reporting procedures',
          'Regular safety inspections conducted'
        ],
        recommendations: [
          'Conduct workplace safety audit',
          'Update safety procedures',
          'Implement new safety training'
        ],
        riskLevel: 'low'
      }
    ];

    const mockLegalDocuments: LegalDocument[] = [
      {
        id: '1',
        name: 'Standard Employment Contract',
        type: 'contract',
        status: 'current',
        lastUpdated: new Date('2024-01-10'),
        nextReview: new Date('2024-07-10'),
        version: '2024.1',
        applicableLaws: ['Basic Conditions of Employment Act', 'Labour Relations Act'],
        complianceScore: 95
      },
      {
        id: '2',
        name: 'Privacy Policy',
        type: 'policy',
        status: 'outdated',
        lastUpdated: new Date('2023-06-15'),
        nextReview: new Date('2024-02-15'),
        version: '2023.2',
        applicableLaws: ['Protection of Personal Information Act'],
        complianceScore: 65
      },
      {
        id: '3',
        name: 'Anti-Discrimination Policy',
        type: 'policy',
        status: 'current',
        lastUpdated: new Date('2024-01-05'),
        nextReview: new Date('2024-07-05'),
        version: '2024.1',
        applicableLaws: ['Employment Equity Act', 'Constitution of South Africa'],
        complianceScore: 92
      },
      {
        id: '4',
        name: 'Non-Disclosure Agreement',
        type: 'agreement',
        status: 'current',
        lastUpdated: new Date('2024-01-12'),
        nextReview: new Date('2024-07-12'),
        version: '2024.1',
        applicableLaws: ['Common Law', 'Labour Relations Act'],
        complianceScore: 88
      }
    ];

    setComplianceChecks(mockComplianceChecks);
    setLegalDocuments(mockLegalDocuments);
  }, []);

  const filteredChecks = complianceChecks.filter(check => {
    const matchesCategory = filterCategory === 'all' || check.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || check.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'review-required': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'employment': return <Users className="w-4 h-4" />;
      case 'discrimination': return <Scale className="w-4 h-4" />;
      case 'data-protection': return <Shield className="w-4 h-4" />;
      case 'contracts': return <FileText className="w-4 h-4" />;
      case 'workplace-safety': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const updateComplianceStatus = (checkId: string, status: string) => {
    setComplianceChecks(prev => prev.map(check => {
      if (check.id === checkId) {
        return { ...check, status: status as any };
      }
      return check;
    }));

    toast({
      title: "Status Updated",
      description: "Compliance check status has been updated.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Scale className="w-8 h-8 mr-3 text-blue-600" />
            Compliance & Legal Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ensure your hiring processes comply with South African labor laws, regulations, and best practices
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Compliance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Compliance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{metrics.overallScore}%</div>
                    <div className="text-sm text-gray-600">Overall Compliance</div>
                    <Progress value={metrics.overallScore} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{metrics.compliantItems}</div>
                    <div className="text-sm text-gray-600">Compliant Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">{metrics.nonCompliantItems}</div>
                    <div className="text-sm text-gray-600">Non-Compliant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{metrics.pendingReviews}</div>
                    <div className="text-sm text-gray-600">Pending Review</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">{metrics.highRiskItems}</div>
                    <div className="text-sm text-gray-600">High Risk Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {metrics.lastAuditDate.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">Last Audit</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Checks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <FileCheck className="w-5 h-5 mr-2 text-purple-600" />
                    Compliance Checks
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="employment">Employment</SelectItem>
                        <SelectItem value="discrimination">Discrimination</SelectItem>
                        <SelectItem value="data-protection">Data Protection</SelectItem>
                        <SelectItem value="contracts">Contracts</SelectItem>
                        <SelectItem value="workplace-safety">Workplace Safety</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="compliant">Compliant</SelectItem>
                        <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="review-required">Review Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredChecks.map((check) => (
                    <motion.div
                      key={check.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedCheck(check)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                            {getCategoryIcon(check.category)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{check.title}</h3>
                            <p className="text-sm text-gray-600">{check.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getStatusColor(check.status)}>
                                {check.status.replace('-', ' ').toUpperCase()}
                              </Badge>
                              <Badge className={getPriorityColor(check.priority)}>
                                {check.priority.toUpperCase()} PRIORITY
                              </Badge>
                              <Badge className={getRiskColor(check.riskLevel)}>
                                {check.riskLevel.toUpperCase()} RISK
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Last checked: {check.lastChecked.toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Next review: {check.nextReview.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Legal Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Legal Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {legalDocuments.map((document) => (
                    <motion.div
                      key={document.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedDocument(document)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{document.name}</h3>
                            <p className="text-sm text-gray-600">Version {document.version}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getStatusColor(document.status)}>
                                {document.status.replace('-', ' ').toUpperCase()}
                              </Badge>
                              <Badge variant="outline">{document.type.toUpperCase()}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 mb-1">{document.complianceScore}%</div>
                          <p className="text-sm text-gray-500">Compliance Score</p>
                          <p className="text-sm text-gray-500">
                            Updated: {document.lastUpdated.toLocaleDateString()}
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
                  <Search className="w-4 h-4 mr-2" />
                  Run Compliance Audit
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Compliance Data
                </Button>
                <Button className="w-full" variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share with Legal Team
                </Button>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Critical Risk</span>
                  <span className="text-sm font-medium text-red-600">1 item</span>
                </div>
                <Progress value={20} className="h-2 bg-red-100" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">High Risk</span>
                  <span className="text-sm font-medium text-orange-600">2 items</span>
                </div>
                <Progress value={40} className="h-2 bg-orange-100" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Medium Risk</span>
                  <span className="text-sm font-medium text-yellow-600">3 items</span>
                </div>
                <Progress value={60} className="h-2 bg-yellow-100" />
              </CardContent>
            </Card>

            {/* Upcoming Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Upcoming Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">POPIA Compliance</p>
                      <p className="text-xs text-gray-500">Due: Feb 8, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Employment Contracts</p>
                      <p className="text-xs text-gray-500">Due: Mar 5, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Privacy Policy</p>
                      <p className="text-xs text-gray-500">Due: Feb 15, 2024</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Compliance Check Detail Modal */}
        {selectedCheck && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Compliance Check Details</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCheck(null)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Check Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{selectedCheck.title}</h3>
                    <p className="text-gray-600 mb-4">{selectedCheck.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(selectedCheck.status)}>
                          {selectedCheck.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(selectedCheck.priority)}>
                          {selectedCheck.priority.toUpperCase()} PRIORITY
                        </Badge>
                        <Badge className={getRiskColor(selectedCheck.riskLevel)}>
                          {selectedCheck.riskLevel.toUpperCase()} RISK
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <p>Last checked: {selectedCheck.lastChecked.toLocaleDateString()}</p>
                        <p>Next review: {selectedCheck.nextReview.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                    <div className="space-y-2">
                      {selectedCheck.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                          <span className="text-sm text-gray-700">{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                  <div className="space-y-2">
                    {selectedCheck.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-1" />
                        <span className="text-sm text-gray-700">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legal Document Detail Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Legal Document Details</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDocument(null)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Document Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">{selectedDocument.name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(selectedDocument.status)}>
                          {selectedDocument.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{selectedDocument.type.toUpperCase()}</Badge>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <p>Version: {selectedDocument.version}</p>
                        <p>Last updated: {selectedDocument.lastUpdated.toLocaleDateString()}</p>
                        <p>Next review: {selectedDocument.nextReview.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Score */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Compliance Score</h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">{selectedDocument.complianceScore}%</div>
                      <Progress value={selectedDocument.complianceScore} className="mb-4" />
                      <Badge className={selectedDocument.complianceScore >= 90 ? 'bg-green-100 text-green-800' : 
                                       selectedDocument.complianceScore >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                                       'bg-red-100 text-red-800'}>
                        {selectedDocument.complianceScore >= 90 ? 'Excellent' : 
                         selectedDocument.complianceScore >= 70 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Applicable Laws */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Applicable Laws</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.applicableLaws.map((law, index) => (
                      <Badge key={index} variant="outline">
                        {law}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Document
                  </Button>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Document
                  </Button>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Download
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