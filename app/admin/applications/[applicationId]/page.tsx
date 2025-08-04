import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Application {
  id: number
  user_id: string
  job_title: string
  company: string
  status: string
  applied_date: string
  notes: string | null
  salary_range: string | null
  location: string | null
  contact_name: string | null
  contact_email: string | null
  next_steps: string | null
}

interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: string | null
}

async function getApplication(supabase: any, applicationId: string) {
  const { data: application, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  return { application, error };
}

async function getUser(supabase: any, userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  return { user, error };
}

export default async function ApplicationPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
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

  const { application, error: applicationError } = await getApplication(supabase, applicationId);
  if (applicationError || !application) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Application Not Found</h1>
          <p className="text-muted-foreground">The application you're looking for doesn't exist.</p>
          <Link href="/admin/applications" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const { user: applicantUser, error: userError2 } = await getUser(supabase, application.user_id);
  if (userError2) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error Loading User</h1>
          <p className="text-muted-foreground">{userError2.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <Link href="/admin/applications">
            <Badge variant="outline" className="cursor-pointer">
              ← Back to Applications
            </Badge>
          </Link>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Application Details</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Application Information */}
        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
            <CardDescription>Details about this job application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Job Title</label>
              <p className="text-sm text-gray-600">{application.job_title}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Company</label>
              <p className="text-sm text-gray-600">{application.company}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <p className="text-sm text-gray-600">{application.location || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Salary Range</label>
              <p className="text-sm text-gray-600">{application.salary_range || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Badge className={
                application.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                application.status === 'interviewing' ? 'bg-yellow-100 text-yellow-800' :
                application.status === 'hired' ? 'bg-green-100 text-green-800' :
                application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }>
                {application.status}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Applied Date</label>
              <p className="text-sm text-gray-600">{new Date(application.applied_date).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Applicant Information */}
        <Card>
          <CardHeader>
            <CardTitle>Applicant Information</CardTitle>
            <CardDescription>Details about the applicant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-sm text-gray-600">{applicantUser.full_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-gray-600">{applicantUser.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <p className="text-sm text-gray-600">{applicantUser.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <p className="text-sm text-gray-600">{applicantUser.address || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      {(application.contact_name || application.contact_email) && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Contact details for this application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.contact_name && (
              <div>
                <label className="text-sm font-medium">Contact Name</label>
                <p className="text-sm text-gray-600">{application.contact_name}</p>
              </div>
            )}
            {application.contact_email && (
              <div>
                <label className="text-sm font-medium">Contact Email</label>
                <p className="text-sm text-gray-600">{application.contact_email}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes and Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Notes & Next Steps</CardTitle>
          <CardDescription>Internal notes and next steps for this application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Notes</label>
            <p className="text-sm text-gray-600 mt-1">
              {application.notes || 'No notes added yet.'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Next Steps</label>
            <p className="text-sm text-gray-600 mt-1">
              {application.next_steps || 'No next steps defined yet.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 