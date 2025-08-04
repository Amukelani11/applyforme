"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, Users, ChevronDown, User, Briefcase, FileText } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: number | string;
  candidate_name: string;
  candidate_email: string;
  status: string;
  ai_score: number;
  created_at: string;
  is_read?: boolean;
  job_postings: {
    id: number;
    title: string;
  } | null;
  is_public?: boolean;
}

const statusColors: { [key: string]: string } = {
  new: "bg-gray-100 text-gray-800 border-gray-200",
  reviewed: "bg-purple-100 text-purple-800 border-purple-200",
  shortlisted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  interviewing: "bg-blue-100 text-blue-800 border-blue-200",
  offer: "bg-indigo-100 text-indigo-800 border-indigo-200",
  hired: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function ApplicationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobPostings, setJobPostings] = useState<{ id: number, title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push("/recruiter/login");
      return;
    }
    const { data: recruiterData } = await supabase.from("recruiters").select("id").eq("user_id", session.user.id).single();
    if (!recruiterData) {
      setIsLoading(false);
      toast({ title: "Recruiter profile not found.", variant: "destructive" });
      return;
    }

    // First get all jobs for the recruiter
    const { data: jobsData, error: jobsError } = await supabase
      .from('job_postings')
      .select('id, title')
      .eq('recruiter_id', recruiterData.id);

    if (jobsError || !jobsData) {
      setIsLoading(false);
      toast({ title: "Error fetching jobs", description: jobsError?.message, variant: "destructive" });
      return;
    }

    setJobPostings(jobsData);
    const jobIds = jobsData.map(j => j.id);

    if (jobIds.length === 0) {
        setApplications([]);
        setIsLoading(false);
        return;
    }
    
    // Then get all applications for those jobs with is_read field
    const { data: candidateApps, error: candidateAppsError } = await supabase
      .from("candidate_applications")
      .select("*, is_read, job_postings(id, title)")
      .in("job_posting_id", jobIds)
      .order("created_at", { ascending: false });

    if (candidateAppsError) {
      toast({ title: "Error fetching applications", description: candidateAppsError.message, variant: "destructive" });
    }
    
    // Fetch public applications with is_read field
    const { data: publicApps, error: publicAppsError } = await supabase
      .from("public_applications")
      .select("*, is_read")
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });

    if (publicAppsError) {
        toast({ title: "Error fetching public applications", description: publicAppsError.message, variant: "destructive" });
    }

    const formattedPublicApps = publicApps?.map(app => {
        const job = jobsData.find(j => j.id === app.job_id);
        return {
            ...app,
            id: `public-${app.id}`,
            candidate_name: app.full_name,
            candidate_email: app.email,
            status: 'new', 
            ai_score: 0,
            is_public: true,
            job_postings: job ? { id: job.id, title: job.title } : null
        }
    }) || []

    const combinedApps = [...(candidateApps || []), ...formattedPublicApps];

    combinedApps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setApplications(combinedApps as Application[]);
    
    setIsLoading(false);
  }, [supabase, router, toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    return applications
      .filter(app => statusFilter === 'all' || app.status.toLowerCase() === statusFilter)
      .filter(app => jobFilter === 'all' || (app.job_postings && app.job_postings.id === parseInt(jobFilter)))
      .filter(app => 
        app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (app.candidate_email && app.candidate_email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [applications, statusFilter, jobFilter, searchTerm]);

  const renderSkeleton = () => (
    [...Array(8)].map((_, i) => (
      <TableRow key={i} className="animate-pulse">
        <TableCell><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-gray-200" /><div className="flex flex-col gap-1.5"><div className="h-4 w-28 bg-gray-200 rounded" /><div className="h-3 w-36 bg-gray-200 rounded" /></div></div></TableCell>
        <TableCell><div className="h-4 w-40 bg-gray-200 rounded" /></TableCell>
        <TableCell><div className="h-6 w-24 bg-gray-200 rounded-full" /></TableCell>
        <TableCell><div className="h-6 w-12 bg-gray-200 rounded-full" /></TableCell>
        <TableCell><div className="h-4 w-24 bg-gray-200 rounded" /></TableCell>
        <TableCell className="text-right"><div className="h-8 w-8 bg-gray-200 rounded-md ml-auto" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">All Applications</h1>
      </header>

      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input placeholder="Search by name or email..." className="pl-10 rounded-lg border-gray-200 focus:border-theme-500 focus:ring-theme-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" className="rounded-lg border-gray-200 capitalize w-48 justify-between">Job: <span className="font-semibold ml-1.5 truncate">{jobFilter === 'all' ? 'All' : jobPostings.find(j => j.id.toString() === jobFilter)?.title}</span><ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={() => setJobFilter('all')}>All Jobs</DropdownMenuItem>
                {jobPostings.map(job => (<DropdownMenuItem key={job.id} onSelect={() => setJobFilter(job.id.toString())}>{job.title}</DropdownMenuItem>))}
            </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" className="rounded-lg border-gray-200 capitalize w-48 justify-between">Status: <span className="font-semibold ml-1.5">{statusFilter}</span><ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
                {Object.keys(statusColors).map(status => (<DropdownMenuItem key={status} onSelect={() => setStatusFilter(status)} className="capitalize">{status}</DropdownMenuItem>))}
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b-gray-100 hover:bg-gray-50">
              <TableHead>Candidate</TableHead>
              <TableHead>Applying For</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>AI Score</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {isLoading ? renderSkeleton() : filteredApplications.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-16 text-gray-500"><FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />No applications match your filters.</TableCell></TableRow>
              ) : (
                  filteredApplications.map(app => (
                  <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className={cn(
                    "hover:bg-gray-50/50 transition-colors",
                    app.is_read === false && "bg-blue-50/30 border-l-4 border-l-blue-500"
                  )}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10 border">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${app.candidate_name}`} />
                              <AvatarFallback>{app.candidate_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {app.is_read === false && (
                              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                            )}
                          </div>
                          <div>
                            <div className={cn(
                              "font-medium",
                              app.is_read === false ? "text-blue-900" : "text-gray-800"
                            )}>
                              {app.candidate_name}
                              {app.is_read === false && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  New
                                </span>
                              )}
                            </div>
                            <div className={cn(
                              "text-sm",
                              app.is_read === false ? "text-blue-600" : "text-gray-500"
                            )}>
                              {app.candidate_email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{app.job_postings?.title || 'N/A'}</TableCell>
                      <TableCell><Badge className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize border ${statusColors[app.status.toLowerCase()] || 'bg-gray-100'}`}>{app.status}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className="border-gray-200 text-gray-700 font-mono">{app.is_public ? 'N/A' : `${Math.round(app.ai_score * 100)}%`}</Badge></TableCell>
                      <TableCell className="text-gray-600">{formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}</TableCell>
                      <TableCell className="text-right">
                          <Button asChild variant="ghost" size="icon" className={cn(
                            "h-8 w-8 rounded-md",
                            app.is_read === false 
                              ? "text-blue-600 hover:text-blue-700 hover:bg-blue-100/50" 
                              : "text-gray-500 hover:text-theme-600 hover:bg-theme-100/50"
                          )} disabled={!app.job_postings}>
                              <Link href={app.job_postings ? `/recruiter/jobs/${app.job_postings.id}/applications/${app.id}${app.is_public ? '?type=public' : ''}` : '#'}>
                                <Eye className="h-5 w-5" />
                              </Link>
                          </Button>
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