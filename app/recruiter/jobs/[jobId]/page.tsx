'use client'

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Edit, 
  Share2, 
  Trash2, 
  Users, 
  Eye, 
  TrendingUp, 
  Settings,
  MessageSquare,
  ExternalLink,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Copy,
  BarChart3,
  Zap
} from 'lucide-react';
import { motion } from "framer-motion";
// import AnimatedCounter from "@/components/animated-counter";

interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  status: string;
  created_at: string;
  description: string;
  requirements: string;
  allow_public_applications: boolean;
  public_link?: string;
}

interface JobAnalytics {
  total_applications: number;
  total_views: number;
  conversion_rate: number;
  applications_by_status: {
    new: number;
    shortlisted: number;
    rejected: number;
    interviewed: number;
  };
  views_trend: number[];
  applications_trend: number[];
  top_skills: string[];
}

interface AutomationSettings {
  auto_reject_enabled: boolean;
  auto_reject_threshold: number;
  auto_shortlist_enabled: boolean;
  auto_shortlist_threshold: number;
}

const MotionCard = motion(Card);
const MotionButton = motion(Button);

export default function JobOverviewPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = parseInt(params.jobId as string);

  const [jobData, setJobData] = useState<JobData | null>(null);
  const [analytics, setAnalytics] = useState<JobAnalytics | null>(null);
  const [automationSettings, setAutomationSettings] = useState<AutomationSettings>({
    auto_reject_enabled: false,
    auto_reject_threshold: 60,
    auto_shortlist_enabled: false,
    auto_shortlist_threshold: 80
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchJobData();
  }, [jobId]);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      // Fetch job data and analytics
      const response = await fetch(`/api/recruiter/jobs/${jobId}/overview`);
      if (response.ok) {
        const data = await response.json();
        setJobData(data.job);
        setAnalytics(data.analytics);
        setAutomationSettings(data.automation || automationSettings);
      } else {
        throw new Error('Failed to fetch job data');
      }
    } catch (error) {
      console.error('Error fetching job data:', error);
      toast({
        title: "Error",
        description: "Failed to load job data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditJob = () => {
    router.push(`/recruiter/jobs/${jobId}/edit`);
  };

  const handleShareJob = async () => {
    if (jobData?.public_link) {
      try {
        await navigator.clipboard.writeText(jobData.public_link);
        setCopied(true);
        toast({
          title: "Link Copied!",
          description: "Public job link has been copied to clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteJob = async () => {
    if (confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      try {
        setUpdating(true);
        const response = await fetch(`/api/recruiter/jobs/${jobId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          toast({
            title: "Job Deleted",
            description: "Job posting has been successfully deleted.",
          });
          router.push('/recruiter/jobs');
        } else {
          throw new Error('Failed to delete job');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete job. Please try again.",
          variant: "destructive"
        });
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleAutomationToggle = async (setting: keyof AutomationSettings) => {
    try {
      setUpdating(true);
      const newSettings = {
        ...automationSettings,
        [setting]: !automationSettings[setting]
      };
      
      const response = await fetch(`/api/recruiter/jobs/${jobId}/automation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      
      if (response.ok) {
        setAutomationSettings(newSettings);
        toast({
          title: "Settings Updated",
          description: "Automation settings have been updated.",
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update automation settings.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleThresholdChange = async (setting: keyof AutomationSettings, value: number) => {
    try {
      setUpdating(true);
      const newSettings = {
        ...automationSettings,
        [setting]: value
      };
      
      const response = await fetch(`/api/recruiter/jobs/${jobId}/automation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      
      if (response.ok) {
        setAutomationSettings(newSettings);
      } else {
        throw new Error('Failed to update threshold');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update threshold.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleViewApplications = () => {
    router.push(`/recruiter/jobs/${jobId}/applications`);
  };

  const handleMessageCandidates = () => {
    router.push(`/recruiter/jobs/${jobId}/applications?tab=messages`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-8">The job posting you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/recruiter/jobs')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Postings
          </Button>
        </div>
      </div>
    );
  }

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
                onClick={() => router.back()}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{jobData.title}</h1>
                <p className="text-sm text-gray-500">{jobData.company}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditJob}
                className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShareJob}
                className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteJob}
                disabled={updating}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Job Summary & Metrics */}
          <div className="space-y-8">
            {/* Job Overview Card */}
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -2 }}
              className="transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                  Job Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <Badge 
                      variant={jobData.status === 'active' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {jobData.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Job Type</Label>
                    <p className="text-sm text-gray-900 mt-1">{jobData.job_type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Location</Label>
                    <p className="text-sm text-gray-900 mt-1 flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      {jobData.location}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Salary Range</Label>
                    <p className="text-sm text-gray-900 mt-1 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                      {jobData.salary_range}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Posted Date</Label>
                  <p className="text-sm text-gray-900 mt-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    {new Date(jobData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </MotionCard>

            {/* Performance Metrics Card */}
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              whileHover={{ y: -2 }}
              className="transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  Performance At-a-Glance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {analytics?.total_applications || 0}
                    </div>
                    <p className="text-sm text-gray-600">Total Applicants</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {analytics?.total_views || 0}
                    </div>
                    <p className="text-sm text-gray-600">Total Views</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2 flex items-center justify-center">
                      {analytics?.conversion_rate ? `${analytics.conversion_rate.toFixed(1)}%` : '0%'}
                      {analytics?.conversion_rate && analytics.conversion_rate > 10 && (
                        <TrendingUp className="w-4 h-4 ml-1 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                  </div>
                </div>

                {/* Application Status Breakdown */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Application Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-400 rounded-full mr-2" />
                        <span className="text-sm text-gray-600">New</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{analytics?.applications_by_status?.new || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                        <span className="text-sm text-gray-600">Shortlisted</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{analytics?.applications_by_status?.shortlisted || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
                        <span className="text-sm text-gray-600">Rejected</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{analytics?.applications_by_status?.rejected || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-2" />
                        <span className="text-sm text-gray-600">Interviewed</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{analytics?.applications_by_status?.interviewed || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </MotionCard>
          </div>

          {/* Right Column - Actions & Automation */}
          <div className="space-y-8">
            {/* View Applications Button */}
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
              onClick={handleViewApplications}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <Users className="w-12 h-12 text-purple-600 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">View Applications</h3>
                  <p className="text-gray-600 mb-4">
                    Review and manage all {analytics?.total_applications || 0} applications for this position
                  </p>
                  <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700 transition-all duration-200 hover:scale-105">
                    Review Candidates
                  </Button>
                </div>
              </CardContent>
            </MotionCard>

            {/* Automation Settings Card */}
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              whileHover={{ y: -2 }}
              className="transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-600" />
                  Automation Settings
                </CardTitle>
                <CardDescription>
                  Automate your hiring process with AI-powered decisions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auto-Reject Setting */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-gray-900">Auto-Reject Low-Scoring Applicants</Label>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Automatically reject applications below a certain AI score
                      </p>
                    </div>
                    <Switch
                      checked={automationSettings.auto_reject_enabled}
                      onCheckedChange={() => handleAutomationToggle('auto_reject_enabled')}
                      disabled={updating}
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>
                  {automationSettings.auto_reject_enabled && (
                    <div className="space-y-2 pl-4 border-l-2 border-red-100 bg-red-50 p-3 rounded-lg">
                      <Label className="text-sm font-medium text-gray-700">Reject if AI Score &lt;</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={automationSettings.auto_reject_threshold}
                          onChange={(e) => handleThresholdChange('auto_reject_threshold', parseInt(e.target.value))}
                          className="w-20 border-red-200 focus:border-red-400 focus:ring-red-400"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                      <p className="text-xs text-red-600 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        This will automatically move applications below the set score to 'Rejected' status
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Auto-Shortlist Setting */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold text-gray-900">Auto-Shortlist High-Scoring Applicants</Label>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Automatically shortlist applications above a certain AI score
                      </p>
                    </div>
                    <Switch
                      checked={automationSettings.auto_shortlist_enabled}
                      onCheckedChange={() => handleAutomationToggle('auto_shortlist_enabled')}
                      disabled={updating}
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>
                  {automationSettings.auto_shortlist_enabled && (
                    <div className="space-y-2 pl-4 border-l-2 border-green-100 bg-green-50 p-3 rounded-lg">
                      <Label className="text-sm font-medium text-gray-700">Shortlist if AI Score &gt;</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={automationSettings.auto_shortlist_threshold}
                          onChange={(e) => handleThresholdChange('auto_shortlist_threshold', parseInt(e.target.value))}
                          className="w-20 border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                      <p className="text-xs text-green-600 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        This will automatically move applications above the set score to 'Shortlisted' status
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </MotionCard>

            {/* Communication & Sharing Card */}
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              whileHover={{ y: -2 }}
              className="transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                  Share & Communicate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  onClick={handleShareJob}
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Public Job Link
                </Button>
                <Button
                  variant="outline"
                  onClick={handleMessageCandidates}
                  className="w-full"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message All Applicants
                </Button>
              </CardContent>
            </MotionCard>
          </div>
        </div>


      </div>
    </div>
  );
} 