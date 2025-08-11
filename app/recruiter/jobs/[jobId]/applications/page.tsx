'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
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

function ApplicationsContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.jobId as string;

  const [applications, setApplications] = useState<any[]>([]);
  const [jobData, setJobData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplications, setSelectedApplications] = useState(new Set());
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionData, setRejectionData] = useState({
    applicationId: '',
    candidateName: '',
    reasons: [] as string[],
    customMessage: '',
    sendEmail: true
  });

  // Remove mock data; load from API instead

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/recruiter/jobs/${jobId}/applications`, { credentials: 'include' });
        if (!res.ok) throw new Error(`Failed to load applications (${res.status})`);
        const data = await res.json();
        setApplications(data.applications || []);
        setJobData({ id: jobId, title: data.job?.title, company: data.job?.company, status: 'active', applications_count: data.total });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (jobId) load();
  }, [jobId]);

  const filteredApplications = applications.filter(application => {
    const matchesSearch = searchTerm === '' || 
      application.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.candidate_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    
      return matchesSearch && matchesStatus;
    });

  const handleSelectApplication = (applicationId) => {
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

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setProcessing(true);
      const res = await fetch(`/api/recruiter/jobs/${jobId}/applications/${applicationId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app));
      toast({ title: 'Status Updated', description: `Application status updated to ${newStatus}` });
    } catch (e) {
      toast({ title: 'Error', description: 'Could not update status', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchAction = async (action) => {
    try {
      setProcessing(true);
      const ids = Array.from(selectedApplications);
      const res = await fetch(`/api/recruiter/jobs/${jobId}/applications/batch`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action })
      });
      if (!res.ok) throw new Error('Batch action failed');
      setApplications(prev => prev.map(app => ids.includes(app.id) ? { ...app, status: action } : app));
      setSelectedApplications(new Set());
      toast({ title: 'Batch Action Completed', description: `${ids.length} applications ${action}` });
    } catch (e) {
      toast({ title: 'Error', description: 'Batch action failed', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectApplication = (application) => {
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
      const res = await fetch(`/api/recruiter/jobs/${jobId}/applications/${rejectionData.applicationId}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reasons: rejectionData.reasons, customMessage: rejectionData.customMessage, sendEmail: rejectionData.sendEmail })
      });
      if (!res.ok) throw new Error('Reject failed');
      setApplications(prev => prev.map(app => app.id === rejectionData.applicationId ? { ...app, status: 'rejected' } : app));
      setShowRejectionDialog(false);
      toast({ title: 'Application Rejected', description: 'The application has been rejected and the candidate has been notified.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to reject application', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-700', icon: Clock },
      under_review: { color: 'bg-purple-100 text-purple-700', icon: Eye },
      shortlisted: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      interview: { color: 'bg-orange-100 text-orange-700', icon: Calendar },
      offer: { color: 'bg-teal-100 text-teal-700', icon: Star },
      hired: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700', icon: X },
      withdrawn: { color: 'bg-gray-100 text-gray-500', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.new;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getNextUnreviewedApplication = () => {
    return applications.find(app => app.status === 'new');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600">{jobData?.title} • {jobData?.company}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => router.push(`/recruiter/jobs/${jobId}/applications/batch`)}>
            Batch Actions
              </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'new').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'shortlisted').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'hired').length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <Star className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                  placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
        {selectedApplications.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedApplications.size} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBatchAction('shortlisted')}
                    disabled={processing}
                  >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Shortlist Selected'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBatchAction('rejected')}
                    disabled={processing}
                  >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject Selected'}
                  </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                <Checkbox
                  checked={selectedApplications.size === filteredApplications.length && filteredApplications.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                </TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>AI Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Source</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                {filteredApplications.map((application) => (
                  <motion.tr
                          key={application.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="hover:bg-gray-50"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedApplications.has(application.id)}
                              onCheckedChange={() => handleSelectApplication(application.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                          <p className="font-medium">{application.candidate_name}</p>
                          <p className="text-sm text-gray-600">{application.candidate_email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                              <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${application.ai_score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{application.ai_score}%</span>
                              </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(application.status)}
                          </TableCell>
                          <TableCell>
                      <div className="text-sm">
                        <p>{formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}</p>
                        <p className="text-gray-500">{application.last_activity}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {application.source}
                      </Badge>
                          </TableCell>
                    <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/recruiter/jobs/${jobId}/applications/${application.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Message
                                </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, 'shortlisted')}>
                            <Check className="h-4 w-4 mr-2" />
                                  Shortlist
                                </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(application.id, 'interview')}>
                            <Calendar className="h-4 w-4 mr-2" />
                                  Schedule Interview
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleRejectApplication(application)}>
                            <X className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                  </motion.tr>
                ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
          </CardContent>
        </Card>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {rejectionData.candidateName}'s application?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_fit">Not a good fit for this role</SelectItem>
                  <SelectItem value="insufficient_experience">Insufficient experience</SelectItem>
                  <SelectItem value="skills_mismatch">Skills mismatch</SelectItem>
                  <SelectItem value="better_candidates">Better candidates available</SelectItem>
                  <SelectItem value="position_filled">Position filled</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Custom Message (Optional)</Label>
              <Textarea
                placeholder="Add a personal message to the candidate..."
                value={rejectionData.customMessage}
                onChange={(e) => setRejectionData({ ...rejectionData, customMessage: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={rejectionData.sendEmail}
                onCheckedChange={(checked) => setRejectionData({ ...rejectionData, sendEmail: checked === true })}
              />
              <Label htmlFor="sendEmail">Send email notification to candidate</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRejection}
              disabled={processing}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ApplicationsContent />
    </Suspense>
  );
} 