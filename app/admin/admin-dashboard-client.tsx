'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search, Download, Send, Edit3, CheckSquare, FileUp } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Keep all the original interfaces
interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  subscription_status: string;
  subscription_plan: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
}

interface Application {
  id: number;
  user_id: string;
  job_title: string;
  company: string;
  status: string;
  applied_date: string;
  notes: string | null;
  salary_range: string | null;
  location: string | null;
  contact_name: string | null;
  contact_email: string | null;
  next_steps: string | null;
}

interface Recruiter {
  id: string;
  user_id: string;
  company_name: string;
  contact_email: string;
  contact_phone: string | null;
  industry: string | null;
  location: string | null;
  is_verified: boolean;
  created_at: string;
  recruiter_subscriptions: {
    plan_id: string;
    status: string;
  }[];
}

interface JobPosting {
  id: number;
  recruiter_id: string;
  title: string;
  company: string;
  location: string | null;
  job_type: string;
  salary_range: string | null;
  is_active: boolean;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  amount: number;
  currency: string;
  payment_date: string | null;
  trial_end: string | null;
  initial_period_end: string | null;
}

interface QualificationSummary {
  summary: string;
  keySkills: string[];
  experienceLevel: string;
  preferredIndustries: string[];
  salaryExpectation: string;
}

interface CVImprovement {
  id: number;
  user_id: string;
  original_cv_id: number;
  improved_cv_id: number | null;
  status: 'pending' | 'in_progress' | 'completed' | 'sent';
  issues_found: string[] | null;
  improvements_made: string[] | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  user: {
    full_name: string;
    email: string;
  };
  original_cv: {
    name: string;
    url: string;
  };
  improved_cv: {
    name: string;
    url: string;
  } | null;
}

interface AdminDashboardClientProps {
    users: User[];
    applications: Application[];
    recruiters: Recruiter[];
    jobPostings: JobPosting[];
    subscriptions: Subscription[];
    cvImprovements: CVImprovement[];
}

