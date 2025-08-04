import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getInitials } from "@/lib/utils"
import Link from 'next/link'
import { FileText, Circle } from 'lucide-react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"

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
      {applications.map((app, index) => {
        const isUnread = app.is_read === false;
        const userName = app.user?.full_name || app.user_profiles?.full_name || app.name || 'Unknown Candidate';
        const userAvatar = app.user?.avatar_url || app.user_profiles?.avatar_url;
        
        return (
          <motion.div 
              key={app.id} 
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-all duration-200",
                isUnread ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-50"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
          >
            <div className="relative">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
              </Avatar>
              {isUnread && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={cn(
                  "text-sm font-medium",
                  isUnread ? "text-blue-900" : "text-gray-800"
                )}>
                    <span className={cn("font-bold", isUnread && "text-blue-700")}>
                      {userName}
                    </span> applied for{" "}
                    <Link 
                      href={`/recruiter/jobs/${app.job_posting_id || app.job_id}/applications/${app.id}${app.is_public ? '?public=true' : ''}`} 
                      className={cn(
                        "font-bold hover:underline",
                        isUnread ? "text-blue-600" : "text-theme-600"
                      )}
                    >
                      {app.job_postings?.title || 'a job'}
                    </Link>.
                </p>
                {isUnread && (
                  <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {timeAgo(app.created_at)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
} 