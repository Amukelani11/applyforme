import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getInitials } from "@/lib/utils"
import Link from 'next/link'
import { FileText } from 'lucide-react';
import { motion } from "framer-motion";

function timeAgo(date: string) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
}

const ActivitySkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
             <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
            </div>
        ))}
    </div>
);

export function ActivityFeed({ applications, isLoading }: { applications?: any[], isLoading?: boolean }) {

  if (isLoading) {
      return <ActivitySkeleton />;
  }
  
  if (!applications || applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
          <FileText className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-lg text-gray-700">No Recent Activity</h3>
          <p className="text-sm">New applications will appear here as they come in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app, index) => (
        <motion.div 
            key={app.id} 
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={app.user_profiles?.avatar_url} alt={app.user_profiles?.full_name} />
            <AvatarFallback>{getInitials(app.user_profiles?.full_name || app.name || 'A')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
                <span className="font-bold">{app.user_profiles?.full_name || app.name}</span> applied for <Link href={`/recruiter/jobs/${app.job_posting_id || app.job_id}/applications/${app.id}`} className="font-bold text-theme-600 hover:underline">{app.job_postings?.title || 'a job'}</Link>.
            </p>
            <p className="text-xs text-gray-500">{timeAgo(app.created_at)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
} 