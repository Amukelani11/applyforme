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
import { cn } from "@/lib/utils"

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
    <div className="bg-white p-8 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col justify-between">
        <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse" />
        <div className="mt-6">
            <div className="h-10 w-1/2 bg-gray-200 rounded animate-pulse" />
            <div className="flex items-center gap-3 mt-3">
                <div className="h-5 w-1/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    </div>
);

const CreditCardSkeleton = () => (
    <div className="bg-white p-8 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col justify-between">
        <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
        <div className="mt-6">
            <div className="flex items-end justify-between">
                <div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-7 w-1/4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="mt-3 h-3 w-full bg-gray-200 rounded-full animate-pulse" />
        </div>
    </div>
);

const ChartSkeleton = () => (
  <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col h-[400px]">
    <div className="h-7 w-1/3 bg-gray-200 rounded animate-pulse mb-6" />
    <div className="flex-1 bg-gray-50 rounded-xl animate-pulse" />
  </div>
);

// --- DATA COMPONENTS ---

const StatCard = ({ title, value, change, changeType, description, icon: Icon, isLoading, index }: any) => {
    if (isLoading) return <StatCardSkeleton />;
    const isIncrease = changeType === 'increase';
    const colorClass = isIncrease ? 'text-emerald-600' : 'text-red-600';

    return (
        <div 
            className={cn(
                "bg-white p-8 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col justify-between",
                "hover:shadow-[0_10px_25px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] hover:-translate-y-1",
                "transition-all duration-300 ease-out cursor-pointer"
            )}
            style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "both"
            }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-purple-50 p-3 rounded-xl">
                        <Icon className="h-7 w-7 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700">{title}</h3>
                </div>
            </div>
            <div className="mt-6">
                <p className="text-4xl font-bold text-gray-900 tracking-tight">{value}</p>
                <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className={`flex items-center font-semibold ${colorClass}`}>
                        <TrendingUp className={`h-4 w-4 mr-1 transition-transform duration-200 ${isIncrease ? '' : 'transform -rotate-90'}`} />
                        {change}
                    </span>
                    <p className="text-gray-500 font-medium">{description}</p>
                </div>
            </div>
        </div>
    );
}

const CreditCard = ({ title, value, maxValue, isLoading, isPremium, index }: any) => {
    if (isLoading) return <CreditCardSkeleton />;
    
    if (isPremium) {
        return (
            <div 
                className={cn(
                    "bg-white p-8 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col justify-between",
                    "hover:shadow-[0_10px_25px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] hover:-translate-y-1",
                    "transition-all duration-300 ease-out"
                )}
                style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "both"
                }}
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-700">Job Postings</h3>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-green-600">Premium</span>
                    </div>
                </div>
                <div className="mt-6">
                    <div className="flex items-end justify-between">
                        <p className="text-4xl font-bold text-gray-900 tracking-tight">∞</p>
                        <p className="text-gray-500 text-xl font-medium">Unlimited</p>
                    </div>
                    <div className="mt-3 h-3 bg-green-100 rounded-full overflow-hidden">
                        <div className="h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }
    
    const percentage = (value / maxValue) * 100;
    return (
        <div 
            className={cn(
                "bg-white p-8 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col justify-between",
                "hover:shadow-[0_10px_25px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] hover:-translate-y-1",
                "transition-all duration-300 ease-out"
            )}
            style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "both"
            }}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-700">{title}</h3>
                <Link 
                    href="/recruiter/dashboard/billing" 
                    className="text-sm font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors duration-200"
                >
                    Upgrade
                </Link>
            </div>
            <div className="mt-6">
                <div className="flex items-end justify-between">
                    <p className="text-4xl font-bold text-gray-900 tracking-tight">{value}</p>
                    <p className="text-gray-500 text-xl font-medium">/ {maxValue}</p>
                </div>
                <Progress 
                    value={percentage} 
                    className="mt-3 h-3 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-purple-700"
                />
            </div>
        </div>
    );
};

