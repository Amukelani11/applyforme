"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, UserCheck, Calendar as CalendarIcon, MoreHorizontal, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { ApplicationFunnelChart } from "@/components/recruiter/application-funnel-chart";
import { ApplicationSourcesChart, JobPerformanceChart } from "@/components/recruiter/performance-charts";
import { ActivityFeed } from "@/components/recruiter/activity-feed";
import { useToast } from "@/hooks/use-toast"

type ApplicationStatus = { status: string };

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [value, duration]);

  return <span>{count}</span>;
};

// --- SKELETON COMPONENTS ---

const StatCardSkeleton = () => (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between">
        <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
        <div className="mt-4">
            <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse" />
            <div className="flex items-center gap-2 mt-2">
                <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    </div>
);

const CreditCardSkeleton = () => (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between">
        <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />
        <div className="mt-4">
            <div className="flex items-end justify-between">
                <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full animate-pulse" />
        </div>
    </div>
);

const ChartSkeleton = () => (
  <div className="rounded-xl bg-white p-4 shadow-lg border border-gray-100 flex flex-col h-[400px]">
    <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse mb-4" />
    <div className="flex-1 bg-gray-50 rounded-lg animate-pulse" />
  </div>
);

// --- DATA COMPONENTS ---

const StatCard = ({ title, value, change, changeType, description, icon: Icon, isLoading }: any) => {
    if (isLoading) return <StatCardSkeleton />;
    const isIncrease = changeType === 'increase';
    const colorClass = isIncrease ? 'text-emerald-600' : 'text-red-600';

    return (
        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-theme-100 p-2 rounded-lg">
                        <Icon className="h-6 w-6 text-theme-600" />
                    </div>
                    <h3 className="text-md font-medium text-gray-600">{title}</h3>
                </div>
            </div>
            <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <div className="flex items-center gap-2 mt-1 text-sm">
                    <span className={`flex items-center font-semibold ${colorClass}`}>
                        <TrendingUp className={`h-4 w-4 mr-1 ${isIncrease ? '' : 'transform -rotate-90'}`} />
                        {change}
                    </span>
                    <p className="text-gray-500">{description}</p>
                </div>
            </div>
        </div>
    );
}

const CreditCard = ({ title, value, maxValue, isLoading }: any) => {
    if (isLoading) return <CreditCardSkeleton />;
    const percentage = (value / maxValue) * 100;
    return (
        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-gray-600">{title}</h3>
                <Link href="/recruiter/dashboard/billing" className="text-sm font-semibold text-theme-600 hover:underline">Upgrade</Link>
            </div>
            <div className="mt-4">
                <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    <p className="text-gray-500 text-lg font-medium">/ {maxValue}</p>
                </div>
                <Progress value={percentage} className="mt-2 h-2 [&>div]:bg-gradient-to-r [&>div]:from-theme-500 [&>div]:to-theme-700"/>
            </div>
        </div>
    );
};

