"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, UserCheck, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
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
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                        <Icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className={cn("text-xs font-medium", colorClass)}>
                                {change}
                            </span>
                            <span className="text-xs text-gray-500">{description}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <div className="text-3xl font-bold text-gray-900">
                    <AnimatedCounter value={value} />
                </div>
            </div>
        </div>
    );
};

const CreditCard = ({ title, value, maxValue, isLoading, isPremium, index }: any) => {
    if (isLoading) return <CreditCardSkeleton />;
    const percentage = (value / maxValue) * 100;

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
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        {isPremium && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                                Premium
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <div className="flex items-end justify-between mb-3">
                    <div className="text-3xl font-bold text-gray-900">
                        <AnimatedCounter value={value} />
                    </div>
                    <div className="text-sm text-gray-500">/ {maxValue}</div>
                </div>
                <Progress value={percentage} className="h-2" />
            </div>
        </div>
    );
};

export default function AdDashboard() {
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
    
    // Set mock data for ad screenshot purposes
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
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <main className="flex flex-1 flex-col gap-8 p-4 md:gap-12 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">

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
            <ApplicationSourcesChart 
              data={[
                { name: 'Public Job Links', value: 89, color: '#8b5cf6' },
                { name: 'LinkedIn', value: 67, color: '#a78bfa' },
                { name: 'Indeed', value: 45, color: '#c4b5fd' },
                { name: 'Referral', value: 23, color: '#ddd6fe' },
                { name: 'Direct Applications', value: 23, color: '#ede9fe' }
              ]} 
              isLoading={isLoading}
            />
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



function getCVUrl(path: string) {
  if (!path) return null;
  const supabase = createClient();
  const { data } = supabase.storage.from('cvs').getPublicUrl(path);
  return data.publicUrl;
} 