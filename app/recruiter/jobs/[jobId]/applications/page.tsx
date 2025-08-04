'use client'

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Check, 
  X, 
  MessageSquare, 
  User, 
  Calendar,
  Clock,
  Users,
  Trash2,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Star,
  StarOff
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from 'date-fns';

interface Application {
  id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_avatar?: string;
  ai_score?: number;
  status: 'new' | 'under_review' | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
  created_at: string;
  last_activity?: string;
  source?: string;
  application_type: 'candidate' | 'public';
  custom_fields?: Record<string, any>;
  is_public?: boolean;
  user?: {
    full_name: string;
    email: string;
  };
}

interface JobData {
  id: number;
  title: string;
  company: string;
  status: string;
}

const MotionCard = motion(Card);
const MotionTableRow = motion(TableRow);

const statusOptions = [
  { value: 'all', label: 'All', color: 'bg-gray-100 text-gray-700' },
  { value: 'new', label: 'New', color: 'bg-gray-100 text-gray-700' },
  { value: 'under_review', label: 'Under Review', color: 'bg-purple-100 text-purple-700' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'bg-green-100 text-green-700' },
  { value: 'interview', label: 'Interview', color: 'bg-blue-100 text-blue-700' },
  { value: 'offer', label: 'Offer', color: 'bg-teal-100 text-teal-700' },
  { value: 'hired', label: 'Hired', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-orange-100 text-orange-700' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-500' }
];

const rejectionReasons = [
  'Not a good fit for this role',
  'Insufficient experience',
  'Skills mismatch',
  'Better candidates available',
  'Position filled',
  'Other'
];

