"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, MessageSquare, Star, UserCheck, Activity, FileText } from 'lucide-react'
import { CandidateNotes } from './candidate-notes'
import { CandidateRating } from './candidate-rating'
import { CandidateAssignment } from './candidate-assignment'
import { ActivityLog } from './activity-log'

interface CollaborationPanelProps {
  applicationId: string
  applicationType: 'candidate' | 'public'
  recruiterId: string
}

export function CollaborationPanel({ applicationId, applicationType, recruiterId }: CollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState('notes')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Collaboration</h2>
          <p className="text-gray-600">Work together to evaluate and manage this candidate</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Users className="w-4 h-4 mr-1" />
            Team Mode
          </Badge>
        </div>
      </div>

      {/* Collaboration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Ratings
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-6">
          <CandidateNotes 
            applicationId={applicationId}
            applicationType={applicationType}
            recruiterId={recruiterId}
          />
        </TabsContent>

        <TabsContent value="ratings" className="mt-6">
          <CandidateRating 
            applicationId={applicationId}
            applicationType={applicationType}
            recruiterId={recruiterId}
          />
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <CandidateAssignment 
            applicationId={applicationId}
            applicationType={applicationType}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityLog 
            applicationId={applicationId}
            applicationType={applicationType}
          />
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Interview Feedback Forms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Interview feedback forms coming soon!</p>
                <p className="text-sm mt-1">Create custom feedback forms for different interview stages.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('notes')}
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Add Note</span>
            </button>
            
            <button
              onClick={() => setActiveTab('ratings')}
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Star className="w-6 h-6 text-yellow-600 mb-2" />
              <span className="text-sm font-medium">Rate Candidate</span>
            </button>
            
            <button
              onClick={() => setActiveTab('assignments')}
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserCheck className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium">Assign Task</span>
            </button>
            
            <button
              onClick={() => setActiveTab('activity')}
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Activity className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-sm font-medium">View Activity</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 