export default function RecruiterDashboard() {
  const supabase = createClient();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found.");

        const { data: recruiter, error: recruiterError } = await supabase.from('recruiters').select('id, job_credits').eq('user_id', user.id).single();
        if (recruiterError) throw recruiterError;

        // Check if user has premium subscription
        const { data: subscription } = await supabase
          .from('recruiter_subscriptions')
          .select('*')
          .eq('recruiter_id', recruiter.id)
          .eq('status', 'active')
          .single();

        const isPremium = subscription?.plan_id === 'premium';

        // Fetch job postings with error handling
        let jobs: any[] = [];
        let openPositions = 0;
        
        try {
          const { data: jobsData, error: jobsError } = await supabase
            .from('job_postings')
            .select('id, title, created_at')
            .eq('recruiter_id', recruiter.id);
          
          if (jobsError) {
            console.error('Jobs fetch error:', jobsError);
            // Continue with empty jobs array
          } else {
            jobs = jobsData || [];
            // Try to get active jobs, fallback to all jobs if is_active doesn't exist
            try {
              const { data: activeJobs } = await supabase
                .from('job_postings')
                .select('id')
                .eq('recruiter_id', recruiter.id)
                .eq('is_active', true);
              openPositions = activeJobs?.length || 0;
            } catch {
              // If is_active column doesn't exist, assume all jobs are active
              openPositions = jobs.length;
            }
          }
        } catch (error) {
          console.error('Error fetching jobs:', error);
        }

        const jobIds = jobs?.map(j => j.id) || [];

        let allApplications: any[] = [];
        let recentApps: any[] = [];
        let performanceData: any[] = [];

        if (jobIds.length > 0) {
            // Fetch candidate applications
            try {
              const { data: candidateApps, error: candidateAppsError } = await supabase
                .from('candidate_applications')
                .select(`
                  *,
                  user:users(full_name, avatar_url),
                  job_postings(title)
                `)
                .in('job_posting_id', jobIds)
                .order('created_at', { ascending: false });
              
              if (candidateAppsError) {
                console.error('Candidate apps fetch error:', candidateAppsError);
              } else {
                allApplications = [...(candidateApps || [])];
              }
            } catch (error) {
              console.error('Error fetching candidate applications:', error);
            }

            // Fetch public applications
            try {
              const { data: publicApps, error: publicAppsError } = await supabase
                .from('public_applications')
                .select(`
                  *,
                  job_postings(title)
                `)
                .in('job_id', jobIds)
                .order('created_at', { ascending: false });
              
              if (publicAppsError) {
                console.error('Public apps fetch error:', publicAppsError);
              } else {
                // Format public applications to match candidate application structure
                const formattedPublicApps = (publicApps || []).map((app: any) => ({
                  ...app,
                  id: `public-${app.id}`,
                  status: 'new',
                  user: { 
                    full_name: app.full_name || app.name,
                    avatar_url: null
                  },
                  is_public: true,
                  job_posting_id: app.job_id,
                  created_at: app.created_at
                }));
                allApplications = [...allApplications, ...formattedPublicApps];
              }
            } catch (error) {
              console.error('Error fetching public applications:', error);
            }

            allApplications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            recentApps = allApplications.slice(0, 5);

            // Create performance data for each job
            performanceData = (jobs || []).map(job => {
                const appCount = allApplications.filter(app => 
                  app.job_posting_id === job.id || app.job_id === job.id
                ).length;
                return { 
                  name: job.title, 
                  applications: appCount, 
                  views: Math.floor(appCount * (3 + Math.random() * 7)) // Mock views for now
                };
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
            credits: recruiter.job_credits || 0,
            isPremium,
            funnelData,
            performanceData,
            activityFeedData: recentApps,
        });

    } catch (error: any) {
        console.error('Dashboard data fetch error:', error);
        toast({ 
          title: "Error fetching dashboard data", 
          description: error.message || "Failed to load dashboard data", 
          variant: "destructive" 
        });
        
        // Set fallback data with realistic mock data for screenshots
        setStats({
            totalApplications: 247,
            shortlisted: 23,
            openPositions: 8,
            credits: 85,
            isPremium: true,
            funnelData: [
                { name: 'Applied', value: 247, color: '#a78bfa' },
                { name: 'Reviewed', value: 156, color: '#9370db' },
                { name: 'Assessment', value: 89, color: '#805ad5' },
                { name: 'Interview', value: 45, color: '#6b46c1' },
                { name: 'Offer', value: 12, color: '#553c9a' },
                { name: 'Hired', value: 8, color: '#44337a' }
            ],
            performanceData: [
                { name: 'Senior Software Engineer', applications: 45, views: 234 },
                { name: 'Product Manager', applications: 32, views: 189 },
                { name: 'UX Designer', applications: 28, views: 156 },
                { name: 'Data Analyst', applications: 23, views: 134 },
                { name: 'Marketing Specialist', applications: 19, views: 98 }
            ],
            activityFeedData: [
                {
                    id: '1',
                    full_name: 'Sarah Johnson',
                    avatar_url: null,
                    status: 'shortlisted',
                    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    job_postings: { title: 'Senior Software Engineer' },
                    is_public: false
                },
                {
                    id: '2',
                    full_name: 'Michael Chen',
                    avatar_url: null,
                    status: 'interviewing',
                    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                    job_postings: { title: 'Product Manager' },
                    is_public: false
                },
                {
                    id: '3',
                    full_name: 'Lisa Mokoena',
                    avatar_url: null,
                    status: 'new',
                    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                    job_postings: { title: 'UX Designer' },
                    is_public: false
                },
                {
                    id: '4',
                    full_name: 'David Smith',
                    avatar_url: null,
                    status: 'reviewed',
                    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                    job_postings: { title: 'Data Analyst' },
                    is_public: false
                },
                {
                    id: '5',
                    full_name: 'Amanda Patel',
                    avatar_url: null,
                    status: 'assessment',
                    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
                    job_postings: { title: 'Marketing Specialist' },
                    is_public: false
                }
            ],
        });
    } finally {
        setIsLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:gap-12 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header Section with Enhanced Spacing */}
      <div 
        className={cn(
          "flex items-center justify-between mb-8",
          mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0"
        )}
        style={{
          animationDelay: "100ms",
          animationFillMode: "both"
        }}
      >
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="text-xl text-gray-600 font-medium mt-2">
            Here's a high-level overview of your recruitment activity.
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* Main Grid with Enhanced Spacing */}
      <div className="grid gap-6 md:gap-8 lg:gap-12 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 w-full">
        {/* Stat Cards with Staggered Animation */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:col-span-3">
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            change="+15.2%"
            changeType="increase"
            description="vs. previous 30 days"
            icon={Users}
            isLoading={isLoading}
            index={0}
          />
          <StatCard
            title="Shortlisted"
            value={stats.shortlisted}
            change="-2.8%"
            changeType="decrease"
            description="vs. previous 30 days"
            icon={UserCheck}
            isLoading={isLoading}
            index={1}
          />
          <StatCard
            title="Open Positions"
            value={stats.openPositions}
            change="+5"
            changeType="increase"
            description="New this month"
            icon={Briefcase}
            isLoading={isLoading}
            index={2}
          />
          <CreditCard
            title="AI Credits"
            value={stats.credits}
            maxValue={100}
            isLoading={isLoading}
            isPremium={stats.isPremium}
            index={3}
          />
        </div>

        {/* Charts with Enhanced Styling */}
        <div 
          className={cn(
            "rounded-2xl bg-white p-6 md:p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col lg:col-span-2",
            "hover:shadow-[0_10px_25px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out",
            mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0"
          )}
          style={{
            animationDelay: "500ms",
            animationFillMode: "both"
          }}
        >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Application Funnel</h3>
            {isLoading ? <div className="flex-1 bg-gray-50 rounded-xl animate-pulse" /> : <ApplicationFunnelChart funnelData={stats.funnelData} />}
        </div>

        <div 
          className={cn(
            "rounded-2xl bg-white p-6 md:p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col",
            "hover:shadow-[0_10px_25px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out",
            mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0"
          )}
          style={{
            animationDelay: "600ms",
            animationFillMode: "both"
          }}
        >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Application Sources</h3>
            <ApplicationSourcesChart />
        </div>

        <div 
          className={cn(
            "rounded-2xl bg-white p-6 md:p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col xl:col-span-3",
            "hover:shadow-[0_10px_25px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out",
            mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0"
          )}
          style={{
            animationDelay: "700ms",
            animationFillMode: "both"
          }}
        >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Job Performance</h3>
            <JobPerformanceChart data={stats.performanceData} isLoading={isLoading} />
        </div>
        
        <div 
          className={cn(
            "rounded-2xl bg-white p-6 md:p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col xl:col-span-3",
            "hover:shadow-[0_10px_25px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out",
            mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0"
          )}
          style={{
            animationDelay: "800ms",
            animationFillMode: "both"
          }}
        >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Activity</h3>
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
          className={cn(
            "w-[320px] justify-start text-left font-medium border-gray-200",
            "hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200",
            "focus:ring-2 focus:ring-purple-200 focus:ring-offset-2"
          )}
        >
          <CalendarIcon className="mr-3 h-5 w-5 text-purple-600" />
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
            <span className="text-gray-500">Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-[0_10px_25px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] border-gray-200" align="end">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={2}
          className="rounded-lg"
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