export default function ApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = parseInt(params.jobId as string);

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionData, setRejectionData] = useState({
    applicationId: '',
    candidateName: '',
    reasons: [] as string[],
    customMessage: '',
    sendEmail: true
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchJobData();
    fetchApplications();
  }, [jobId]);

  const fetchJobData = async () => {
    try {
      const response = await fetch(`/api/recruiter/jobs/${jobId}/overview`);
      if (response.ok) {
        const data = await response.json();
        setJobData(data.job);
      }
    } catch (error) {
      console.error('Error fetching job data:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recruiter/jobs/${jobId}/applications`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        throw new Error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const candidateName = app.candidate_name || app.user?.full_name || '';
      const candidateEmail = app.candidate_email || app.user?.email || '';
      const matchesSearch = candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           candidateEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const handleSelectApplication = (applicationId: string) => {
    const newSelected = new Set(selectedApplications);
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId);
    } else {
      newSelected.add(applicationId);
    }
    setSelectedApplications(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedApplications.size === filteredApplications.length) {
      setSelectedApplications(new Set());
    } else {
      setSelectedApplications(new Set(filteredApplications.map(app => app.id)));
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/recruiter/jobs/${jobId}/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus as any } : app
        ));
        toast({
          title: "Status Updated",
          description: `Application status updated to ${newStatus}.`,
        });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchAction = async (action: string) => {
    if (selectedApplications.size === 0) return;

    try {
      setProcessing(true);
      const response = await fetch(`/api/recruiter/jobs/${jobId}/applications/batch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationIds: Array.from(selectedApplications),
          action: action
        })
      });

      if (response.ok) {
        setApplications(prev => prev.map(app => 
          selectedApplications.has(app.id) ? { ...app, status: action as any } : app
        ));
        setSelectedApplications(new Set());
        toast({
          title: "Batch Action Completed",
          description: `${selectedApplications.size} applications ${action}.`,
        });
      } else {
        throw new Error('Failed to perform batch action');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform batch action.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectApplication = (application: Application) => {
    setRejectionData({
      applicationId: application.id,
      candidateName: application.candidate_name,
      reasons: [],
      customMessage: '',
      sendEmail: true
    });
    setShowRejectionDialog(true);
  };

  const confirmRejection = async () => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/recruiter/jobs/${jobId}/applications/${rejectionData.applicationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reasons: rejectionData.reasons,
          customMessage: rejectionData.customMessage,
          sendEmail: rejectionData.sendEmail
        })
      });

      if (response.ok) {
        setApplications(prev => prev.map(app => 
          app.id === rejectionData.applicationId ? { ...app, status: 'rejected' } : app
        ));
        setShowRejectionDialog(false);
        toast({
          title: "Application Rejected",
          description: rejectionData.sendEmail ? "Rejection email sent to candidate." : "Application marked as rejected.",
        });
      } else {
        throw new Error('Failed to reject application');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject application.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return (
      <Badge className={`${statusOption?.color} text-xs font-medium`}>
        {statusOption?.label}
      </Badge>
    );
  };

  const getNextUnreviewedApplication = () => {
    const unreviewed = applications.find(app => app.status === 'new');
    if (unreviewed) {
      router.push(`/recruiter/jobs/${jobId}/applications/${unreviewed.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
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
                className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Applications for {jobData?.title}
                </h1>
                <p className="text-sm text-gray-500">Manage all candidates for this position</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {applications.some(app => app.status === 'new') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getNextUnreviewedApplication}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Review Next New
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchApplications}
                disabled={loading}
                className="text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search candidates by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={statusFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(option.value)}
                  className={`${
                    statusFilter === option.value 
                      ? 'bg-purple-600 text-white border-purple-600' 
                      : 'text-gray-600 border-gray-200 hover:border-purple-200'
                  } transition-all duration-200`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Batch Actions */}
        {selectedApplications.size > 0 && (
          <MotionCard
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-purple-50 border-purple-200"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-purple-900">
                    {selectedApplications.size} application{selectedApplications.size !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedApplications(new Set())}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBatchAction('shortlisted')}
                    disabled={processing}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Shortlist Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBatchAction('rejected')}
                    disabled={processing}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </MotionCard>
        )}

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Applications ({filteredApplications.length})
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedApplications.size === filteredApplications.length && filteredApplications.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-500">Select All</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-semibold text-gray-900">Candidate</TableHead>
                    <TableHead className="font-semibold text-gray-900">AI Score</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Date Applied</TableHead>
                    <TableHead className="font-semibold text-gray-900">Last Activity</TableHead>
                    <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center space-y-4">
                            <Users className="w-12 h-12 text-gray-300" />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-700">No applications found</h3>
                              <p className="text-gray-500">
                                {searchTerm || statusFilter !== 'all' 
                                  ? 'Try adjusting your search or filters' 
                                  : 'Applications will appear here once candidates apply'
                                }
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplications.map((application, index) => (
                        <MotionTableRow
                          key={application.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedApplications.has(application.id)}
                              onCheckedChange={() => handleSelectApplication(application.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <button
                                  onClick={() => router.push(`/recruiter/jobs/${jobId}/applications/${application.id}`)}
                                  className="font-medium text-gray-900 hover:text-purple-600 transition-colors duration-200 text-left"
                                >
                                  {application.candidate_name || application.user?.full_name || 'Unknown Candidate'}
                                </button>
                                <p className="text-sm text-gray-500">{application.candidate_email || application.user?.email || 'No email'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {application.ai_score ? (
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900">{application.ai_score}%</span>
                                {application.ai_score >= 80 && <Star className="w-4 h-4 text-yellow-500" />}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(application.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {application.created_at ? formatDistanceToNow(new Date(application.created_at), { addSuffix: true }) : 'Unknown'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {application.last_activity ? (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{application.last_activity}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => router.push(`/recruiter/jobs/${jobId}/applications/${application.id}`)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Review Application
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(application.id, 'shortlisted')}
                                  disabled={processing}
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Shortlist
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(application.id, 'interview')}
                                  disabled={processing}
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  Schedule Interview
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleRejectApplication(application)}
                                  disabled={processing}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </MotionTableRow>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Rejection</DialogTitle>
            <DialogDescription>
              Reject application for {rejectionData.candidateName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Rejection Reasons</Label>
              <div className="mt-2 space-y-2">
                {rejectionReasons.map((reason) => (
                  <div key={reason} className="flex items-center space-x-2">
                    <Checkbox
                      id={reason}
                      checked={rejectionData.reasons.includes(reason)}
                      onCheckedChange={(checked) => {
                        setRejectionData(prev => ({
                          ...prev,
                          reasons: checked 
                            ? [...prev.reasons, reason]
                            : prev.reasons.filter(r => r !== reason)
                        }));
                      }}
                    />
                    <Label htmlFor={reason} className="text-sm">{reason}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Personal Message (Optional)</Label>
              <Textarea
                placeholder="Add a personal message to the candidate..."
                value={rejectionData.customMessage}
                onChange={(e) => setRejectionData(prev => ({ ...prev, customMessage: e.target.value }))}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="send-email"
                checked={rejectionData.sendEmail}
                onCheckedChange={(checked) => setRejectionData(prev => ({ ...prev, sendEmail: !!checked }))}
              />
              <Label htmlFor="send-email" className="text-sm">
                Send automated rejection email
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectionDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRejection}
              disabled={processing || rejectionData.reasons.length === 0}
            >
              {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 