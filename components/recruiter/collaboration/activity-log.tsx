"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Activity, Eye, MessageSquare, Star, UserCheck, Calendar, FileText, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityLogEntry {
  id: string
  action_type: 'viewed' | 'commented' | 'rated' | 'assigned' | 'status_changed' | 'interview_scheduled' | 'feedback_submitted' | 'note_added' | 'shortlisted' | 'rejected' | 'hired' | 'withdrawn'
  action_details?: any
  created_at: string
  user: {
    full_name: string
    email: string
  }
}

interface ActivityLogProps {
  applicationId: string
  applicationType: 'candidate' | 'public'
}

const actionLabels = {
  viewed: 'Viewed Application',
  commented: 'Added Comment',
  rated: 'Rated Candidate',
  assigned: 'Assigned Task',
  status_changed: 'Changed Status',
  interview_scheduled: 'Scheduled Interview',
  feedback_submitted: 'Submitted Feedback',
  note_added: 'Added Note',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  hired: 'Hired',
  withdrawn: 'Withdrawn'
}

const actionIcons = {
  viewed: Eye,
  commented: MessageSquare,
  rated: Star,
  assigned: UserCheck,
  status_changed: ArrowRight,
  interview_scheduled: Calendar,
  feedback_submitted: FileText,
  note_added: MessageSquare,
  shortlisted: CheckCircle,
  rejected: XCircle,
  hired: CheckCircle,
  withdrawn: XCircle
}

const actionColors = {
  viewed: 'bg-gray-100 text-gray-800',
  commented: 'bg-blue-100 text-blue-800',
  rated: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-purple-100 text-purple-800',
  status_changed: 'bg-indigo-100 text-indigo-800',
  interview_scheduled: 'bg-green-100 text-green-800',
  feedback_submitted: 'bg-orange-100 text-orange-800',
  note_added: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  hired: 'bg-emerald-100 text-emerald-800',
  withdrawn: 'bg-gray-100 text-gray-800'
}

export function ActivityLog({ applicationId, applicationType }: ActivityLogProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchActivities()
  }, [applicationId])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('candidate_activity_log')
        .select(`
          *,
          user:users(full_name, email)
        `)
        .eq('application_id', applicationId)
        .eq('application_type', applicationType)
        .order('created_at', { ascending: false })

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
      toast({
        title: "Error",
        description: "Failed to load activity log",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getActionDescription = (activity: ActivityLogEntry) => {
    const baseDescription = actionLabels[activity.action_type]
    
    if (activity.action_details) {
      switch (activity.action_type) {
        case 'status_changed':
          return `${baseDescription} from "${activity.action_details.from}" to "${activity.action_details.to}"`
        case 'rated':
          return `${baseDescription} (${activity.action_details.rating}/5)`
        case 'assigned':
          return `${baseDescription} to ${activity.action_details.assigned_to}`
        case 'interview_scheduled':
          return `${baseDescription} for ${activity.action_details.date}`
        case 'commented':
        case 'note_added':
          return `${baseDescription}: "${activity.action_details.text?.substring(0, 50)}${activity.action_details.text?.length > 50 ? '...' : ''}"`
        default:
          return baseDescription
      }
    }
    
    return baseDescription
  }

  const logActivity = async (actionType: string, actionDetails?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('candidate_activity_log')
        .insert({
          application_id: applicationId,
          application_type: applicationType,
          user_id: user.id,
          action_type: actionType,
          action_details: actionDetails
        })

      if (error) throw error
      
      // Refresh activities
      await fetchActivities()
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  // Expose logActivity function for parent components
  useEffect(() => {
    // @ts-ignore
    window.logActivity = logActivity
  }, [applicationId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No activity yet. Actions will appear here as they happen.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const ActionIcon = actionIcons[activity.action_type]
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg bg-white">
                    <div className="flex-shrink-0">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs">
                          {activity.user?.full_name?.charAt(0) || activity.user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {activity.user?.full_name || activity.user?.email}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${actionColors[activity.action_type]}`}
                        >
                          <ActionIcon className="w-3 h-3 mr-1" />
                          {actionLabels[activity.action_type]}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-1">
                        {getActionDescription(activity)}
                      </p>
                      
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 