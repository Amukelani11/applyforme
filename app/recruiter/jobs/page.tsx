"use client"

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Eye, Edit, Trash2, X, Briefcase, ChevronDown, MoreVertical, ToggleLeft, ToggleRight, Loader2, ArrowUpDown } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { bulkDeleteJobs, bulkUpdateJobStatus } from "../dashboard/actions";

interface JobPosting {
  id: number;
  title: string;
  status: 'draft' | 'active' | 'closed';
  location: string;
  application_count: { count: number }[];
  created_at: string;
}

export default function JobPostingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJobs, setSelectedJobs] = useState<Set<number>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof JobPosting | 'application_count'; direction: 'ascending' | 'descending' }>({ key: 'created_at', direction: 'descending' });

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push("/recruiter/login");
      return;
    }
    const { data: recruiterData } = await supabase.from("recruiters").select("id").eq("user_id", session.user.id).single();
    if (!recruiterData) {
      setIsLoading(false);
      return;
    };

    // Fetch job postings
    const { data: jobs, error: jobsError } = await supabase
      .from("job_postings")
      .select("*")
      .eq("recruiter_id", recruiterData.id)
      .order("created_at", { ascending: false });

    if (jobsError) {
      toast({ title: "Error fetching jobs", description: jobsError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    if (!jobs || jobs.length === 0) {
      setJobPostings([]);
      setIsLoading(false);
      return;
    }

    // Get job IDs
    const jobIds = jobs.map(job => job.id);

    // Fetch candidate application counts
    const { data: candidateAppCounts } = await supabase
      .from("candidate_applications")
      .select("job_posting_id")
      .in("job_posting_id", jobIds);

    // Fetch public application counts  
    const { data: publicAppCounts } = await supabase
      .from("public_applications")
      .select("job_id")
      .in("job_id", jobIds);

    // Count applications per job
    const candidateCountsByJob = candidateAppCounts?.reduce((acc, app) => {
      acc[app.job_posting_id] = (acc[app.job_posting_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>) || {};

    const publicCountsByJob = publicAppCounts?.reduce((acc, app) => {
      acc[app.job_id] = (acc[app.job_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>) || {};

    // Combine counts and add to job postings
    const jobsWithCounts = jobs.map(job => ({
      ...job,
      application_count: [{
        count: (candidateCountsByJob[job.id] || 0) + (publicCountsByJob[job.id] || 0)
      }]
    }));

    setJobPostings(jobsWithCounts as JobPosting[]);
    setIsLoading(false);
  }, [supabase, router, toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const requestSort = (key: keyof JobPosting | 'application_count') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedJobs = useMemo(() => {
    const filtered = jobPostings
      .filter(job => {
        if (statusFilter === 'all') return true;
        return job.status === statusFilter;
      })
      .filter(job => job.title.toLowerCase().includes(searchTerm.toLowerCase()));

    let sortableItems = [...filtered];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'application_count') {
            aValue = a.application_count[0]?.count || 0;
            bValue = b.application_count[0]?.count || 0;
        } else {
            aValue = a[sortConfig.key as keyof JobPosting];
            bValue = b[sortConfig.key as keyof JobPosting];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [jobPostings, statusFilter, searchTerm, sortConfig]);

  const handleSelectJob = (jobId: number) => {
    setSelectedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedJobs.size === sortedJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(sortedJobs.map(j => j.id)));
    }
  };

  const handleBulkAction = async (action: 'active' | 'closed' | 'delete') => {
    setIsBulkProcessing(true);
    const jobIds = Array.from(selectedJobs);
    try {
      if (action === 'delete') {
         await bulkDeleteJobs(jobIds);
         toast({ title: "Success", description: `${jobIds.length} job(s) deleted.` });
      } else {
        await bulkUpdateJobStatus(jobIds, action === 'active');
        toast({ title: "Success", description: `${jobIds.length} job(s) updated.` });
      }
      await fetchJobs();
      setSelectedJobs(new Set());
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const getStatusBadge = (status: JobPosting['status']) => {
    const baseClasses = "text-xs font-semibold px-2.5 py-0.5 rounded-full transition-all duration-300 flex items-center capitalize";
    switch (status) {
        case 'active':
            return <Badge className={`${baseClasses} bg-emerald-100 text-emerald-800 border border-emerald-200`}>Active</Badge>;
        case 'draft':
            return <Badge className={`${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`}>Draft</Badge>;
        case 'closed':
            return <Badge className={`${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`}>Closed</Badge>;
    }
  };

  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell className="w-[50px]"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></TableCell>
        <TableCell><div className="h-5 w-48 bg-gray-200 rounded animate-pulse" /></TableCell>
        <TableCell><div className="h-5 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
        <TableCell><div className="h-5 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
        <TableCell><div className="h-5 w-12 bg-gray-200 rounded animate-pulse" /></TableCell>
        <TableCell><div className="h-5 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
        <TableCell><div className="h-5 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Job Postings</h1>
        <Button asChild className="bg-theme-600 text-white shadow-md hover:bg-theme-700 hover:shadow-lg hover:shadow-theme-600/20 transition-all duration-300">
          <Link href="/recruiter/jobs/new"><Plus className="mr-2 h-4 w-4" /> Post a New Job</Link>
        </Button>
      </header>

      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input placeholder="Search by job title..." className="pl-10 rounded-lg border-gray-200 focus:border-theme-500 focus:ring-theme-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-lg border-gray-200">
                    Status: <span className="font-semibold ml-1.5 capitalize">{statusFilter === 'active' ? 'Open' : statusFilter}</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setStatusFilter('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStatusFilter('active')}>Active</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStatusFilter('draft')}>Draft</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setStatusFilter('closed')}>Closed</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        {selectedJobs.size > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-lg border-theme-600 text-theme-600">
                Bulk Actions ({selectedJobs.size}) <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => handleBulkAction('active')} disabled={isBulkProcessing}><ToggleRight className="mr-2 h-4 w-4" /> Mark as Active</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleBulkAction('closed')} disabled={isBulkProcessing}><ToggleLeft className="mr-2 h-4 w-4" /> Mark as Closed</DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {selectedJobs.size} job(s). This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleBulkAction('delete')} disabled={isBulkProcessing}>
                        {isBulkProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b-gray-100 hover:bg-gray-50">
              <TableHead className="w-[50px]"><Checkbox checked={selectedJobs.size === sortedJobs.length && sortedJobs.length > 0} onCheckedChange={handleSelectAll} /></TableHead>
              <TableHead><SortableButton columnKey="title" label="Job Title" sortConfig={sortConfig} requestSort={requestSort} /></TableHead>
              <TableHead><SortableButton columnKey="status" label="Status" sortConfig={sortConfig} requestSort={requestSort} /></TableHead>
              <TableHead><SortableButton columnKey="location" label="Location" sortConfig={sortConfig} requestSort={requestSort} /></TableHead>
              <TableHead><SortableButton columnKey="application_count" label="Apps" sortConfig={sortConfig} requestSort={requestSort} /></TableHead>
              <TableHead><SortableButton columnKey="created_at" label="Date Posted" sortConfig={sortConfig} requestSort={requestSort} /></TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
            {isLoading ? renderSkeleton() : sortedJobs.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-16 text-gray-500">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">No job postings yet.</h3>
                    <p className="text-gray-500 mt-2 mb-6">Start by creating a new job opportunity for candidates.</p>
                    <Button asChild className="bg-theme-600 text-white shadow-md hover:bg-theme-700 hover:shadow-lg hover:shadow-theme-600/20 transition-all duration-300">
                      <Link href="/recruiter/jobs/new"><Plus className="mr-2 h-4 w-4" /> Post a New Job</Link>
                    </Button>
                </TableCell></TableRow>
            ) : (
                sortedJobs.map((job) => (
                <motion.tr layout key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-gray-50/50 transition-colors duration-200">
                    <TableCell><Checkbox checked={selectedJobs.has(job.id)} onCheckedChange={() => handleSelectJob(job.id)} /></TableCell>
                    <TableCell className="font-semibold text-gray-700">
                      <Link href={`/recruiter/jobs/${job.id}`} className="hover:text-theme-600">{job.title}</Link>
                    </TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell className="text-gray-500">{job.location}</TableCell>
                    <TableCell className="text-gray-500 text-center">{job.application_count[0]?.count || 0}</TableCell>
                    <TableCell className="text-gray-500">{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => router.push(`/recruiter/jobs/${job.id}`)}><Eye className="mr-2 h-4 w-4" /> View Applicants</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => router.push(`/recruiter/jobs/${job.id}/edit`)}><Edit className="mr-2 h-4 w-4" /> Edit Job</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500" onSelect={() => handleBulkAction('delete')}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </motion.tr>
                ))
            )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}

const SortableButton = ({ columnKey, label, sortConfig, requestSort }: any) => {
  const isActive = sortConfig.key === columnKey;
  const direction = sortConfig.direction === 'ascending' ? 'asc' : 'desc';

  return (
    <Button variant="ghost" onClick={() => requestSort(columnKey)} className="px-2 py-1 -ml-2">
      {label}
      <ArrowUpDown className={`ml-2 h-4 w-4 transition-colors ${isActive ? 'text-theme-600' : 'text-gray-400'}`} />
    </Button>
  );
}; 