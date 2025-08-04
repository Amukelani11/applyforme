export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

async function getRecruiters(supabase: any) {
  const { data: recruiters, error } = await supabase
    .from('recruiters')
    .select('*, recruiter_subscriptions(*)')
    .order('created_at', { ascending: false });

  return { recruiters: recruiters ?? [], error };
}

export default async function RecruitersPage() {
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

  if (adminError || !adminData?.is_admin) {
    redirect('/dashboard');
  }

  const { recruiters, error } = await getRecruiters(supabase);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error Loading Recruiters</h1>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const getRecruiterPlan = (recruiter: any) => {
    const subs = Array.isArray(recruiter.recruiter_subscriptions)
      ? recruiter.recruiter_subscriptions
      : recruiter.recruiter_subscriptions
        ? [recruiter.recruiter_subscriptions]
        : [];
    const activeSub = subs.find((sub: any) => sub.status === 'active');
    if (activeSub) return { plan: activeSub.plan_id || 'Unknown', status: activeSub.status };
    if (subs.length) {
      // fallback to most recent if no active
      const mostRecent = subs[0];
      return { plan: mostRecent.plan_id || 'Unknown', status: mostRecent.status };
    }
    return { plan: 'Free', status: 'N/A' };
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Recruiters</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recruiters</CardTitle>
          <CardDescription>Manage recruiters on your platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
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
                {recruiters.map((recruiter: any) => (
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
    </div>
  );
} 