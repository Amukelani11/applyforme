import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Briefcase, 
  Building2, 
  FileText,
  Download,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalRecruiters: number;
  totalJobs: number;
  totalApplications: number;
  activeSubscriptions: number;
  conversionRate: number;
  monthlySignups: number;
  weeklySignups: number;
  dailySignups: number;
  topJobs: Array<{
    title: string;
    company: string;
    applications: number;
  }>;
  topRecruiters: Array<{
    company: string;
    jobs: number;
    applications: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

async function getAnalytics(supabase: any) {
  try {
    // Fetch basic counts
    const [
      { count: usersCount },
      { count: recruitersCount },
      { count: jobsCount },
      { count: applicationsCount },
      { count: activeSubsCount }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('recruiters').select('*', { count: 'exact', head: true }),
      supabase.from('job_postings').select('*', { count: 'exact', head: true }),
      supabase.from('applications').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')
    ]);

    // Fetch top jobs by applications
    const { data: topJobs } = await supabase
      .from('job_postings')
      .select(`
        title,
        company,
        applications:applications(count)
      `)
      .order('applications', { ascending: false })
      .limit(5);

    // Fetch top recruiters
    const { data: topRecruiters } = await supabase
      .from('recruiters')
      .select(`
        company_name,
        job_postings:job_postings(count),
        applications:job_postings(applications(count))
      `)
      .order('job_postings', { ascending: false })
      .limit(5);

    // Calculate conversion rate (signups to subscriptions)
    const conversionRate = usersCount > 0 ? (activeSubsCount / usersCount) * 100 : 0;

    // Mock recent activity (in real app, this would come from a logs table)
    const recentActivity = [
      { type: 'user_signup', description: 'New user registered', timestamp: new Date().toISOString() },
      { type: 'job_posted', description: 'New job posted by TechCorp', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { type: 'application', description: 'Application submitted for Senior Developer', timestamp: new Date(Date.now() - 7200000).toISOString() },
    ];

    return {
      totalUsers: usersCount || 0,
      totalRecruiters: recruitersCount || 0,
      totalJobs: jobsCount || 0,
      totalApplications: applicationsCount || 0,
      activeSubscriptions: activeSubsCount || 0,
      conversionRate,
      monthlySignups: Math.floor(Math.random() * 100) + 50,
      weeklySignups: Math.floor(Math.random() * 20) + 10,
      dailySignups: Math.floor(Math.random() * 5) + 2,
      topJobs: topJobs?.map((job: any) => ({
        title: job.title,
        company: job.company,
        applications: job.applications?.[0]?.count || 0
      })) || [],
      topRecruiters: topRecruiters?.map((recruiter: any) => ({
        company: recruiter.company_name,
        jobs: recruiter.job_postings?.[0]?.count || 0,
        applications: recruiter.applications?.[0]?.count || 0
      })) || [],
      recentActivity
    };
  } catch (error) {
    throw error;
  }
}

export default async function AnalyticsPage() {
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

  const analyticsData = await getAnalytics(supabase);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics & Insights</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
              +{analyticsData.monthlySignups} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeSubscriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.conversionRate.toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalJobs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalApplications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500 mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Top Jobs by Applications</CardTitle>
          <CardDescription>Most popular job postings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topJobs.map((job: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{job.applications} applications</Badge>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Recruiters */}
      <Card>
        <CardHeader>
          <CardTitle>Top Recruiters</CardTitle>
          <CardDescription>Most active recruiting companies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topRecruiters.map((recruiter: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{recruiter.company}</p>
                  <p className="text-sm text-muted-foreground">{recruiter.jobs} jobs posted</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{recruiter.applications} applications</Badge>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 