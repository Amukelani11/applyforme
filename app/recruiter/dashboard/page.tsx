"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
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
                {change && changeType && description && (
                    <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className={`flex items-center font-semibold ${changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'}`}>
                            <TrendingUp className={`h-4 w-4 mr-1 ${changeType === 'increase' ? '' : 'transform -rotate-90'}`} />
                        {change}
                    </span>
                        <p className="text-gray-500">{description}</p>
                </div>
                )}
            </div>
        </div>
    );
}

const CreditCard = ({ title, value, maxValue, isLoading }: any) => {
    if (isLoading) return <CreditCardSkeleton />;
    return (
        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-gray-600">{title}</h3>
                <Link href="/recruiter/dashboard/billing" className="text-sm font-semibold text-theme-600 hover:underline">Manage</Link>
            </div>
            <div className="mt-4">
                <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-gray-900">∞</p>
                    <p className="text-gray-500 text-lg font-medium">/ ∞</p>
                </div>
                <Progress value={100} className="mt-2 h-2 [&>div]:bg-green-500"/>
            </div>
        </div>
    );
};

function RecruiterDashboardContent() {
  const supabase = createClient();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [trialInfo, setTrialInfo] = useState<any>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found.");

        // Try owner recruiter first
        let { data: recruiter, error: recruiterError } = await supabase
          .from('recruiters')
          .select('id, job_credits')
          .eq('user_id', user.id)
          .maybeSingle();

        // Fallback: if not owner, infer via team membership
        if (!recruiter) {
          const { data: membership } = await supabase
            .from('team_members')
            .select('recruiter_id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();

          if (!membership?.recruiter_id) {
            throw recruiterError || new Error('Recruiter profile not found for this user');
          }

          const { data: teamRecruiter } = await supabase
            .from('recruiters')
            .select('id, job_credits')
            .eq('id', membership.recruiter_id)
            .maybeSingle();

          // If RLS prevents selecting the recruiter row, fallback to membership ID
          recruiter = teamRecruiter || { id: membership.recruiter_id, job_credits: 0 }
        }
        console.log('Recruiter data:', recruiter);

                 // Fetch trial information - simplified to avoid column issues
         let trialInfo: any = null;
         try {
           const { data: userData, error: userError } = await supabase
             .from('users')
             .select('*')
             .eq('id', user.id)
             .single();
           
           if (!userError && userData) {
             console.log('User data:', userData);
             // Check if trial-related fields exist
             if (userData.subscription_status === 'trial' && userData.trial_end_date) {
               const trialEndDate = new Date(userData.trial_end_date);
               const now = new Date();
               const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
               
               trialInfo = {
                 daysLeft: Math.max(0, daysLeft),
                 trialEndDate: userData.trial_end_date,
                 isActive: daysLeft > 0
               };
             }
           }
                  } catch (error) {
           console.log('Trial info fetch error (non-critical):', error);
         }

         setTrialInfo(trialInfo);

        const { data: jobs, error: jobsError } = await supabase.from('job_postings').select('id, title').eq('recruiter_id', recruiter.id);
        if (jobsError) {
            console.error('Jobs fetch error:', jobsError);
            throw jobsError;
        }
        console.log('Jobs data:', jobs);

        const jobIds = (jobs || []).map(j => j.id);
        const openPositions = jobs.length; // All jobs are considered open positions

        let allApplications: any[] = [];
        let recentApps: any[] = [];
        let performanceData: any[] = [];
        let sourceData: any[] = [];

        if (jobIds.length > 0) {
            console.log('Fetching applications for job IDs:', jobIds);
            
                         const { data: candidateApps, error: candidateAppsError } = await supabase
                 .from('candidate_applications')
                 .select('*, users(full_name), job_postings(title)')
                 .in('job_posting_id', jobIds)
                 .order('created_at', { ascending: false });
            
            if (candidateAppsError) {
                console.error('Candidate apps error:', candidateAppsError);
                throw candidateAppsError;
            }
            console.log('Candidate applications:', candidateApps);

            const { data: publicApps, error: publicAppsError } = await supabase
                .from('public_applications')
                .select('*, job_postings(title)')
                .in('job_id', jobIds)
                .order('created_at', { ascending: false });
            
            if (publicAppsError) {
                console.error('Public apps error:', publicAppsError);
                throw publicAppsError;
            }
            console.log('Public applications:', publicApps);
            
            const formattedPublicApps = publicApps.map(a => ({ 
                ...a, 
                status: a.status || 'new', 
                user_profiles: { full_name: a.name },
                job_posting_id: a.job_id // Ensure consistent field name
            }));
            
            allApplications = [...(candidateApps || []), ...formattedPublicApps];
            allApplications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            recentApps = allApplications.slice(0, 5);

            performanceData = jobs.map(job => {
                const appCount = allApplications.filter(app => 
                    app.job_posting_id === job.id || app.job_id === job.id
                ).length;
                return { 
                    name: job.title, 
                    applications: appCount, 
                    views: Math.floor(appCount * (3 + Math.random() * 7)) 
                };
            });
            
            console.log('Performance data:', performanceData);

            // Generate real source data based on actual application data
            const candidateAppCount = candidateApps?.length || 0;
            const publicAppCount = publicApps?.length || 0;
            
            // Create meaningful source data based on what we actually have
            sourceData = [
                { 
                    name: 'Platform Users', 
                    value: candidateAppCount, 
                    color: '#8b5cf6',
                    description: 'Registered users applying through the platform'
                },
                { 
                    name: 'Public Applications', 
                    value: publicAppCount, 
                    color: '#a78bfa',
                    description: 'Direct applications from job postings'
                }
            ].filter(source => source.value > 0); // Only show sources that have actual data
        }

        const totalApplications = allApplications.length;
        const shortlisted = allApplications.filter(a => a.status === 'shortlisted').length;
        
        console.log('Total applications:', totalApplications);
        console.log('Shortlisted applications:', shortlisted);
        console.log('Open positions:', openPositions);
        console.log('All applications:', allApplications);
        
        // Calculate funnel data using our actual status set
        // candidate_applications.status: 'pending' | 'shortlisted' | 'interviewed' | 'rejected' | 'hired'
        const reviewedCount = allApplications.filter(a => ['shortlisted', 'interviewed', 'rejected', 'hired'].includes(a.status)).length;
        const assessmentCount = allApplications.filter(a => ['shortlisted'].includes(a.status)).length;
        const interviewCount = allApplications.filter(a => ['interviewed'].includes(a.status)).length;
        const offerCount = allApplications.filter(a => ['offer'].includes(a.status)).length; // keep if exists
        const hiredCount = allApplications.filter(a => a.status === 'hired').length;
        
        console.log('Funnel calculations:', {
            totalApplications,
            reviewedCount,
            assessmentCount,
            interviewCount,
            offerCount,
            hiredCount
        });
        
        const funnelData = [
            { name: 'Applied', value: totalApplications, color: '#a78bfa' },
            { name: 'Reviewed', value: reviewedCount, color: '#9370db' },
            { name: 'Assessment', value: assessmentCount, color: '#805ad5' },
            { name: 'Interview', value: interviewCount, color: '#6b46c1' },
            { name: 'Offer', value: offerCount, color: '#553c9a' },
            { name: 'Hired', value: hiredCount, color: '#44337a' }
        ];

        const finalStats = {
            totalApplications,
            shortlisted,
            openPositions,
            credits: recruiter.job_credits,
            funnelData,
            performanceData,
            sourceData,
            activityFeedData: recentApps,
        };
        
        console.log('Final stats object:', finalStats);
        setStats(finalStats);

    } catch (error: any) {
        toast({ title: "Error fetching dashboard data", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Trial Banner Component
  const TrialBanner = ({ trialInfo }: { trialInfo: any }) => {
    if (!trialInfo || !trialInfo.isActive) return null;

    const getBannerColor = (daysLeft: number) => {
      if (daysLeft <= 3) return 'bg-red-50 border-red-200 text-red-800';
      if (daysLeft <= 7) return 'bg-orange-50 border-orange-200 text-orange-800';
      return 'bg-blue-50 border-blue-200 text-blue-800';
    };

    const getBannerIcon = (daysLeft: number) => {
      if (daysLeft <= 3) return '🚨';
      if (daysLeft <= 7) return '⚠️';
      return '⏰';
    };

    const bannerColor = getBannerColor(trialInfo.daysLeft);
    const bannerIcon = getBannerIcon(trialInfo.daysLeft);

    return (
      <div className={`rounded-lg border p-4 mb-6 ${bannerColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{bannerIcon}</span>
            <div>
              <h3 className="font-semibold">
                {trialInfo.daysLeft === 0 
                  ? "Your trial has expired!" 
                  : `Trial ends in ${trialInfo.daysLeft} day${trialInfo.daysLeft === 1 ? '' : 's'}`
                }
              </h3>
              <p className="text-sm opacity-90">
                {trialInfo.daysLeft === 0 
                  ? "Upgrade to continue using all features"
                  : `Upgrade now to keep your access after ${new Date(trialInfo.trialEndDate).toLocaleDateString()}`
                }
              </p>
            </div>
          </div>
          <Link href="/recruiter/dashboard/billing">
            <Button 
              variant={trialInfo.daysLeft <= 3 ? "destructive" : "default"}
              size="sm"
              className="whitespace-nowrap"
            >
              {trialInfo.daysLeft === 0 ? "Upgrade Now" : "Upgrade"}
            </Button>
          </Link>
        </div>
      </div>
    );
  };

    // Debug logging for render
  console.log('Dashboard render - stats:', stats);
  console.log('Dashboard render - isLoading:', isLoading);
  console.log('Dashboard render - funnelData:', stats.funnelData);
  console.log('Dashboard render - activityFeedData:', stats.activityFeedData);

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

      {/* Trial Banner */}
      <TrialBanner trialInfo={trialInfo} />

      {/* Main Grid */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {/* Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 xl:col-span-3">
          <StatCard
            title="Total Applications"
             value={stats.totalApplications || 0}
            icon={Users}
            isLoading={isLoading}
          />
          <StatCard
            title="Shortlisted"
             value={stats.shortlisted || 0}
            icon={UserCheck}
            isLoading={isLoading}
          />
          <StatCard
            title="Open Positions"
             value={stats.openPositions || 0}
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
            <ApplicationSourcesChart data={stats.sourceData} isLoading={isLoading} />
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

export default function RecruiterDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c084fc] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <RecruiterDashboardContent />
    </Suspense>
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