export default function RecruiterDashboard() {
  const supabase = createClient();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found.");

        const { data: recruiter, error: recruiterError } = await supabase.from('recruiters').select('id, credits').eq('user_id', user.id).single();
        if (recruiterError) throw recruiterError;

        const { data: jobs, error: jobsError } = await supabase.from('job_postings').select('id, title, is_active').eq('recruiter_id', recruiter.id);
        if (jobsError) throw jobsError;

        const jobIds = jobs.map(j => j.id);
        const openPositions = jobs.filter(j => j.is_active).length;

        let allApplications: any[] = [];
        let recentApps: any[] = [];
        let performanceData: any[] = [];

        if (jobIds.length > 0) {
            const { data: candidateApps, error: candidateAppsError } = await supabase.from('candidate_applications').select('*, user_profiles(full_name, avatar_url), job_postings(title)').in('job_posting_id', jobIds).order('created_at', { ascending: false });
            if (candidateAppsError) throw candidateAppsError;

            const { data: publicApps, error: publicAppsError } = await supabase.from('public_applications').select('*, job_postings(title)').in('job_id', jobIds).order('created_at', { ascending: false });
            if (publicAppsError) throw publicAppsError;
            
            const formattedPublicApps = publicApps.map(a => ({ ...a, status: 'new', user_profiles: { full_name: a.name } }));
            allApplications = [...(candidateApps || []), ...formattedPublicApps];
            allApplications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            recentApps = allApplications.slice(0, 5);

            performanceData = jobs.map(job => {
                const appCount = allApplications.filter(app => app.job_posting_id === job.id || app.job_id === job.id).length;
                return { name: job.title, applications: appCount, views: Math.floor(appCount * (3 + Math.random() * 7)) }; // Mock views for now
            });
        }

        const totalApplications = allApplications.length;
        const shortlisted = allApplications.filter(a => a.status === 'shortlisted').length;
        
        const funnelData = [
            { name: 'Applied', value: totalApplications, color: '#a78bfa' },
            { name: 'Reviewed', value: allApplications.filter(a => ['reviewed', 'shortlisted', 'interviewing', 'offer', 'hired'].includes(a.status)).length, color: '#9370db' },
            { name: 'Assessment', value: allApplications.filter(a => ['assessment', 'interviewing', 'offer', 'hired'].includes(a.status)).length, color: '#805ad5' },
            { name: 'Interview', value: allApplications.filter(a => ['interviewing', 'offer', 'hired'].includes(a.status)).length, color: '#6b46c1' },
            { name: 'Offer', value: allApplications.filter(a => ['offer', 'hired'].includes(a.status)).length, color: '#553c9a' },
            { name: 'Hired', value: allApplications.filter(a => a.status === 'hired').length, color: '#44337a' }
        ];

        setStats({
            totalApplications,
            shortlisted,
            openPositions,
            credits: recruiter.credits,
            funnelData,
            performanceData,
            activityFeedData: recentApps,
        });

    } catch (error: any) {
        toast({ title: "Error fetching dashboard data", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-gray-50/50">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">
            Dashboard
          </h1>
          <p className="text-gray-500">
            Here's a high-level overview of your recruitment activity.
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 xl:col-span-3">
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            change="+15.2%"
            changeType="increase"
            description="vs. previous 30 days"
            icon={Users}
            isLoading={isLoading}
          />
          <StatCard
            title="Shortlisted"
            value={stats.shortlisted}
            change="-2.8%"
            changeType="decrease"
            description="vs. previous 30 days"
            icon={UserCheck}
            isLoading={isLoading}
          />
          <StatCard
            title="Open Positions"
            value={stats.openPositions}
            change="+5"
            changeType="increase"
            description="New this month"
            icon={Briefcase}
            isLoading={isLoading}
          />
          <CreditCard
            title="AI Credits"
            value={stats.credits}
            maxValue={100}
            isLoading={isLoading}
          />
        </div>

        {/* Charts */}
        <div className="rounded-xl bg-white p-4 shadow-lg border border-gray-100 flex flex-col xl:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Funnel</h3>
            {isLoading ? <div className="flex-1 bg-gray-50 rounded-lg animate-pulse" /> : <ApplicationFunnelChart funnelData={stats.funnelData} />}
        </div>

        <div className="rounded-xl bg-white p-4 shadow-lg border border-gray-100 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Sources</h3>
            <ApplicationSourcesChart />
        </div>

        <div className="rounded-xl bg-white p-4 shadow-lg border border-gray-100 flex flex-col xl:col-span-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Performance</h3>
            <JobPerformanceChart data={stats.performanceData} isLoading={isLoading} />
        </div>
        
        <div className="rounded-xl bg-white p-4 shadow-lg border border-gray-100 flex flex-col xl:col-span-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Activity</h3>
            <ActivityFeed applications={stats.activityFeedData} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
}

function DateRangePicker() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className="w-[300px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}

// Helper to get public CV URL
function getCVUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${path}`
} 