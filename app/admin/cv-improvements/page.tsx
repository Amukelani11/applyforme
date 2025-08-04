export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

async function getCVImprovements(supabase: any) {
  const { data: cvImprovements, error } = await supabase
    .from('cv_improvements')
    .select(
      '*, user:users!inner(*), original_cv:documents!cv_improvements_original_cv_id_fkey(name, url), improved_cv:documents!cv_improvements_improved_cv_id_fkey(name, url)'
    )
    .order('created_at', { ascending: false });

  return { cvImprovements: cvImprovements ?? [], error };
}

export default async function CVImprovementsPage() {
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

  const { cvImprovements, error } = await getCVImprovements(supabase);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error Loading CV Improvements</h1>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">CV Improvements</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>CV Improvements</CardTitle>
          <CardDescription>Manage user CV improvement requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cvImprovements.map((improvement: any) => (
                  <tr key={improvement.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{improvement.user.full_name}</div>
                      <div className="text-sm text-gray-500">{improvement.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge>{improvement.status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(improvement.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="outline">Manage</Button>
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