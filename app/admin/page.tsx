export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Users,
  FileText,
  CreditCard,
  Building2,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function getAdminData(supabase: any) {
  const [
    users,
    applications,
    recruiters,
    jobPostings,
    subscriptions,
    cvImprovements,
  ] = await Promise.all([
    supabase.from('users').select('*').order('created_at', { ascending: false }),
    supabase.from('applications').select('*').order('applied_date', { ascending: false }),
    supabase.from('recruiters').select('*, recruiter_subscriptions(*)').order('created_at', { ascending: false }),
    supabase.from('job_postings').select('*').order('created_at', { ascending: false }),
    supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
    supabase
      .from('cv_improvements')
      .select(
        '*, user:users!inner(*), original_cv:documents!cv_improvements_original_cv_id_fkey(name, url), improved_cv:documents!cv_improvements_improved_cv_id_fkey(name, url)'
      )
      .order('created_at', { ascending: false }),
  ]);

  return {
    users: users.data ?? [],
    applications: applications.data ?? [],
    recruiters: recruiters.data ?? [],
    jobPostings: jobPostings.data ?? [],
    subscriptions: subscriptions.data ?? [],
    cvImprovements: cvImprovements.data ?? [],
    error: users.error || applications.error || recruiters.error || jobPostings.error || subscriptions.error || cvImprovements.error,
  };
}

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect('/login');
  }

  const { data: adminData, error: adminError } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  // Check if user is admin
  if (adminError || !adminData?.is_admin) {
    redirect('/dashboard');
  }

  const { 
    users,
    applications,
    recruiters,
    jobPostings,
    subscriptions,
    cvImprovements,
    error,
  } = await getAdminData(supabase);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error Loading Data</h1>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }
  
  const stats = [
    { title: 'Total Users', value: users.length, icon: Users },
    { title: 'Total Recruiters', value: recruiters.length, icon: Building2 },
    { title: 'Active Subscriptions', value: subscriptions.filter((s: any) => s.status === 'active').length, icon: CreditCard },
    { title: 'Total Applications', value: applications.length, icon: FileText },
    { title: 'CV Improvements', value: cvImprovements.length, icon: Sparkles },
    { title: 'Verified Recruiters', value: recruiters.filter((r: any) => r.is_verified).length, icon: UserCheck },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <div className="text-sm text-gray-500">
          Welcome, Admin! (User ID: {user.id})
        </div>
      </div>
      
      {/* Test Message */}
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        ✅ Admin page is rendering successfully!
      </div>
      
      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Admin Status:</strong> {adminData?.is_admin ? '✅ Admin' : '❌ Not Admin'}</p>
            <p><strong>Total Users:</strong> {users.length}</p>
            <p><strong>Total Recruiters:</strong> {recruiters.length}</p>
            <p><strong>Total Jobs:</strong> {jobPostings.length}</p>
            <p><strong>Total Applications:</strong> {applications.length}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">{stat.title}</h3>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