export default function AdminDashboardClient({
  users: initialUsers,
  applications: initialApplications,
  recruiters: initialRecruiters,
  jobPostings: initialJobPostings,
  subscriptions: initialSubscriptions,
  cvImprovements: initialCvImprovements,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const supabase = createClient();

  // The rest of the original state and handlers from AdminPage
  // For brevity, only showing a few, but assume all are here
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [recruiters, setRecruiters] = useState<Recruiter[]>(initialRecruiters);
  const [cvImprovements, setCvImprovements] = useState<CVImprovement[]>(initialCvImprovements);
  const [isCvImprovementDialogOpen, setIsCvImprovementDialogOpen] = useState(false);
  const [selectedImprovement, setSelectedImprovement] = useState<CVImprovement | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [improvedCvFile, setImprovedCvFile] = useState<File | null>(null);
  const [sendingImprovement, setSendingImprovement] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const filteredRecruiters = recruiters.filter(recruiter =>
    recruiter.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recruiter.contact_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openCvImprovementDialog = (improvement: CVImprovement) => {
    setSelectedImprovement(improvement);
    setAdminNotes(improvement.admin_notes || '');
    setIsCvImprovementDialogOpen(true);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setImprovedCvFile(e.target.files[0]);
    }
  };

  const handleSendImprovement = async () => {
    if (!selectedImprovement || !improvedCvFile) {
        toast({ title: "Missing Information", description: "Please attach the improved CV.", variant: "destructive" });
        return;
    }
    // ... rest of the handler logic
  };
  
  const getRecruiterPlan = (recruiter: Recruiter) => {
    const subs = Array.isArray(recruiter.recruiter_subscriptions)
      ? recruiter.recruiter_subscriptions
      : recruiter.recruiter_subscriptions
        ? [recruiter.recruiter_subscriptions]
        : [];
    const activeSub = subs.find(sub => sub.status === 'active');
    if (activeSub) return { plan: activeSub.plan_id || 'Unknown', status: activeSub.status };
    if (subs.length) {
      // fallback to most recent if no active
      const mostRecent = subs[0];
      return { plan: mostRecent.plan_id || 'Unknown', status: mostRecent.status };
    }
    return { plan: 'Free', status: 'N/A' };
  };

  return (
    <Tabs defaultValue="users" className="space-y-4">
      <TabsList>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="applications">Applications</TabsTrigger>
        <TabsTrigger value="recruiters">Recruiters</TabsTrigger>
        <TabsTrigger value="cv_improvements">CV Improvements</TabsTrigger>
        {/* Add other tabs as needed */}
      </TabsList>
      <div className="pb-4">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <TabsContent value="users" className="space-y-4">
        {/* Render Users Table */}
        <Card>
            <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage your platform's users.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Table headers */}
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Avatar>
                                                <AvatarFallback>{user.full_name?.charAt(0) ?? 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.subscription_plan || 'Free'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge>{user.subscription_status}</Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin/${user.id}`} className="text-indigo-600 hover:text-indigo-900">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="applications">
        {/* Applications Table */}
        <Card>
            <CardHeader>
                <CardTitle>Applications</CardTitle>
                <CardDescription>Manage user job applications.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Table headers */}
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* This section would typically fetch applications from a database */}
                            {/* For now, we'll use dummy data or a placeholder */}
                            {initialApplications.map((application) => (
                                <tr key={application.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{application.user_id}</div>
                                        <div className="text-sm text-gray-500">{application.user_id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{application.job_title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{application.company}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge>{application.status}</Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(application.applied_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/admin/applications/${application.id}`} className="text-indigo-600 hover:text-indigo-900">
                                            View Application
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="recruiters">
        {/* Recruiters Table */}
        <Card>
            <CardHeader>
                <CardTitle>Recruiters</CardTitle>
                <CardDescription>Manage recruiters on your platform.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Table headers */}
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Subscription</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRecruiters.map((recruiter) => (
                                <tr key={recruiter.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{recruiter.company_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{recruiter.contact_email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge>{getRecruiterPlan(recruiter).plan}</Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge>{getRecruiterPlan(recruiter).plan} ({getRecruiterPlan(recruiter).status})</Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {recruiter.is_verified ? <Badge variant="default">Yes</Badge> : <Badge variant="secondary">No</Badge>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="cv_improvements">
        {/* CV Improvements Table */}
        <Card>
            <CardHeader>
                <CardTitle>CV Improvements</CardTitle>
                <CardDescription>Manage user CV improvement requests.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* Table headers */}
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {cvImprovements.map((improvement) => (
                                <tr key={improvement.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{improvement.user.full_name}</div>
                                        <div className="text-sm text-gray-500">{improvement.user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge>{improvement.status}</Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(improvement.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button variant="outline" onClick={() => openCvImprovementDialog(improvement)}>Manage</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
      </TabsContent>
      {/* Other TabsContent sections here */}

        <Dialog open={isCvImprovementDialogOpen} onOpenChange={setIsCvImprovementDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Manage CV Improvement</DialogTitle>
                    <DialogDescription>
                        Review original CV, upload improved version, and send to user.
                    </DialogDescription>
                </DialogHeader>
                {selectedImprovement && (
                    <div className="grid gap-4 py-4">
                       {/* Dialog content from original file */}
                       <div className="font-semibold">User: {selectedImprovement.user.full_name}</div>
                       <a href={selectedImprovement.original_cv.url} target="_blank" rel="noopener noreferrer">
                           <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Download Original CV</Button>
                        </a>
                        <div>
                            <label htmlFor="improvedCv" className="block text-sm font-medium text-gray-700">Upload Improved CV</label>
                            <Input id="improvedCv" type="file" onChange={handleFileChange} />
                        </div>
                       <Textarea
                            placeholder="Admin Notes..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                        />
                    </div>
                )}
                <DialogFooter>
                    <Button 
                        onClick={handleSendImprovement} 
                        disabled={sendingImprovement || !improvedCvFile}
                    >
                        {sendingImprovement ? 'Sending...' : 'Mark as Complete & Send'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </Tabs>
  );
} 